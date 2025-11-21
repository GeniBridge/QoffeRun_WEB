<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use App\Models\Order;
use App\Models\SystemSetting;
use Stripe\Stripe;
use Stripe\Webhook;
use Exception;

class StripeWebhookController extends Controller
{
    public function __construct()
    {
        // Initialize Stripe
        $stripeSecretKey = SystemSetting::get('stripe_secret_key');
        if ($stripeSecretKey) {
            Stripe::setApiKey($stripeSecretKey);
        }
    }

    /**
     * Handle Stripe webhook events
     */
    public function handleWebhook(Request $request): JsonResponse
    {
        $payload = $request->getContent();
        $sigHeader = $request->header('Stripe-Signature');
        $endpointSecret = SystemSetting::get('stripe_webhook_secret');

        try {
            if ($endpointSecret) {
                $event = Webhook::constructEvent($payload, $sigHeader, $endpointSecret);
            } else {
                // For development without webhook secret validation
                $event = json_decode($payload, true);
            }
        } catch (Exception $e) {
            \Log::error('Webhook signature verification failed', [
                'error' => $e->getMessage()
            ]);
            return response()->json(['error' => 'Invalid signature'], 400);
        }

        // Handle the event
        switch ($event['type']) {
            case 'payment_intent.succeeded':
                $this->handlePaymentIntentSucceeded($event['data']['object']);
                break;

            case 'payment_intent.payment_failed':
                $this->handlePaymentIntentFailed($event['data']['object']);
                break;

            case 'payment_intent.canceled':
                $this->handlePaymentIntentCanceled($event['data']['object']);
                break;

            case 'account.updated':
                $this->handleAccountUpdated($event['data']['object']);
                break;

            case 'transfer.created':
                $this->handleTransferCreated($event['data']['object']);
                break;

            case 'transfer.failed':
                $this->handleTransferFailed($event['data']['object']);
                break;

            default:
                \Log::info('Unhandled webhook event type', ['type' => $event['type']]);
        }

        return response()->json(['status' => 'success']);
    }

    /**
     * Handle successful payment intent
     */
    private function handlePaymentIntentSucceeded($paymentIntent): void
    {
        $orderId = $paymentIntent['metadata']['order_id'] ?? null;
        
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'payment_status' => 'paid',
                    'payment_confirmed_at' => now()
                ]);

                \Log::info('Payment confirmed via webhook', [
                    'order_id' => $orderId,
                    'payment_intent_id' => $paymentIntent['id']
                ]);
            }
        }
    }

    /**
     * Handle failed payment intent
     */
    private function handlePaymentIntentFailed($paymentIntent): void
    {
        $orderId = $paymentIntent['metadata']['order_id'] ?? null;
        
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'payment_status' => 'failed',
                    'status' => 'cancelled'
                ]);

                \Log::info('Payment failed via webhook', [
                    'order_id' => $orderId,
                    'payment_intent_id' => $paymentIntent['id']
                ]);
            }
        }
    }

    /**
     * Handle canceled payment intent
     */
    private function handlePaymentIntentCanceled($paymentIntent): void
    {
        $orderId = $paymentIntent['metadata']['order_id'] ?? null;
        
        if ($orderId) {
            $order = Order::find($orderId);
            if ($order) {
                $order->update([
                    'payment_status' => 'cancelled',
                    'status' => 'cancelled'
                ]);

                \Log::info('Payment canceled via webhook', [
                    'order_id' => $orderId,
                    'payment_intent_id' => $paymentIntent['id']
                ]);
            }
        }
    }

    /**
     * Handle connected account updates
     */
    private function handleAccountUpdated($account): void
    {
        // Find chain with this Stripe account ID
        $chain = \App\Models\Chain::where('stripe_account_id', $account['id'])->first();
        
        if ($chain) {
            // Update account capabilities status
            $capabilities = $account['capabilities'] ?? [];
            $chargesEnabled = $account['charges_enabled'] ?? false;
            $payoutsEnabled = $account['payouts_enabled'] ?? false;

            \Log::info('Connected account updated', [
                'chain_id' => $chain->id,
                'account_id' => $account['id'],
                'charges_enabled' => $chargesEnabled,
                'payouts_enabled' => $payoutsEnabled,
                'capabilities' => $capabilities
            ]);
        }
    }

    /**
     * Handle transfer creation (commission distribution)
     */
    private function handleTransferCreated($transfer): void
    {
        \Log::info('Transfer created', [
            'transfer_id' => $transfer['id'],
            'destination' => $transfer['destination'],
            'amount' => $transfer['amount'],
            'currency' => $transfer['currency']
        ]);
    }

    /**
     * Handle transfer failure
     */
    private function handleTransferFailed($transfer): void
    {
        \Log::error('Transfer failed', [
            'transfer_id' => $transfer['id'],
            'destination' => $transfer['destination'],
            'amount' => $transfer['amount'],
            'failure_code' => $transfer['failure_code'] ?? null,
            'failure_message' => $transfer['failure_message'] ?? null
        ]);
    }
}
