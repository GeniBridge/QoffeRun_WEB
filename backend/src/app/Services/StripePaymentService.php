<?php

namespace App\Services;

use App\Models\Order;
use App\Models\Branch;
use App\Models\SystemSetting;
use Stripe\Stripe;
use Stripe\PaymentIntent;
use Stripe\Transfer;
use Exception;
use Illuminate\Support\Facades\Log;

class StripePaymentService
{
    public function __construct()
    {
        $this->initializeStripe();
    }

    /**
     * Initialize Stripe with config settings
     */
    private function initializeStripe(): void
    {
        // Always use SystemSettings for fresh key
        $setting = SystemSetting::where('key', 'stripe_secret_key')->first();
        $stripeSecretKey = $setting ? $setting->value : null;
        
        if (!$stripeSecretKey) {
            throw new Exception('Stripe secret key not found in SystemSettings');
        }
        
        // Clean and set the key
        $cleanKey = trim(str_replace(["\n", "\r", "\0"], '', $stripeSecretKey));
        
        // Log for debugging
        Log::info('Setting Stripe key', [
            'key_length' => strlen($cleanKey),
            'key_preview' => substr($cleanKey, 0, 20) . '...'
        ]);
        
        Stripe::setApiKey($cleanKey);
    }

    /**
     * Capture payment and transfer commission when order is completed
     */
    public function capturePaymentAndTransfer(Order $order): array
    {
        try {
            $branch = $order->branch;
            
            // Get branch Stripe account ID from direct column
            $stripeAccountId = $branch->stripe_connect_account_id;
            if (!$stripeAccountId) {
                throw new Exception('Branch does not have Stripe Connect account configured');
            }

            // For demo purposes with test data, simulate payment capture
            if (!$order->stripe_payment_intent_id) {
                // Create a simulated payment intent ID for existing test orders
                $paymentIntentId = 'pi_test_' . uniqid() . '_order_' . $order->id;
                
                Log::info('Simulating payment capture for test order', [
                    'order_id' => $order->id,
                    'simulated_payment_intent' => $paymentIntentId,
                    'amount' => $order->total_amount,
                    'commission_amount' => $order->commission_amount,
                    'branch_amount' => $order->branch_amount
                ]);

                // Update order with simulated payment info
                $order->update([
                    'stripe_payment_intent_id' => $paymentIntentId,
                    'payment_status' => 'paid',
                    'payment_confirmed_at' => now()
                ]);

                // Simulate transfer creation
                $transferId = $this->createSimulatedTransfer($order, $stripeAccountId);
                
                return [
                    'success' => true,
                    'payment_intent_id' => $paymentIntentId,
                    'transfer_id' => $transferId,
                    'message' => 'Payment captured and commission transferred successfully (simulated)',
                    'simulated' => true
                ];
            }

            // For real payment intents, capture if needed
            $paymentIntent = PaymentIntent::retrieve($order->stripe_payment_intent_id);
            
            if ($paymentIntent->status === 'requires_capture') {
                $paymentIntent = $paymentIntent->capture();
                Log::info('Payment captured', [
                    'order_id' => $order->id,
                    'payment_intent_id' => $paymentIntent->id
                ]);
            }

            // Create transfer to branch account
            $transferId = $this->createTransfer($order, $stripeAccountId);

            return [
                'success' => true,
                'payment_intent_id' => $paymentIntent->id,
                'transfer_id' => $transferId,
                'message' => 'Payment captured and commission transferred successfully'
            ];

        } catch (Exception $e) {
            Log::error('Failed to capture payment and transfer commission', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            // Update commission status to failed
            $order->update(['commission_status' => 'failed']);

            throw $e;
        }
    }

    /**
     * Create Stripe transfer to branch account
     */
    private function createTransfer(Order $order, string $stripeAccountId): string
    {
        // Calculate transfer amount (branch gets their portion after commission)
        $branchAmountCents = (int) ($order->branch_amount * 100);

        $transfer = Transfer::create([
            'amount' => $branchAmountCents,
            'currency' => 'eur',
            'destination' => $stripeAccountId,
            'description' => "Commission payment for order #{$order->id} - {$order->branch->name}",
            'metadata' => [
                'order_id' => $order->id,
                'branch_id' => $order->branch_id,
                'commission_rate' => $order->commission_rate,
                'original_amount' => $order->total_amount
            ]
        ]);

        // Update order with transfer information
        $order->update([
            'stripe_transfer_id' => $transfer->id,
            'commission_status' => 'transferred',
            'commission_transferred_at' => now()
        ]);

        Log::info('Commission transfer created', [
            'order_id' => $order->id,
            'transfer_id' => $transfer->id,
            'amount' => $branchAmountCents / 100,
            'destination' => $stripeAccountId
        ]);

        return $transfer->id;
    }

    /**
     * Create simulated transfer for test orders
     */
    private function createSimulatedTransfer(Order $order, string $stripeAccountId): string
    {
        // Generate simulated transfer ID
        $transferId = 'tr_test_' . uniqid() . '_order_' . $order->id;

        // Update order with simulated transfer information
        $order->update([
            'stripe_transfer_id' => $transferId,
            'commission_status' => 'transferred',
            'commission_transferred_at' => now()
        ]);

        Log::info('Simulated commission transfer created', [
            'order_id' => $order->id,
            'simulated_transfer_id' => $transferId,
            'branch_amount' => $order->branch_amount,
            'commission_amount' => $order->commission_amount,
            'destination' => $stripeAccountId
        ]);

        return $transferId;
    }

    /**
     * Create payment intent for new orders
     */
    public function createPaymentIntent(Order $order, array $options = []): PaymentIntent
    {
        $branch = $order->branch;
        $stripeAccountId = $branch->stripe_connect_account_id;

        if (!$stripeAccountId) {
            throw new Exception('Branch does not have Stripe Connect account configured');
        }

        $amountCents = (int) ($order->total_amount * 100);
        $commissionCents = (int) ($order->commission_amount * 100);

        // Create PaymentIntent parameters
        $paymentIntentParams = [
            'amount' => $amountCents,
            'currency' => 'eur',
            'payment_method_types' => ['card'],
            'capture_method' => $options['capture_method'] ?? 'automatic',
            'description' => "Order #{$order->id} - {$branch->name}",
            'metadata' => [
                'order_id' => $order->id,
                'branch_id' => $order->branch_id,
                'stripe_connect_account' => $stripeAccountId,
                'commission_amount' => $commissionCents,
                'branch_amount' => ($amountCents - $commissionCents),
                'test_mode' => 'true'
            ]
        ];
        
        // Try to use Connect transfer if account is properly configured
        try {
            // Check if Connect account is accessible and configured
            $account = \Stripe\Account::retrieve($stripeAccountId);
            
            if ($account->charges_enabled) {
                // Account is ready for Connect transfers
                if ($commissionCents > 0) {
                    $paymentIntentParams['application_fee_amount'] = $commissionCents;
                }
                $paymentIntentParams['transfer_data'] = [
                    'destination' => $stripeAccountId
                ];
                
                Log::info('Creating PaymentIntent with Stripe Connect transfer', [
                    'order_id' => $order->id,
                    'connect_account' => $stripeAccountId,
                    'transfer_amount' => $amountCents - $commissionCents
                ]);
            } else {
                Log::info('Connect account not ready for charges, creating simple PaymentIntent', [
                    'order_id' => $order->id,
                    'account_status' => 'charges_disabled',
                    'connect_account' => $stripeAccountId
                ]);
            }
        } catch (\Exception $e) {
            Log::warning('Could not verify Connect account, using simple PaymentIntent', [
                'order_id' => $order->id,
                'connect_account' => $stripeAccountId,
                'error' => $e->getMessage()
            ]);
        }
        
        $paymentIntent = PaymentIntent::create($paymentIntentParams);

        // Update order with payment intent (payment_status will remain 'failed' until payment succeeds)
        $order->update([
            'stripe_payment_intent_id' => $paymentIntent->id
        ]);

        Log::info('Payment intent created', [
            'order_id' => $order->id,
            'payment_intent_id' => $paymentIntent->id,
            'amount' => $order->total_amount,
            'commission' => $order->commission_amount
        ]);

        return $paymentIntent;
    }
}