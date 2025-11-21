<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\CustomerPaymentMethod;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Stripe\Stripe;
use Stripe\Customer as StripeCustomer;
use Stripe\PaymentMethod as StripePaymentMethod;

class PaymentMethodController extends Controller
{
    /**
     * Initialize Stripe
     */
    private function initializeStripe(): void
    {
        $stripeSecretKey = SystemSetting::get('stripe_secret_key');
        if ($stripeSecretKey) {
            Stripe::setApiKey($stripeSecretKey);
        } else {
            throw new \Exception('Stripe secret key not configured');
        }
    }

    /**
     * Get or create Stripe customer for user
     */
    private function getOrCreateStripeCustomer($user)
    {
        if ($user->stripe_customer_id) {
            try {
                return StripeCustomer::retrieve($user->stripe_customer_id);
            } catch (\Exception $e) {
                // Customer doesn't exist, create new one
            }
        }

        // Create new Stripe customer
        $customer = StripeCustomer::create([
            'email' => $user->email,
            'name' => $user->name,
            'metadata' => [
                'user_id' => $user->id,
            ],
        ]);

        $user->update(['stripe_customer_id' => $customer->id]);

        return $customer;
    }

    /**
     * List all payment methods for authenticated user
     * 
     * GET /api/v1/customer/payment-methods
     */
    public function index(Request $request)
    {
        try {
            $user = $request->user();
            
            $paymentMethods = CustomerPaymentMethod::where('user_id', $user->id)
                ->valid()
                ->orderBy('is_default', 'desc')
                ->orderBy('created_at', 'desc')
                ->get();

            return response()->json([
                'success' => true,
                'data' => $paymentMethods,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve payment methods',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Add new payment method
     * 
     * POST /api/v1/customer/payment-methods
     * Body: { payment_method_id: "pm_xxx", set_as_default: true/false }
     */
    public function store(Request $request)
    {
        $request->validate([
            'payment_method_id' => 'required|string',
            'set_as_default' => 'boolean',
        ]);

        try {
            $this->initializeStripe();
            $user = $request->user();

            // Get or create Stripe customer
            $customer = $this->getOrCreateStripeCustomer($user);

            // Attach payment method to customer
            $stripePaymentMethod = StripePaymentMethod::retrieve($request->payment_method_id);
            $stripePaymentMethod->attach(['customer' => $customer->id]);

            DB::beginTransaction();

            // If setting as default, unset other defaults
            if ($request->set_as_default) {
                CustomerPaymentMethod::where('user_id', $user->id)
                    ->update(['is_default' => false]);
            } else {
                // If this is the first card, make it default
                $existingCount = CustomerPaymentMethod::where('user_id', $user->id)->count();
                $request->merge(['set_as_default' => $existingCount === 0]);
            }

            // Save payment method
            $paymentMethod = CustomerPaymentMethod::create([
                'user_id' => $user->id,
                'stripe_payment_method_id' => $stripePaymentMethod->id,
                'card_brand' => $stripePaymentMethod->card->brand,
                'card_last4' => $stripePaymentMethod->card->last4,
                'card_exp_month' => $stripePaymentMethod->card->exp_month,
                'card_exp_year' => $stripePaymentMethod->card->exp_year,
                'card_fingerprint' => $stripePaymentMethod->card->fingerprint,
                'is_default' => $request->set_as_default ?? false,
                'billing_details' => $stripePaymentMethod->billing_details->toArray(),
            ]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment method added successfully',
                'data' => $paymentMethod,
            ], 201);

        } catch (\Stripe\Exception\CardException $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Card error: ' . $e->getError()->message,
            ], 400);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to add payment method',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Set payment method as default
     * 
     * PUT /api/v1/customer/payment-methods/{id}/default
     */
    public function setDefault(Request $request, $id)
    {
        try {
            $user = $request->user();

            $paymentMethod = CustomerPaymentMethod::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            // Check if expired
            if ($paymentMethod->is_expired) {
                return response()->json([
                    'success' => false,
                    'message' => 'Cannot set expired card as default',
                ], 422);
            }

            DB::beginTransaction();

            // Unset all other defaults
            CustomerPaymentMethod::where('user_id', $user->id)
                ->where('id', '!=', $id)
                ->update(['is_default' => false]);

            // Set this one as default
            $paymentMethod->update(['is_default' => true]);

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment method set as default',
                'data' => $paymentMethod->fresh(),
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment method not found',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to set default payment method',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Delete payment method
     * 
     * DELETE /api/v1/customer/payment-methods/{id}
     */
    public function destroy(Request $request, $id)
    {
        try {
            $this->initializeStripe();
            $user = $request->user();

            $paymentMethod = CustomerPaymentMethod::where('id', $id)
                ->where('user_id', $user->id)
                ->firstOrFail();

            $wasDefault = $paymentMethod->is_default;
            $stripePaymentMethodId = $paymentMethod->stripe_payment_method_id;

            DB::beginTransaction();

            // Detach from Stripe
            try {
                $stripePaymentMethod = StripePaymentMethod::retrieve($stripePaymentMethodId);
                $stripePaymentMethod->detach();
            } catch (\Stripe\Exception\InvalidRequestException $e) {
                // Payment method already detached or doesn't exist
            }

            // Delete from database
            $paymentMethod->delete();

            // If deleted card was default, set another as default
            if ($wasDefault) {
                $nextCard = CustomerPaymentMethod::where('user_id', $user->id)
                    ->valid()
                    ->orderBy('created_at', 'desc')
                    ->first();

                if ($nextCard) {
                    $nextCard->update(['is_default' => true]);
                }
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Payment method deleted successfully',
            ]);

        } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
            return response()->json([
                'success' => false,
                'message' => 'Payment method not found',
            ], 404);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success' => false,
                'message' => 'Failed to delete payment method',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get default payment method
     * 
     * GET /api/v1/customer/payment-methods/default
     */
    public function getDefault(Request $request)
    {
        try {
            $user = $request->user();

            $defaultCard = CustomerPaymentMethod::where('user_id', $user->id)
                ->where('is_default', true)
                ->valid()
                ->first();

            if (!$defaultCard) {
                return response()->json([
                    'success' => false,
                    'message' => 'No default payment method found',
                ], 404);
            }

            return response()->json([
                'success' => true,
                'data' => $defaultCard,
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to retrieve default payment method',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}
