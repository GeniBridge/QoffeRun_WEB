# Backend Cart Session Fix - CRITICAL

**Issue:** Authenticated users' carts use guest session IDs instead of user-based sessions, causing "cart not found" at checkout.

**Impact:** Orders fail with "Cart not found or expired" even when cart has items.

---

## 🔴 Problem Summary

When authenticated users add items to cart:
- Backend returns `session_id: "guest-xxxxxxxxx"` instead of `session_id: "user-58"`
- Cart is stored/looked up by guest session
- Order creation endpoint looks for user's cart by user_id
- **Result:** Cart exists but order endpoint can't find it → 404 Cart not found

---

## ✅ Required Backend Fixes

### 1. CartController - getCart() Method

**Location:** `app/Http/Controllers/Customer/CartController.php`

**Current Issue:** Returns guest session for authenticated users

**Fix:**
```php
public function getCart(Request $request)
{
    // For authenticated users, ALWAYS use user-based cart lookup
    if ($request->user()) {
        $cart = Cart::with(['branch', 'items.menuItem'])
            ->where('user_id', $request->user()->id)
            ->first();
        
        if (!$cart) {
            return response()->json([
                'success' => true,
                'data' => [
                    'id' => null,
                    'branch' => null,
                    'items' => [],
                    'summary' => [
                        'item_count' => 0,
                        'subtotal' => '0.00',
                        'tax_amount' => '0.00',
                        'total_amount' => '0.00',
                    ],
                    'expires_at' => null,
                    // CRITICAL: Return user-based session ID
                    'session_id' => 'user-' . $request->user()->id,
                ],
            ], 200);
        }
        
        // CRITICAL: Override session_id for authenticated cart response
        $cartData = $cart->toArray();
        $cartData['session_id'] = 'user-' . $request->user()->id;
        
        return response()->json([
            'success' => true,
            'data' => $cartData,
        ], 200);
    }
    
    // Guest flow unchanged
    $guestSessionId = $request->header('X-Guest-Session-ID') 
                      ?? $request->input('guest_session_id');
    // ... rest of guest logic
}
```

---

### 2. CartController - addToCart() Method

**Fix:**
```php
public function addToCart(Request $request)
{
    $validated = $request->validate([
        'branch_id' => 'required|integer|exists:branches,id',
        'menu_item_id' => 'required|integer|exists:menu_items,id',
        'quantity' => 'required|integer|min:1',
        'customizations' => 'nullable|array',
        'special_instructions' => 'nullable|string',
    ]);
    
    // For authenticated users
    if ($request->user()) {
        $cart = Cart::firstOrCreate(
            ['user_id' => $request->user()->id],
            [
                'branch_id' => $validated['branch_id'],
                'expires_at' => now()->addHours(24),
            ]
        );
        
        // Check branch consistency
        if ($cart->branch_id != $validated['branch_id']) {
            return response()->json([
                'success' => false,
                'message' => 'Cart already contains items from a different branch. Please clear your cart first.',
                'requires_cart_clear' => true,
            ], 422);
        }
        
        // Add item to cart...
        $cartItem = CartItem::create([...]);
        
        return response()->json([
            'success' => true,
            'message' => 'Item added to cart successfully',
            'data' => [
                'cart_item' => $cartItem,
                'cart_summary' => $this->calculateCartSummary($cart),
                // CRITICAL: Return user-based session
                'session_id' => 'user-' . $request->user()->id,
            ],
        ], 200);
    }
    
    // Guest flow with guest_session_id unchanged...
}
```

---

### 3. OrderController - createOrder() Method

**Current Issue:** May not be looking up cart correctly for authenticated users

**Fix:**
```php
public function createOrder(Request $request)
{
    $validated = $request->validate([
        'customer_name' => 'required|string|max:255',
        'customer_email' => 'required|email|max:255',
        'customer_phone' => 'nullable|string|max:20',
        'payment_method_id' => 'required|string',
        'notes' => 'nullable|string',
    ]);
    
    $user = $request->user();
    
    if (!$user) {
        return response()->json([
            'success' => false,
            'message' => 'Authentication required. Please login or register to place an order.',
        ], 401);
    }
    
    // CRITICAL: Look up cart by user_id
    $cart = Cart::with(['branch', 'items.menuItem'])
        ->where('user_id', $user->id)
        ->first();
    
    if (!$cart) {
        return response()->json([
            'success' => false,
            'message' => 'Cart not found or expired',
        ], 404);
    }
    
    if ($cart->items->isEmpty()) {
        return response()->json([
            'success' => false,
            'message' => 'Cart is empty',
        ], 400);
    }
    
    // Ensure user has stripe_customer_id
    if (!$user->stripe_customer_id) {
        $customer = \Stripe\Customer::create([
            'email' => $user->email,
            'name' => $user->name,
            'phone' => $user->phone,
        ]);
        $user->update(['stripe_customer_id' => $customer->id]);
    }
    
    // Get or validate payment method
    $paymentMethod = PaymentMethod::where('user_id', $user->id)
        ->where('stripe_payment_method_id', $validated['payment_method_id'])
        ->first();
    
    if (!$paymentMethod) {
        return response()->json([
            'success' => false,
            'message' => 'Payment method not found. Please add a card first.',
        ], 422);
    }
    
    // Calculate totals
    $subtotal = $cart->items->sum(fn($item) => $item->quantity * $item->unit_price);
    $taxRate = 0.22; // 22% IVA
    $taxAmount = $subtotal * $taxRate;
    $commissionRate = 0.10; // 10% platform commission
    $commissionAmount = $subtotal * $commissionRate;
    $totalAmount = $subtotal + $taxAmount;
    
    // Create Stripe PaymentIntent with customer parameter
    try {
        \Stripe\Stripe::setApiKey(config('services.stripe.secret'));
        
        $paymentIntent = \Stripe\PaymentIntent::create([
            'amount' => round($totalAmount * 100), // in cents
            'currency' => 'eur',
            'customer' => $user->stripe_customer_id, // ← CRITICAL FIX
            'payment_method' => $validated['payment_method_id'],
            'confirm' => true,
            'automatic_payment_methods' => [
                'enabled' => true,
                'allow_redirects' => 'never',
            ],
            'metadata' => [
                'user_id' => $user->id,
                'cart_id' => $cart->id,
                'branch_id' => $cart->branch_id,
            ],
        ]);
        
        if ($paymentIntent->status !== 'succeeded') {
            throw new \Exception('Payment failed: ' . $paymentIntent->status);
        }
        
    } catch (\Stripe\Exception\CardException $e) {
        return response()->json([
            'success' => false,
            'message' => 'Payment failed: ' . $e->getError()->message,
        ], 400);
    } catch (\Exception $e) {
        return response()->json([
            'success' => false,
            'message' => 'Payment failed: ' . $e->getMessage(),
        ], 400);
    }
    
    // Create order
    $order = Order::create([
        'user_id' => $user->id,
        'branch_id' => $cart->branch_id,
        'chain_id' => $cart->branch->chain_id,
        'order_number' => 'QR' . now()->format('ymdHis') . rand(100, 999),
        'customer_name' => $validated['customer_name'],
        'customer_email' => $validated['customer_email'],
        'customer_phone' => $validated['customer_phone'] ?? null,
        'subtotal_amount' => $subtotal,
        'tax_amount' => $taxAmount,
        'commission_amount' => $commissionAmount,
        'total_amount' => $totalAmount,
        'currency' => 'eur',
        'status' => 'confirmed',
        'payment_status' => 'paid',
        'notes' => $validated['notes'] ?? null,
        'code_4digit' => str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT),
        'stripe_payment_intent_id' => $paymentIntent->id,
    ]);
    
    // Copy cart items to order
    foreach ($cart->items as $cartItem) {
        $order->items()->create([
            'menu_item_id' => $cartItem->menu_item_id,
            'quantity' => $cartItem->quantity,
            'unit_price' => $cartItem->unit_price,
            'price_at_time' => $cartItem->unit_price,
            'customizations' => $cartItem->customizations,
            'special_instructions' => $cartItem->special_instructions,
        ]);
    }
    
    // Clear cart after successful order
    $cart->items()->delete();
    $cart->delete();
    
    return response()->json([
        'success' => true,
        'data' => [
            'order' => $order->load(['branch', 'items.menuItem', 'user']),
            'payment' => [
                'payment_intent_id' => $paymentIntent->id,
                'amount_paid' => number_format($totalAmount, 2),
                'commission_amount' => number_format($commissionAmount, 2),
                'branch_amount' => number_format($totalAmount - $commissionAmount, 2),
            ],
        ],
        'message' => 'Order created and payment processed successfully',
    ], 200);
}
```

---

### 4. Update Cart Model

**Location:** `app/Models/Cart.php`

Ensure proper relationships and user association:

```php
<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Cart extends Model
{
    protected $fillable = [
        'user_id',
        'branch_id',
        'guest_session_id', // Still keep for guest support
        'expires_at',
    ];
    
    protected $casts = [
        'expires_at' => 'datetime',
    ];
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    public function branch()
    {
        return $this->belongsTo(Branch::class);
    }
    
    public function items()
    {
        return $this->hasMany(CartItem::class);
    }
    
    // Helper to determine if cart belongs to authenticated user
    public function isUserCart(): bool
    {
        return $this->user_id !== null;
    }
}
```

---

### 5. Database Migration (if needed)

Ensure carts table has proper indexes:

```php
Schema::table('carts', function (Blueprint $table) {
    $table->index('user_id');
    $table->index('guest_session_id');
    $table->index('expires_at');
    
    // Make guest_session_id nullable if not already
    $table->string('guest_session_id')->nullable()->change();
});
```

---

## 🧪 Testing Checklist

After implementing fixes, test:

### Authenticated User Flow:
1. ✅ Login with valid credentials
2. ✅ Add item to cart → verify `session_id: "user-{id}"` in response
3. ✅ GET /customer/cart → verify `session_id: "user-{id}"` in response
4. ✅ Verify cart items persisted
5. ✅ Update cart item quantity
6. ✅ Proceed to checkout
7. ✅ Confirm order → should succeed
8. ✅ Verify cart cleared after successful order
9. ✅ Check order appears in history

### Guest User Flow (should still work):
1. ✅ Browse menu without login
2. ✅ Add item with guest_session_id
3. ✅ GET cart with guest_session_id
4. ✅ Attempt order → should get 401 (auth required)

---

## 📋 Summary of Changes

| File | Method | Change |
|------|--------|--------|
| CartController | getCart() | Return `user-{id}` session for authenticated users |
| CartController | addToCart() | Return `user-{id}` session for authenticated users |
| CartController | updateCartItem() | Ensure user-based cart lookup |
| CartController | removeCartItem() | Ensure user-based cart lookup |
| CartController | clearCart() | Ensure user-based cart lookup |
| OrderController | createOrder() | Include `customer` in PaymentIntent, lookup cart by user_id |
| Cart Model | - | Add user relationship & helper methods |

---

## 🚨 Critical Points

1. **Never return guest session ID for authenticated users**
2. **Always lookup cart by user_id for authenticated requests**
3. **Include Stripe customer ID in PaymentIntent creation**
4. **Verify cart belongs to user before creating order**
5. **Clear cart after successful order**

---

## 🔗 Related Client Changes

Client already handles both session types correctly:
- Stores guest_session_id only when not authenticated
- Sends Bearer token for all authenticated requests
- Preflight validation checks cart before order

---

**Last Updated:** November 23, 2025
**Priority:** 🔴 CRITICAL - Blocks all authenticated orders
