# Cart & Orders API - Authenticated Users Only

**Base URL:** `https://api.qofferun.com/api/v1`
**Last Updated:** November 22, 2025

---

## 🔐 Authentication Required

All cart and order operations require user authentication via Bearer token.

**Headers:**
```
Authorization: Bearer {access_token}
Accept: application/json
```

---

## 🛒 Cart Management

### Get Cart
**Endpoint:** `GET /customer/cart`
**Auth:** Required

**Response (200) - Empty Cart:**
```json
{
  "success": true,
  "data": {
    "id": null,
    "branch": null,
    "items": [],
    "summary": {
      "item_count": 0,
      "subtotal": "0.00",
      "tax_amount": "0.00",
      "total_amount": "0.00"
    },
    "expires_at": null,
    "session_id": "guest-abc123xyz789"
  }
}
```

**Response (200) - Cart with Items:**
```json
{
  "success": true,
  "data": {
    "id": 42,
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "chain_name": "Caffè Roma"
    },
    "items": [
      {
        "id": 101,
        "menu_item": {
          "id": 5,
          "name": "Espresso",
          "description": "Classic Italian espresso",
          "image_url": "https://example.com/espresso.jpg",
          "base_price": "2.50"
        },
        "quantity": 2,
        "unit_price": "2.50",
        "total_price": "5.00",
        "customizations": [
          {
            "option_name": "Size",
            "choice_name": "Large",
            "price_modifier": "0.50"
          }
        ],
        "special_instructions": "Extra hot"
      }
    ],
    "summary": {
      "item_count": 2,
      "subtotal": "5.00",
      "tax_amount": "0.50",
      "total_amount": "5.50"
    },
    "expires_at": "2025-11-22T18:30:00Z",
    "session_id": "user-456abc"
  }
}
```

---

### Add Item to Cart
**Endpoint:** `POST /customer/cart/add`
**Auth:** Required

**Request Body:**
```json
{
  "branch_id": 16,
  "menu_item_id": 5,
  "quantity": 2,
  "customizations": [
    {
      "option_name": "Size",
      "choice_name": "Large"
    }
  ],
  "special_instructions": "Extra hot"
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cart_item": {
      "id": 101,
      "quantity": 2,
      "unit_price": "3.00",
      "total_price": "6.00"
    },
    "cart_summary": {
      "item_count": 2,
      "subtotal": "6.00",
      "total_amount": "6.60"
    },
    "session_id": "user-456abc"
  }
}
```

**Error (422) - Different Branch:**
```json
{
  "success": false,
  "message": "Cart already contains items from a different branch. Please clear your cart first.",
  "requires_cart_clear": true
}
```

---

### Update Cart Item
**Endpoint:** `PUT /customer/cart/items/{cartItemId}`
**Auth:** Required

**Request Body:**
```json
{
  "quantity": 3
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "cart_summary": {
      "item_count": 3,
      "subtotal": "9.00",
      "total_amount": "9.90"
    }
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Cart not found"
}
```

---

### Remove Item from Cart
**Endpoint:** `DELETE /customer/cart/items/{cartItemId}`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "cart_summary": {
      "item_count": 1,
      "subtotal": "3.00",
      "total_amount": "3.30"
    }
  }
}
```

**Error (404):**
```json
{
  "success": false,
  "message": "Cart not found"
}
```

---

### Clear Cart
**Endpoint:** `DELETE /customer/cart/clear`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 📦 Order Management

### Create Order
**Endpoint:** `POST /customer/orders`
**Auth:** Required

**Requirements:**
- User must be authenticated
- Cart must contain items
- Payment method ID is required

**Request Body:**
```json
{
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+39 123 456 7890",
  "payment_method_id": "pm_1234567890abcdef",
  "notes": "Please prepare quickly"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "order": {
      "id": 789,
      "order_number": "QR2511221430123",
      "status": "confirmed",
      "payment_status": "paid",
      "branch": {
        "id": 16,
        "name": "Caffè Roma - Via del Corso"
      },
      "items": [
        {
          "id": 1,
          "menu_item": {
            "id": 5,
            "name": "Espresso",
            "price": "2.50"
          },
          "quantity": 2,
          "price_at_time": "2.50"
        }
      ],
      "subtotal_amount": "5.00",
      "tax_amount": "0.50",
      "commission_amount": "0.25",
      "total_amount": "5.50",
      "code_4digit": "1234",
      "created_at": "2025-11-22T12:30:00Z"
    },
    "payment": {
      "payment_intent_id": "pi_1234567890abcdef",
      "amount_paid": "5.50",
      "commission_amount": "0.25",
      "branch_amount": "5.25"
    }
  },
  "message": "Order created and payment processed successfully"
}
```

**Error (401) - Unauthenticated:**
```json
{
  "success": false,
  "message": "Authentication required. Please login or register to place an order."
}
```

**Error (422) - No Payment Method:**
```json
{
  "success": false,
  "message": "No payment method found. Please add a card first."
}
```

**Error (404) - Cart Not Found:**
```json
{
  "success": false,
  "message": "Cart not found or expired"
}
```

**Error (400) - Empty Cart:**
```json
{
  "success": false,
  "message": "Cart is empty"
}
```

**Error (400) - Payment Failed:**
```json
{
  "success": false,
  "message": "Payment failed: Insufficient funds"
}
```

---

### Get Order by ID
**Endpoint:** `GET /customer/orders/{orderId}`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "order_number": "QR2511221430123",
    "status": "confirmed",
    "payment_status": "paid",
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "chain": {
        "name": "Caffè Roma"
      }
    },
    "items": [
      {
        "menu_item": {
          "name": "Espresso",
          "price": "2.50"
        },
        "quantity": 2,
        "price_at_time": "2.50"
      }
    ],
    "total_amount": "5.50",
    "code_4digit": "1234",
    "created_at": "2025-11-22T12:30:00Z"
  }
}
```

---

### Get All Orders by Status
**Endpoint:** `GET /customer/orders?status={status}`
**Auth:** Required

**Status Values:** `pending`, `confirmed`, `ready`, `completed`, `cancelled`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "order_number": "QR2511221430123",
      "status": "confirmed",
      "branch": {
        "id": 16,
        "name": "Caffè Roma - Via del Corso"
      },
      "total_amount": "5.50",
      "created_at": "2025-11-22T12:30:00Z"
    }
  ]
}
```

---

### Cancel Order
**Endpoint:** `POST /customer/orders/{orderId}/cancel`
**Auth:** Required

**Eligibility:** Only orders with status `confirmed` or `ready` can be cancelled.

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

**Error (400):**
```json
{
  "success": false,
  "message": "Cannot cancel order with status: completed"
}
```

---

## 💳 Payment Methods

### Add Payment Method
**Endpoint:** `POST /customer/payment-methods`
**Auth:** Required

**Request Body:**
```json
{
  "payment_method_id": "pm_1234567890abcdef",
  "is_default": true
}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Payment method added successfully",
  "data": {
    "id": 1,
    "stripe_payment_method_id": "pm_1234567890abcdef",
    "card_brand": "visa",
    "card_last4": "4242",
    "is_default": true
  }
}
```

---

### Get Payment Methods
**Endpoint:** `GET /customer/payment-methods`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "card_brand": "visa",
      "card_last4": "4242",
      "is_default": true,
      "expires_at": "2026-12-31"
    }
  ]
}
```

---

### Set Default Payment Method
**Endpoint:** `PUT /customer/payment-methods/{id}/default`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Default payment method updated successfully"
}
```

---

### Delete Payment Method
**Endpoint:** `DELETE /customer/payment-methods/{id}`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

---

## 🔄 Order Flow

### Complete Order Flow:
1. **Browse Menu** → User browses available items
2. **Add to Cart** → POST `/customer/cart/add`
3. **Review Cart** → GET `/customer/cart`
4. **Update Cart** (optional) → PUT/DELETE cart items
5. **Add Payment Method** (if not exists) → POST `/customer/payment-methods`
6. **Create Order** → POST `/customer/orders` with `payment_method_id`
7. **Payment Processed** → Stripe payment intent created
8. **Order Confirmed** → Status changes to `confirmed`
9. **Branch Prepares** → Status changes to `ready`
10. **Customer Picks Up** → Status changes to `completed`

---

## 🎯 Key Features

### Cart Features:
✅ **Session Persistence** - Cart persists across app restarts
✅ **Single Branch Rule** - Cart can only contain items from one branch
✅ **Real-time Totals** - Automatic subtotal, tax, and total calculation
✅ **Customizations** - Support for size, extras, modifications
✅ **Special Instructions** - Add notes for each item
✅ **Auto-expiry** - Carts expire after configured time period

### Order Features:
✅ **Authentication Required** - No guest orders allowed
✅ **Payment Required** - All orders must be paid via Stripe
✅ **Order Tracking** - Real-time status updates
✅ **4-Digit Pickup Code** - Unique code for order pickup
✅ **Commission Split** - Automatic platform commission calculation
✅ **Order History** - Filter by status, view past orders
✅ **Cancellation** - Cancel orders before completion

---

## ⚠️ Error Handling

| Status | Error | Solution |
|--------|-------|----------|
| 401 | Unauthenticated | User must login/register |
| 404 | Cart/Order not found | Check cart exists or create new |
| 422 | Different branch | Clear cart before adding new items |
| 422 | No payment method | Add payment method first |
| 400 | Empty cart | Add items before creating order |
| 400 | Payment failed | Check card/balance, retry payment |

---

## 🔐 Security

- **Bearer Token** required for all endpoints
- **User Isolation** - Users can only access their own carts/orders
- **Payment Security** - Stripe handles all payment processing
- **Session Validation** - Cart sessions expire automatically
- **Order Verification** - Orders linked to authenticated users only

---

## 📱 Mobile App Implementation

### Cart Workflow:
```dart
// 1. Get cart on app start
final cart = await cartService.getCart();

// 2. Add item to cart
await cartService.addItem(
  branchId: 16,
  menuItemId: 5,
  quantity: 2,
);

// 3. Create order (requires payment method)
final order = await orderService.createOrder(
  customerName: user.name,
  customerEmail: user.email,
  customerPhone: user.phone,
  paymentMethodId: user.defaultPaymentMethod.id,
);
```

### Error Handling:
```dart
try {
  await orderService.createOrder(...);
} catch (e) {
  if (e.statusCode == 401) {
    // Redirect to login
    Navigator.pushNamed(context, '/login');
  } else if (e.statusCode == 422) {
    // Show: Add payment method
    Navigator.pushNamed(context, '/add-payment-method');
  }
}
```

---

## 📞 Support

**API Version:** v1
**Backend:** Laravel + PostgreSQL + Stripe
**Authentication:** Sanctum Bearer Tokens
**Last Updated:** November 22, 2025

For issues or questions, provide:
- Request headers (Authorization token)
- Request body
- Response status and body
- User ID and session ID
