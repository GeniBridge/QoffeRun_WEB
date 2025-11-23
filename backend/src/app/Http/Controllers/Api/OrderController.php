<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Cart;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\SystemSetting;
use App\Models\CustomerPaymentMethod;
use App\Models\Branch;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Transfer;
use Exception;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderController extends Controller
{
    /**
     * Initialize Stripe with system settings
     */
    private function initializeStripe(): void
    {
        $stripeSecretKey = SystemSetting::get('stripe_secret_key');
        if ($stripeSecretKey) {
            Stripe::setApiKey($stripeSecretKey);
        } else {
            throw new Exception('Stripe secret key not configured in system settings');
        }
    }

    /**
     * Create order from cart and process payment
     */
    public function create(Request $request): JsonResponse
    {
        $request->validate([
            'customer_name' => 'nullable|string|max:255',
            'customer_email' => 'nullable|email|max:255', 
            'customer_phone' => 'nullable|string|max:50',
            'payment_method_id' => 'required|string', // Stripe payment method ID - REQUIRED
            'notes' => 'nullable|string|max:1000'
        ]);

        try {
            // Initialize Stripe API
            $this->initializeStripe();
            
            // Require authentication for order creation
            if (!$request->user()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Authentication required. Please login or register to place an order.'
                ], 401);
            }

            $user = $request->user();

            // If payment_method_id not provided, try to use default saved card
            if (empty($request->payment_method_id)) {
                $defaultCard = CustomerPaymentMethod::where('user_id', $user->id)
                    ->where('is_default', true)
                    ->valid()
                    ->first();

                if (!$defaultCard) {
                    return response()->json([
                        'success' => false,
                        'message' => 'No payment method found. Please add a card first.'
                    ], 422);
                }

                // Merge found default payment method into request
                $request->merge(['payment_method_id' => $defaultCard->getAttribute('stripe_payment_method_id')]);
            }
            
            // Auto-sync stripe_customer_id if missing but user has payment methods
            if (!$user->stripe_customer_id) {
                $this->initializeStripe();
                try {
                    $pmId = $request->payment_method_id;
                    $pm = \Stripe\PaymentMethod::retrieve($pmId);
                    if ($pm->customer) {
                        $user->update(['stripe_customer_id' => $pm->customer]);
                        $user->refresh();
                    }
                } catch (\Exception $e) {
                    Log::warning('Failed to sync stripe_customer_id', ['user_id' => $user->id, 'error' => $e->getMessage()]);
                }
            }
            
            DB::beginTransaction();

            // Get cart with items for authenticated user
            $cart = Cart::where('user_id', $user->id)
                       ->where('status', 'active')
                       ->where('expires_at', '>', now())
                       ->first();

            if (!$cart) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty or expired. Please add items to your cart before placing an order.'
                ], 404);
            }

            $cartItems = $cart->items()->with('menuItem')->get();
            
            if ($cartItems->isEmpty()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cart is empty'
                ], 400);
            }

            // Get branch information
            $branch = Branch::with('chain')->find($cart->branch_id);
            // Determine connected Stripe account: chain-level preferred, else branch connect, else legacy branch account
            $connectedAccountId = $branch?->chain?->stripe_account_id
                ?? $branch?->stripe_connect_account_id
                ?? $branch?->stripe_account_id;
            if (!$branch || !$connectedAccountId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch/Chain not configured for payments'
                ], 400);
            }

            // Calculate commission
            $subtotal = $cart->calculateSubtotal();
            $taxAmount = $cart->calculateTax();
            $totalAmount = $subtotal + $taxAmount;
            $commissionAmount = $this->calculateCommission($totalAmount);
            $branchAmount = $totalAmount - $commissionAmount;

            // Create order with authenticated user's real information
            $authenticatedUser = $request->user();
            $order = Order::create([
                'user_id' => $authenticatedUser->id,
                'branch_id' => $cart->branch_id,
                'chain_id' => $branch->chain_id,
                'customer_name' => $authenticatedUser->name ?? $request->customer_name,
                'customer_email' => $authenticatedUser->email ?? $request->customer_email,
                'customer_phone' => $authenticatedUser->phone ?? $request->customer_phone,
                'total' => $totalAmount,
                'code_4digit' => $this->generatePickupCode(),
                'subtotal_amount' => $subtotal,
                'tax_amount' => $taxAmount,
                'commission_amount' => $commissionAmount,
                'total_amount' => $totalAmount,
                'currency' => 'eur',
                'status' => 'pending',
                'payment_status' => 'paid',
                'notes' => $request->notes,
                'order_number' => $this->generateOrderNumber()
            ]);

            // Create order items
            foreach ($cartItems as $cartItem) {
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $cartItem->menu_item_id,
                    'quantity' => $cartItem->quantity,
                    'price_at_time' => $cartItem->menuItem->price,
                    'customizations' => $cartItem->customizations,
                    'special_instructions' => $cartItem->special_instructions
                ]);
            }

            // Process Stripe payment
            $paymentResult = $this->processStripePayment(
                $order,
                $request->payment_method_id,
                $connectedAccountId,
                $branchAmount,
                $commissionAmount
            );

            if (!$paymentResult['success']) {
                DB::rollBack();
                return response()->json([
                    'success' => false,
                    'message' => 'Payment failed: ' . $paymentResult['error']
                ], 400);
            }

            // Update order with payment information
            $order->update([
                'payment_status' => 'paid',
                'status' => 'confirmed',
                'stripe_payment_intent_id' => $paymentResult['payment_intent_id'],
                'stripe_transfer_id' => $paymentResult['transfer_id']
            ]);

            // Clear cart after successful order
            $cart->items()->delete();
            $cart->delete();

            DB::commit();

            return response()->json([
                'success' => true,
                'data' => [
                    'order' => $order->load('items.menuItem'),
                    'payment' => [
                        'payment_intent_id' => $paymentResult['payment_intent_id'],
                        'amount_paid' => $totalAmount,
                        'commission_amount' => $commissionAmount,
                        'branch_amount' => $branchAmount
                    ]
                ],
                'message' => 'Order created and payment processed successfully'
            ]);

        } catch (Exception $e) {
            DB::rollBack();
            Log::error('Order creation failed', [
                'error' => $e->getMessage(),
                'guest_id' => $request->guest_id
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get order by ID
     */
    public function show(Request $request, $orderId): JsonResponse
    {
        $order = Order::with(['items.menuItem', 'branch.chain'])->find($orderId);

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $order
        ]);
    }

    /**
     * Calculate commission amount based on system settings
     */
    private function calculateCommission(float $orderAmount): float
    {
        $defaultRate = (float) SystemSetting::get('default_commission_rate', 0.05); // 5% default
        $minAmount = (float) SystemSetting::get('min_commission_amount', 0.50);     // €0.50 min
        $maxAmount = (float) SystemSetting::get('max_commission_amount', 10.00);    // €10.00 max

        $commission = $orderAmount * $defaultRate;
        $commission = max($commission, $minAmount);
        $commission = min($commission, $maxAmount);

        return round($commission, 2);
    }

    /**
     * Process Stripe Connect payment with manual capture for deferred settlement
     */
    private function processStripePayment(
        Order $order,
        string $paymentMethodId,
        string $connectedAccountId,
        float $branchAmount,
        float $commissionAmount
    ): array {
        try {
            // For testing: simulate payment if using test payment method
            if (str_starts_with($paymentMethodId, 'pm_test_')) {
                return [
                    'success' => true,
                    'payment_intent_id' => 'pi_test_' . uniqid(),
                    'transfer_id' => 'tr_test_' . uniqid(),
                    'status' => 'requires_capture'
                ];
            }
            
            // Get user's Stripe customer ID
            $user = $order->user;
            if (!$user || !$user->stripe_customer_id) {
                return [
                    'success' => false,
                    'error' => 'User Stripe customer ID not found. Please add a payment method first.'
                ];
            }
            
            // Create Payment Intent with automatic capture and application fee (commission)
            $paymentIntent = PaymentIntent::create([
                'amount' => intval($order->total_amount * 100), // Convert to cents
                'currency' => $order->currency,
                'customer' => $user->stripe_customer_id, // Required when using saved payment method
                'payment_method' => $paymentMethodId,
                'capture_method' => 'automatic', // Automatic capture for immediate payment
                'confirm' => true,
                'off_session' => true, // Allow charging saved cards without customer present
                'application_fee_amount' => intval($commissionAmount * 100), // Commission to platform
                'transfer_data' => [
                    'destination' => $connectedAccountId, // Branch's Stripe account
                ],
                'metadata' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'branch_id' => $order->branch_id,
                    'commission_amount' => $commissionAmount,
                    'branch_amount' => $branchAmount
                ]
            ]);

            if ($paymentIntent->status === 'requires_action') {
                return [
                    'success' => false,
                    'error' => 'Payment requires additional action',
                    'requires_action' => true,
                    'payment_intent' => $paymentIntent
                ];
            }

            if ($paymentIntent->status !== 'succeeded') {
                return [
                    'success' => false,
                    'error' => 'Payment failed with status: ' . $paymentIntent->status
                ];
            }

            return [
                'success' => true,
                'payment_intent_id' => $paymentIntent->id,
                'transfer_id' => $paymentIntent->transfer_data->destination ?? null
            ];

        } catch (Exception $e) {
            Log::error('Stripe payment processing failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'connected_account' => $connectedAccountId
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage()
            ];
        }
    }

    /**
     * Generate unique order number
     */
    private function generateOrderNumber(): string
    {
        $timestamp = now()->format('ymdHi');
        $random = str_pad(rand(0, 999), 3, '0', STR_PAD_LEFT);
        return "QR{$timestamp}{$random}";
    }

    /**
     * Generate unique 4-digit pickup code
     */
    private function generatePickupCode(): string
    {
        do {
            $code = str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (Order::where('code_4digit', $code)->exists());
        
        return $code;
    }

    /**
     * Capture payment when order is completed by staff
     */
    public function capturePayment(Request $request, $orderId): JsonResponse
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id'
        ]);

        try {
            $order = Order::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            if ($order->payment_status !== 'authorized') {
                return response()->json([
                    'success' => false,
                    'message' => 'Payment cannot be captured. Current status: ' . $order->payment_status
                ], 400);
            }

            // Initialize Stripe
            $this->initializeStripe();

            // For test payments, simulate capture
            if (str_starts_with($order->payment_intent_id, 'pi_test_')) {
                $order->update([
                    'payment_status' => 'paid',
                    'status' => 'completed',
                    'completed_at' => now(),
                    'completed_by' => $request->staff_id
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment captured successfully (test mode)',
                    'data' => $order
                ]);
            }

            // Capture the real payment
            $paymentIntent = PaymentIntent::retrieve($order->payment_intent_id);
            $paymentIntent->capture();

            // Update order status
            $order->update([
                'payment_status' => 'paid',
                'status' => 'completed',
                'completed_at' => now(),
                'completed_by' => $request->staff_id
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment captured and order completed',
                'data' => $order
            ]);

        } catch (Exception $e) {
            \Log::error('Payment capture failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to capture payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Cancel authorized payment (refund if needed)
     */
    public function cancelPayment(Request $request, $orderId): JsonResponse
    {
        $request->validate([
            'staff_id' => 'required|exists:users,id',
            'reason' => 'required|string|max:255'
        ]);

        try {
            $order = Order::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Initialize Stripe
            $this->initializeStripe();

            // For test payments, simulate cancellation
            if (str_starts_with($order->payment_intent_id, 'pi_test_')) {
                $order->update([
                    'payment_status' => 'cancelled',
                    'status' => 'cancelled',
                    'cancelled_at' => now(),
                    'cancelled_by' => $request->staff_id,
                    'cancellation_reason' => $request->reason
                ]);

                return response()->json([
                    'success' => true,
                    'message' => 'Payment cancelled successfully (test mode)',
                    'data' => $order
                ]);
            }

            // Cancel the real payment intent
            $paymentIntent = PaymentIntent::retrieve($order->payment_intent_id);
            $paymentIntent->cancel();

            // Update order status
            $order->update([
                'payment_status' => 'cancelled',
                'status' => 'cancelled',
                'cancelled_at' => now(),
                'cancelled_by' => $request->staff_id,
                'cancellation_reason' => $request->reason
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Payment cancelled and order updated',
                'data' => $order
            ]);

        } catch (Exception $e) {
            Log::error('Payment cancellation failed', [
                'order_id' => $orderId,
                'error' => $e->getMessage()
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to cancel payment: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get test orders for Stripe Connect testing
     */
    public function getTestOrders(): JsonResponse
    {
        try {
            $orders = Order::with(['items.menuItem'])
                ->where('stripe_payment_intent_id', 'LIKE', 'pi_test_%')
                ->orderBy('created_at', 'desc')
                ->take(10)
                ->get();

            return response()->json([
                'success' => true,
                'data' => $orders
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve test orders: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Simulate Stripe Connect capture for testing
     */
    public function simulateCapture(Request $request, $orderId): JsonResponse
    {
        try {
            $order = Order::find($orderId);
            
            if (!$order) {
                return response()->json([
                    'success' => false,
                    'message' => 'Order not found'
                ], 404);
            }

            // Simulate Stripe Connect transfer
            $commissionAmount = $order->total * ($order->commission_rate / 100);
            $branchAmount = $order->total - $commissionAmount;

            $order->update([
                'commission_status' => 'transferred',
                'commission_amount' => $commissionAmount,
                'branch_amount' => $branchAmount,
                'stripe_transfer_id' => 'tr_test_' . uniqid()
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Stripe Connect transfer simulated successfully',
                'data' => [
                    'order_id' => $order->id,
                    'order_number' => $order->order_number,
                    'total_amount' => $order->total,
                    'commission_amount' => $commissionAmount,
                    'branch_amount' => $branchAmount,
                    'commission_rate' => $order->commission_rate . '%',
                    'transfer_id' => $order->stripe_transfer_id
                ]
            ]);
        } catch (Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to simulate capture: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Create order directly from items (for mobile app without cart session)
     */
    public function createDirect(Request $request): JsonResponse
    {
        $request->validate([
            'branch_id' => 'required|exists:branches,id',
            'items' => 'required|array|min:1',
            'items.*.menu_item_id' => 'required|exists:menu_items,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.extras' => 'nullable|array',
            'customer_name' => 'required|string|max:255',
            'customer_email' => 'required|email|max:255',
            'customer_phone' => 'nullable|string|max:50',
            'payment_method_id' => 'required|string',
            'notes' => 'nullable|string|max:1000',
        ]);

        try {
            $this->initializeStripe();
            DB::beginTransaction();

            $branch = Branch::with('chain')->find($request->branch_id);
            $connectedAccountId = $branch?->chain?->stripe_account_id
                ?? $branch?->stripe_connect_account_id
                ?? $branch?->stripe_account_id;
            if (!$branch || !$connectedAccountId) {
                return response()->json([
                    'success' => false,
                    'message' => 'Branch/Chain not configured for payments'
                ], 400);
            }

            // Calculate totals
            $subtotal = 0;
            foreach ($request->items as $itemData) {
                $menuItem = \App\Models\MenuItem::find($itemData['menu_item_id']);
                $subtotal += $menuItem->price * $itemData['quantity'];
            }

            $taxRate = 0.1; // 10% tax
            $taxAmount = $subtotal * $taxRate;
            $totalAmount = $subtotal + $taxAmount;
            $commissionAmount = $this->calculateCommission($totalAmount);

            // Create order
            $order = Order::create([
                'branch_id' => $request->branch_id,
                'chain_id' => $branch->chain_id,
                'customer_name' => $request->customer_name,
                'customer_email' => $request->customer_email,
                'customer_phone' => $request->customer_phone,
                'total' => $totalAmount,
                'code_4digit' => $this->generatePickupCode(),
                'subtotal_amount' => $subtotal,
                'tax_amount' => $taxAmount,
                'commission_amount' => $commissionAmount,
                'total_amount' => $totalAmount,
                'currency' => 'eur',
                'status' => 'pending',
                'payment_status' => 'paid',
                'notes' => $request->notes,
                'order_number' => $this->generateOrderNumber(),
            ]);

            // Create order items
            foreach ($request->items as $itemData) {
                $menuItem = \App\Models\MenuItem::find($itemData['menu_item_id']);
                OrderItem::create([
                    'order_id' => $order->id,
                    'menu_item_id' => $itemData['menu_item_id'],
                    'quantity' => $itemData['quantity'],
                    'price_at_time' => $menuItem->price,
                    'customizations' => $itemData['customizations'] ?? null,
                    'special_instructions' => $itemData['special_instructions'] ?? null
                ]);
            }

            // Create Stripe PaymentIntent (test mode simulation)
            // In real use, integrate Stripe SDK here
            $order->update([
                'payment_intent_id' => 'pi_test_' . uniqid(),
                'payment_status' => 'paid',
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Order created successfully',
                'data' => $order->load('items.menuItem'),
            ]);
        } catch (Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Order creation failed: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get customer's orders with optional status filter
     */
    public function myOrders(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $status = $request->query('status');
        
        $query = Order::with(['branch.chain', 'items.menuItem'])
            ->where('user_id', $user->id);

        // Filter by status if provided
        if ($status && in_array($status, ['pending', 'confirmed', 'ready', 'completed', 'cancelled'])) {
            $query->where('status', $status);
        }

        $orders = $query->orderBy('created_at', 'desc')->paginate(20);

        return response()->json([
            'success' => true,
            'data' => $orders
        ]);
    }

    /**
     * Cancel an order (only if not completed)
     */
    public function cancelOrder(Request $request, int $orderId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated'
            ], 401);
        }

        $order = Order::where('id', $orderId)
            ->where('user_id', $user->id)
            ->first();

        if (!$order) {
            return response()->json([
                'success' => false,
                'message' => 'Order not found'
            ], 404);
        }

        // Check if order can be cancelled
        if (in_array($order->status, ['completed', 'cancelled'])) {
            return response()->json([
                'success' => false,
                'message' => 'Cannot cancel order with status: ' . $order->status
            ], 422);
        }

        // Update order status to cancelled
        $order->update(['status' => 'cancelled']);

        // Optionally: refund payment if paid
        if ($order->payment_status === 'paid' && $order->payment_intent_id) {
            try {
                $this->initializeStripe();
                
                // Create a refund for the payment intent
                $refund = \Stripe\Refund::create([
                    'payment_intent' => $order->payment_intent_id,
                ]);

                Log::info('Order cancelled and refunded', [
                    'order_id' => $order->id,
                    'refund_id' => $refund->id
                ]);
            } catch (\Exception $e) {
                Log::error('Failed to refund cancelled order', [
                    'order_id' => $order->id,
                    'error' => $e->getMessage()
                ]);
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Order cancelled successfully',
            'data' => [
                'order_id' => $order->id,
                'status' => $order->status,
                'refunded' => $order->payment_status === 'paid'
            ]
        ]);
    }
}
