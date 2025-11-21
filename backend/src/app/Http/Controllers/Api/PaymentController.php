<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\Branch;
use App\Models\MenuItem;
use App\Services\StripePaymentService;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    /**
     * Create a payment intent for an order
     */
    public function createPaymentIntent(Request $request): JsonResponse
    {
        $request->validate([
            'order_id' => 'required|exists:orders,id',
            'payment_method' => 'string|in:card,test_card'
        ]);

        try {
            $order = Order::with(['branch', 'items.menuItem'])->findOrFail($request->order_id);
            
            // Verify order is in correct state for payment
            if ($order->payment_status === 'paid') {
                return response()->json([
                    'success' => false,
                    'message' => 'Order is already paid'
                ], 400);
            }

            $stripeService = new StripePaymentService();
            $paymentIntent = $stripeService->createPaymentIntent($order, [
                'capture_method' => 'automatic'
            ]);

            return response()->json([
                'success' => true,
                'data' => [
                    'client_secret' => $paymentIntent->client_secret,
                    'payment_intent_id' => $paymentIntent->id,
                    'amount' => $order->total_amount,
                    'currency' => 'eur',
                    'order' => $order
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to create payment intent', [
                'order_id' => $request->order_id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create payment intent: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create a test order with real payment using test card
     */
    public function createTestOrderWithPayment(Request $request, int $branchId): JsonResponse
    {
        $request->validate([
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email',
            'customer_phone' => 'nullable|string|max:20',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|integer',
            'items.*.quantity' => 'required|integer|min:1',
            'notes' => 'nullable|string|max:500',
            'use_test_card' => 'boolean'
        ]);

        DB::beginTransaction();
        try {
            // Verify branch exists and get menu
            $branch = Branch::findOrFail($branchId);
            $menu = $branch->menus()->where('is_active', true)->first();
            
            if (!$menu) {
                throw new \Exception('No active menu found for this branch');
            }
            
            // Calculate totals and validate items belong to branch
            $subtotal = 0;
            $orderItems = [];
            
            foreach ($request->items as $item) {
                // Verify menu item belongs to this branch's menu
                $menuItem = MenuItem::where('id', $item['menu_item_id'])
                    ->where('menu_id', $menu->id)
                    ->where('is_available', true)
                    ->first();
                    
                if (!$menuItem) {
                    throw new \Exception("Menu item {$item['menu_item_id']} not found or not available for this branch");
                }
                
                $itemTotal = $menuItem->price * $item['quantity'];
                $subtotal += $itemTotal;
                
                $orderItems[] = [
                    'menu_item_id' => $menuItem->id,
                    'quantity' => $item['quantity'],
                    'price_at_time' => $menuItem->price, // Required field
                    'unit_price' => $menuItem->price,
                    'total_price' => $itemTotal,
                    'item_name' => $menuItem->name
                ];
            }
            
            $taxAmount = $subtotal * 0.22; // 22% VAT
            $totalAmount = $subtotal + $taxAmount;
            
            // Commission calculation (5% to QoffeRun, 95% to branch)
            $commissionRate = 5.0;
            $commissionAmount = $totalAmount * ($commissionRate / 100);
            $branchAmount = $totalAmount - $commissionAmount;
            
            // Generate order number and pickup code
            $orderNumber = 'ORD-' . date('Ymd') . '-' . str_pad(rand(1, 9999), 4, '0', STR_PAD_LEFT);
            $pickupCode = str_pad(rand(1000, 9999), 4, '0', STR_PAD_LEFT);
            
            // Create order
            $order = Order::create([
                'branch_id' => $branchId,
                'chain_id' => $branch->chain_id,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'order_number' => $orderNumber,
                'subtotal_amount' => $subtotal,
                'tax_amount' => $taxAmount,
                'total_amount' => $totalAmount,
                'total' => $totalAmount, // Legacy field - keep both for compatibility
                'commission_rate' => $commissionRate,
                'commission_amount' => $commissionAmount,
                'branch_amount' => $branchAmount,
                'currency' => 'EUR',
                'code_4digit' => $pickupCode,
                'status' => 'pending',
                'payment_status' => 'failed', // Will update to 'paid' after payment
                'order_type' => 'takeaway', // Use valid enum value
                'notes' => $request->notes
            ]);
            
            // Create order items
            foreach ($orderItems as $item) {
                $order->items()->create($item);
            }

            // Create payment intent
            $stripeService = new StripePaymentService();
            $paymentIntent = $stripeService->createPaymentIntent($order);

            DB::commit();

            // If using test card, simulate immediate payment
            if ($request->use_test_card) {
                $testResult = $this->simulateTestCardPayment($order, $paymentIntent);
                
                return response()->json([
                    'success' => true,
                    'message' => 'Order created and payment simulated with test card',
                    'data' => [
                        'order' => $order->fresh(['items.menuItem']),
                        'payment_intent_id' => $paymentIntent->id,
                        'client_secret' => $paymentIntent->client_secret,
                        'test_payment_result' => $testResult
                    ]
                ]);
            }

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => [
                    'order' => $order->fresh(['items.menuItem']),
                    'payment_intent_id' => $paymentIntent->id,
                    'client_secret' => $paymentIntent->client_secret
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            
            Log::error('Failed to create test order with payment', [
                'branch_id' => $branchId,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simulate test card payment (for demo purposes)
     */
    private function simulateTestCardPayment(Order $order, $paymentIntent): array
    {
        try {
            // In a real implementation, you would use Stripe's test cards
            // For demo, we'll simulate successful payment
            
            Log::info('Simulating test card payment', [
                'order_id' => $order->id,
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $order->total_amount
            ]);

            // Update order payment status
            $order->update([
                'payment_status' => 'paid',
                'payment_confirmed_at' => now()
            ]);

            return [
                'success' => true,
                'payment_method' => 'test_card_4242424242424242',
                'amount_paid' => $order->total_amount,
                'payment_confirmed_at' => now()->toISOString(),
                'message' => 'Test card payment successful'
            ];

        } catch (\Exception $e) {
            Log::error('Test card payment simulation failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Confirm payment and update order status
     */
    public function confirmPayment(Request $request): JsonResponse
    {
        $request->validate([
            'payment_intent_id' => 'required|string',
            'order_id' => 'required|exists:orders,id'
        ]);

        try {
            $order = Order::findOrFail($request->order_id);
            
            // Verify payment intent matches order
            if ($order->stripe_payment_intent_id !== $request->payment_intent_id) {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment intent does not match order'
                ], 400);
            }

            // Update payment status
            $order->update([
                'payment_status' => 'paid',
                'payment_confirmed_at' => now(),
                'status' => 'confirmed'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment confirmed successfully',
                'data' => $order->fresh()
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to confirm payment', [
                'payment_intent_id' => $request->payment_intent_id,
                'order_id' => $request->order_id,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to confirm payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create test funds using special Stripe test card
     */
    public function createTestFunds(Request $request): JsonResponse
    {
        $request->validate([
            'amount' => 'required|integer|min:100|max:100000', // Amount in cents
            'currency' => 'string|in:eur,usd',
            'description' => 'string|max:255',
            'payment_method' => 'required|string'
        ]);

        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            
            // Create payment intent with special test card that adds to available balance
            $paymentIntent = $stripe->paymentIntents->create([
                'amount' => $request->amount,
                'currency' => $request->currency ?? 'eur',
                'payment_method' => $request->payment_method,
                'description' => $request->description ?? 'Test funds for QoffeRun payment capture',
                'confirm' => true,
                'return_url' => config('app.url') . '/stripe-funds-test.html'
            ]);

            Log::info('Test funds payment intent created', [
                'payment_intent_id' => $paymentIntent->id,
                'amount' => $request->amount,
                'currency' => $request->currency ?? 'eur'
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Test funds payment intent created successfully',
                'payment_intent_id' => $paymentIntent->id,
                'client_secret' => $paymentIntent->client_secret,
                'amount' => $request->amount,
                'currency' => $request->currency ?? 'eur'
            ]);

        } catch (\Stripe\Exception\CardException $e) {
            Log::error('Test funds card error', [
                'error' => $e->getError()->message,
                'code' => $e->getError()->code
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Card error: ' . $e->getError()->message
            ], 400);

        } catch (\Exception $e) {
            Log::error('Test funds creation failed', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create test funds: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get Stripe account balance
     */
    public function getStripeBalance(): JsonResponse
    {
        try {
            $stripe = new \Stripe\StripeClient(config('services.stripe.secret'));
            $balance = $stripe->balance->retrieve();

            return response()->json([
                'success' => true,
                'balance' => [
                    'available' => $balance->available,
                    'pending' => $balance->pending
                ]
            ]);

        } catch (\Exception $e) {
            Log::error('Failed to retrieve Stripe balance', [
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve balance: ' . $e->getMessage()
            ], 500);
        }
    }
}
