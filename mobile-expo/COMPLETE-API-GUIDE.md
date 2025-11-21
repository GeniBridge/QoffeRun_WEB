# QoffeRun Complete API Guide

**Base URL:** `https://api.qofferun.com/api/v1`  
**Last Updated:** November 18, 2025

---

## 🚀 Quick Start

### Payment Integration (Most Important!)

**The payment is processed automatically when creating an order** - you don't need to call separate payment endpoints.

**Simple Flow:**
1. Collect card details using Stripe CardField widget
2. Create Stripe PaymentMethod from card
3. Pass `payment_method_id` to `POST /customer/orders`
4. Payment is processed automatically with Stripe Connect

**Code Example:**
```dart
// 1. Create payment method from card
final paymentMethod = await Stripe.instance.createPaymentMethod(
  params: PaymentMethodParams.card(
    paymentMethodData: PaymentMethodData(),
  ),
);

// 2. Create order (payment processed automatically)
final response = await dio.post(
  'https://api.qofferun.com/api/v1/customer/orders',
  data: {
    'guest_id': guestId,
    'customer_name': 'John Doe',
    'customer_email': 'john@example.com',
    'payment_method_id': paymentMethod.id, // ← Key field
  },
);
```

**Common Mistake:**
- ❌ Calling `/customer/payment/create-intent` (doesn't exist)
- ✅ Including `payment_method_id` in `/customer/orders` request

---

## 📋 Table of Contents

1. [Authentication](#-authentication)
2. [Browse Branches & Menus](#-browse-branches--menus)
3. [Shopping Cart](#-shopping-cart)
4. [Order & Payment](#-order--payment)
5. [Saved Cards](#-saved-cards)
6. [Stripe Connect Payment Flow](#-stripe-connect-payment-flow)
7. [Flutter Implementation](#-flutter-implementation)
8. [Error Handling](#-error-handling)
9. [Testing Guide](#-testing-guide)

---

## 🔐 Authentication

### Register New Customer

**Endpoint:** `POST /register`  
**Authentication:** Not required

**Request Body:**
```json
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "password_confirmation": "SecurePass123!",
  "phone": "+393331234567"
}
```

**Response (Success - 200):**
```json
{
  "success": true,
  "message": "User registered successfully.",
  "user": {
    "id": 55,
    "name": "John Doe",
    "email": "john@example.com",
    "role": "customer"
  },
  "access_token": "201|abc123...",
  "token_type": "Bearer",
  "data": {
    "user": {...},
    "token": "201|abc123..."
  }
}
```

### Login

**Endpoint:** `POST /login`  
**Authentication:** Not required

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

**Response:** Same format as registration

📄 **See IMPORTANT-API-ENDPOINTS.md for complete auth documentation**

---

## 🏪 Browse Branches & Menus

### 1. Get Available Branches

**Endpoint:** `GET /customer/branches`  
**Authentication:** Not required

**Description:** Get all branches accepting online orders with menu items available.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "code": "CR001",
      "address": "Via del Corso 123, 00186 Roma (RM)",
      "phone": "+39 06 1234001",
      "chain": {
        "id": 16,
        "name": "Caffè Roma",
        "logo": "chains/logos/chain_16_brand_logo_1763382072.png"
      },
      "services": {
        "delivery": true,
        "takeaway": true,
        "table_service": false
      },
      "coordinates": {
        "lat": "41.90280000",
        "lng": "12.49640000"
      },
      "accepting_orders": true,
      "ordering_hours": {
        "start": "08:00:00",
        "end": "20:00:00"
      }
    }
  ]
}
```

---

### 2. Get Branch Menu

**Endpoint:** `GET /customer/branches/{branchId}/menu`  
**Authentication:** Not required

**Description:** Get all available menu items for a branch, grouped by category.

**Example:** `GET /customer/branches/16/menu`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "chain_name": "Caffè Roma"
    },
    "menu": [
      {
        "category": "coffee",
        "items": [
          {
            "id": 46,
            "name": "Cappuccino",
            "price": "2.50",
            "price_raw": 2.5,
            "category": "coffee",
            "image": "https://api.qofferun.com/storage/menu/cappuccino.jpg",
            "description": "Espresso with steamed milk foam",
            "is_available": true,
            "customizable": true,
            "customization_options": {
              "milk_type": {
                "label": "Tipo di latte",
                "required": false,
                "options": {
                  "regular": {"label": "Normale", "price": 0},
                  "soy": {"label": "Latte di soia", "price": 0.50}
                }
              },
              "size": {
                "label": "Dimensione",
                "required": true,
                "options": {
                  "regular": {"label": "Regolare", "price": 0},
                  "large": {"label": "Grande", "price": 0.50}
                }
              }
            }
          }
        ]
      }
    ]
  }
}
```

**Error (422)** - Branch not accepting orders:
```json
{
  "success": false,
  "message": "La filiale non accetta ordini in questo momento",
  "ordering_hours": {
    "start": "08:00:00",
    "end": "20:00:00"
  }
}
```

---

### 3. Get Menu Item Details

**Endpoint:** `GET /customer/menu-items/{itemId}`  
**Authentication:** Not required

**Description:** Get detailed info including customizations, allergens, nutritional info.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 46,
    "name": "Cappuccino",
    "description": "Espresso with steamed milk foam",
    "price": "2.50",
    "price_raw": 2.5,
    "customizable": true,
    "customization_options": {...},
    "nutritional_info": {
      "calories": 120,
      "protein": "6g"
    },
    "allergens": ["dairy"],
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso"
    }
  }
}
```

---

## 🛒 Shopping Cart

### Key Concepts

- **Guest Sessions:** Cart works for both logged-in and guest users
- **Guest ID:** Generate unique ID (UUID) on client, send with every request
- **Session ID:** Server returns session ID, store it for retrieving cart
- **Single Branch:** Cart can only contain items from one branch
- **Cart Expiration:** Carts expire after inactivity (configurable)

---

### 1. Add Item to Cart

**Endpoint:** `POST /customer/cart/add`  
**Authentication:** Not required

**Request Body:**
```json
{
  "branch_id": 16,
  "menu_item_id": 46,
  "quantity": 2,
  "customizations": {
    "milk_type": "soy",
    "size": "large"
  },
  "special_instructions": "Extra hot please",
  "guest_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Field Descriptions:**
- `branch_id` (required): Branch ID
- `menu_item_id` (required): Menu item ID
- `quantity` (required): 1-10
- `customizations` (optional): Object with selected customization keys
- `special_instructions` (optional): Customer notes (max 500 chars)
- `guest_id` (required for guests): Unique client-generated ID

**Response (200):**
```json
{
  "success": true,
  "message": "Item added to cart successfully",
  "data": {
    "cart_item_id": 123,
    "session_id": "guest-550e8400-e29b-41d4-a716-446655440000",
    "cart_summary": {
      "item_count": 2,
      "subtotal": 6.20,
      "total_amount": 7.56
    }
  }
}
```

**Error (422)** - Different branch:
```json
{
  "success": false,
  "message": "Cart already contains items from a different branch",
  "requires_cart_clear": true
}
```

---

### 2. Get Cart

**Endpoint:** `GET /customer/cart`  
**Authentication:** Not required

**Headers:**
```
X-Guest-ID: 550e8400-e29b-41d4-a716-446655440000
```

**Alternative:** Include `guest_id` in query params:  
`GET /customer/cart?guest_id=550e8400...`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 45,
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "chain_name": "Caffè Roma"
    },
    "items": [
      {
        "id": 123,
        "menu_item": {
          "id": 46,
          "name": "Cappuccino",
          "description": "Espresso with steamed milk foam",
          "image_url": "https://api.qofferun.com/storage/menu/cappuccino.jpg",
          "base_price": 2.50
        },
        "quantity": 2,
        "unit_price": 3.10,
        "total_price": 6.20,
        "customizations": {
          "milk_type": "Latte di soia (+€0.50)",
          "size": "Grande (+€0.10)"
        },
        "special_instructions": "Extra hot please"
      }
    ],
    "summary": {
      "item_count": 2,
      "subtotal": 6.20,
      "tax_amount": 1.36,
      "total_amount": 7.56
    },
    "expires_at": "2025-11-18T14:30:00Z"
  }
}
```

---

### 3. Update Cart Item

**Endpoint:** `PUT /customer/cart/items/{cartItemId}`  
**Authentication:** Not required

**Request Body:**
```json
{
  "quantity": 3
}
```

**Note:** Set quantity to 0 to remove item

**Response (200):**
```json
{
  "success": true,
  "message": "Cart item updated successfully",
  "data": {
    "cart_summary": {
      "item_count": 3,
      "subtotal": 9.30,
      "total_amount": 11.35
    }
  }
}
```

---

### 4. Remove Cart Item

**Endpoint:** `DELETE /customer/cart/items/{cartItemId}`  
**Authentication:** Not required

**Response (200):**
```json
{
  "success": true,
  "message": "Item removed from cart successfully",
  "data": {
    "cart_summary": {
      "item_count": 1,
      "subtotal": 3.10,
      "total_amount": 3.78
    }
  }
}
```

---

### 5. Clear Cart

**Endpoint:** `DELETE /customer/cart/clear`  
**Authentication:** Not required

**Headers:**
```
X-Guest-ID: 550e8400...
```

**Response (200):**
```json
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

## 💳 Order & Payment

### Payment Model

**QoffeRun uses Stripe Connect with split payments:**

1. Customer pays total amount
2. Platform takes commission (default 5%, min €0.50, max €10)
3. Branch receives remaining amount to their Stripe Connect account

**Payment Capture:** Manual capture (deferred settlement)
- Payment **authorized** when order created
- Funds **captured** when staff marks order ready
- Allows cancellation without charges

**IMPORTANT:** Payment is handled automatically in the order creation endpoint. You don't need to call a separate payment intent creation endpoint.

---

### 1. Create Order with Payment

**Endpoint:** `POST /customer/orders`  
**Authentication:** Optional (required to use saved default card)

**Request Body:**
```json
{
  "guest_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+393331234567",
  "payment_method_id": "pm_1234567890abcdef",
  "notes": "Please make it quickly"
}
```

**Headers:**
```
Authorization: Bearer {access_token}
Content-Type: application/json
```

**Field Descriptions:**
- `guest_id`: Same guest ID used for cart
- `customer_name`: Full name
- `customer_email`: Email for order confirmation
- `customer_phone`: Phone number (optional)
- `payment_method_id`: Stripe payment method ID (from client-side Stripe SDK)
- `notes`: Order notes (optional, max 1000 chars)

Note:
- If `payment_method_id` is omitted and you are authenticated, the API will use your saved default card.
- For guest orders, `payment_method_id` is required.

**Response (200):**
```json
{
  "success": true,
  "message": "Order created and payment processed successfully",
  "data": {
    "order": {
      "id": 789,
      "order_number": "QR2511181430123",
      "code_4digit": "1234",
      "branch_id": 16,
      "customer_name": "John Doe",
      "customer_email": "john@example.com",
      "customer_phone": "+393331234567",
      "subtotal_amount": 6.20,
      "tax_amount": 1.36,
      "commission_amount": 0.38,
      "total_amount": 7.56,
      "currency": "eur",
      "status": "confirmed",
      "payment_status": "paid",
      "stripe_payment_intent_id": "pi_3ABC123DEF456GHI",
      "created_at": "2025-11-18T12:30:00Z",
      "items": [
        {
          "id": 456,
          "menu_item_id": 46,
          "quantity": 2,
          "price_at_time": 3.10,
          "menuItem": {
            "id": 46,
            "name": "Cappuccino",
            "price": 2.50,
            "image_url": "https://api.qofferun.com/storage/menu/cappuccino.jpg"
          }
        }
      ]
    },
    "payment": {
      "payment_intent_id": "pi_3ABC123DEF456GHI",
      "amount_paid": 7.56,
      "commission_amount": 0.38,
      "branch_amount": 7.18
    }
  }
}
```

**Important:**
- Cart is **automatically cleared** after successful order
- Customer receives **4-digit pickup code**
- Payment is **authorized** but not yet captured
- Staff will capture payment when order ready

**Error (400)** - Cart not found:
```json
{
  "success": false,
  "message": "Cart not found or expired"
}
```

**Error (400)** - Payment failed:
```json
{
  "success": false,
  "message": "Payment failed: Insufficient funds"
}
```

---

### 2. Get Order Details

**Endpoint:** `GET /customer/orders/{orderId}`  
**Authentication:** Required

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 789,
    "order_number": "QR2511181430123",
    "code_4digit": "1234",
    "status": "confirmed",
    "payment_status": "paid",
    "total_amount": 7.56,
    "created_at": "2025-11-18T12:30:00Z",
    "branch": {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "phone": "+39 06 1234001",
      "chain": {
        "name": "Caffè Roma"
      }
    },
    "items": [...]
  }
}
```

---

## 💳 Saved Cards

Manage customer credit cards using Stripe. All endpoints require authentication (`Bearer` token) and operate on the current user.

### List Cards

**Endpoint:** `GET /customer/payment-methods`  
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 12,
      "user_id": 55,
      "card_brand": "visa",
      "card_last4": "4242",
      "card_exp_month": 12,
      "card_exp_year": 2027,
      "is_default": true,
      "display_name": "Visa •••• 4242",
      "is_expired": false,
      "created_at": "2025-11-18T12:00:00Z"
    }
  ]
}
```

### Add Card

Attach a Stripe `payment_method_id` created on the client.

**Endpoint:** `POST /customer/payment-methods`  
**Auth:** Required

**Body:**
```json
{
  "payment_method_id": "pm_1Nv...",
  "set_as_default": true
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Payment method added successfully",
  "data": {
    "id": 13,
    "card_brand": "visa",
    "card_last4": "4242",
    "is_default": true,
    "display_name": "Visa •••• 4242",
    "is_expired": false
  }
}
```

Rules:
- First added card becomes default if `set_as_default` is not provided
- On `set_as_default: true`, all other cards are unset as default
- Do not use `pm_test_*` here; provide a real `pm_...` from the client SDK

### Get Default Card

**Endpoint:** `GET /customer/payment-methods/default`  
**Auth:** Required

**Response (200):** same object as list item.  
**Response (404):** `{ "success": false, "message": "No default payment method found" }`

### Set Default Card

**Endpoint:** `PUT /customer/payment-methods/{id}/default`  
**Auth:** Required

**Response (200):** `{ "success": true, "message": "Payment method set as default" }`  
**Error (422):** Cannot set expired card as default

### Remove Card

**Endpoint:** `DELETE /customer/payment-methods/{id}`  
**Auth:** Required

Behavior:
- Detaches from Stripe and deletes locally
- If the removed card was default, the most recent valid card becomes default

**Response (200):** `{ "success": true, "message": "Payment method deleted successfully" }`

Client Tip:
- To use the default card at checkout, simply omit `payment_method_id` in `POST /customer/orders` (must be authenticated).

## 🔄 Stripe Connect Payment Flow

### Overview

The payment is processed **directly when creating an order** - there's no separate payment intent creation step needed.

### Complete Integration Steps

#### Step 1: Setup Stripe SDK

```dart
// pubspec.yaml
dependencies:
  flutter_stripe: ^10.0.0
  dio: ^5.0.0
  uuid: ^4.0.0
  
// main.dart
import 'package:flutter_stripe/flutter_stripe.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  // Get Stripe publishable key from API
  final response = await Dio().get('https://api.qofferun.com/api/v1/stripe/config');
  final publishableKey = response.data['stripe_publishable_key'];
  
  Stripe.publishableKey = publishableKey;
  await Stripe.instance.applySettings();
  
  runApp(MyApp());
}
```

#### Step 2: Collect Card Information & Create Payment Method

```dart
class CheckoutScreen extends StatefulWidget {
  final Cart cart;
  
  CheckoutScreen({required this.cart});
  
  @override
  _CheckoutScreenState createState() => _CheckoutScreenState();
}

class _CheckoutScreenState extends State<CheckoutScreen> {
  CardFieldInputDetails? _card;
  bool _loading = false;
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('Checkout')),
      body: Padding(
        padding: EdgeInsets.all(16),
        child: Column(
          children: [
            // Order Summary
            Text('Total: €${widget.cart.summary.totalAmount.toStringAsFixed(2)}',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            SizedBox(height: 20),
            
            // Stripe Card Field Widget
            CardField(
              onCardChanged: (card) {
                setState(() => _card = card);
              },
              enablePostalCode: true,
            ),
            
            SizedBox(height: 20),
            
            ElevatedButton(
              onPressed: _card?.complete == true && !_loading 
                ? _processOrder 
                : null,
              style: ElevatedButton.styleFrom(
                minimumSize: Size(double.infinity, 50),
              ),
              child: _loading 
                ? CircularProgressIndicator(color: Colors.white)
                : Text('Pay €${widget.cart.summary.totalAmount.toStringAsFixed(2)}'),
            ),
          ],
        ),
      ),
    );
  }
  
  Future<void> _processOrder() async {
    setState(() => _loading = true);
    
    try {
      // Step 1: Create payment method from card
      final paymentMethod = await Stripe.instance.createPaymentMethod(
        params: PaymentMethodParams.card(
          paymentMethodData: PaymentMethodData(),
        ),
      );
      
      // Step 2: Create order with payment (payment processed automatically)
      final order = await _createOrderWithPayment(paymentMethod.id);
      
      // Step 3: Handle 3D Secure if required
      if (order.requiresAction && order.clientSecret != null) {
        await _handle3DSecure(order.clientSecret!);
      }
      
      // Step 4: Show success
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => OrderSuccessScreen(order: order),
        ),
      );
      
    } on StripeException catch (e) {
      _showError('Card error: ${e.error.localizedMessage}');
    } catch (e) {
      _showError('Payment failed: $e');
    } finally {
      setState(() => _loading = false);
    }
  }
  
  Future<Order> _createOrderWithPayment(String paymentMethodId) async {
    final dio = Dio();
    final guestId = await getGuestId();
    
    final response = await dio.post(
      'https://api.qofferun.com/api/v1/customer/orders',
      data: {
        'guest_id': guestId,
        'customer_name': 'John Doe', // Get from form or user profile
        'customer_email': 'john@example.com',
        'customer_phone': '+393331234567',
        'payment_method_id': paymentMethodId, // ← Stripe Payment Method ID
        'notes': 'Please make it quickly',
      },
    );
    
    if (response.data['success']) {
      return Order.fromJson(response.data['data']['order']);
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  Future<void> _handle3DSecure(String clientSecret) async {
    final paymentIntent = await Stripe.instance.handleNextAction(clientSecret);
    
    if (paymentIntent.status != PaymentIntentsStatus.Succeeded &&
        paymentIntent.status != PaymentIntentsStatus.RequiresCapture) {
      throw Exception('3D Secure authentication failed');
    }
  }
  
  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(message),
        backgroundColor: Colors.red,
      ),
    );
  }
}
```

#### Step 3: Handle Order Response

---

## 📱 Flutter Implementation

### Complete Order Service

```dart
import 'package:dio/dio.dart';

class OrderService {
  final Dio _dio;
  final String baseUrl = 'https://api.qofferun.com/api/v1';
  
  OrderService(this._dio);
  
  /// Add item to cart with customizations
  Future<CartSummary> addToCart({
    required int branchId,
    required int menuItemId,
    required int quantity,
    Map<String, String>? customizations,
    String? specialInstructions,
  }) async {
    final guestId = await _getGuestId();
    
    final response = await _dio.post(
      '$baseUrl/customer/cart/add',
      data: {
        'branch_id': branchId,
        'menu_item_id': menuItemId,
        'quantity': quantity,
        'customizations': customizations,
        'special_instructions': specialInstructions,
        'guest_id': guestId,
      },
    );
    
    if (response.data['success']) {
      // Save session ID
      final sessionId = response.data['data']['session_id'];
      await _saveSessionId(sessionId);
      
      return CartSummary.fromJson(response.data['data']['cart_summary']);
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  /// Get current cart
  Future<Cart> getCart() async {
    final guestId = await _getGuestId();
    
    final response = await _dio.get(
      '$baseUrl/customer/cart',
      options: Options(
        headers: {'X-Guest-ID': guestId},
      ),
    );
    
    if (response.data['success']) {
      return Cart.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  /// Update cart item quantity
  Future<CartSummary> updateCartItem(int cartItemId, int quantity) async {
    final response = await _dio.put(
      '$baseUrl/customer/cart/items/$cartItemId',
      data: {'quantity': quantity},
    );
    
    if (response.data['success']) {
      return CartSummary.fromJson(response.data['data']['cart_summary']);
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  /// Remove item from cart
  Future<CartSummary> removeCartItem(int cartItemId) async {
    final response = await _dio.delete(
      '$baseUrl/customer/cart/items/$cartItemId',
    );
    
    if (response.data['success']) {
      return CartSummary.fromJson(response.data['data']['cart_summary']);
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  /// Clear entire cart
  Future<void> clearCart() async {
    final guestId = await _getGuestId();
    
    final response = await _dio.delete(
      '$baseUrl/customer/cart/clear',
      options: Options(
        headers: {'X-Guest-ID': guestId},
      ),
    );
    
    if (!response.data['success']) {
      throw Exception(response.data['message']);
    }
  }
  
  /// Create order from cart with payment
  Future<Order> createOrder({
    required String customerName,
    required String customerEmail,
    String? customerPhone,
    required String paymentMethodId,
    String? notes,
  }) async {
    final guestId = await _getGuestId();
    final token = await _getAuthToken();
    
    final response = await _dio.post(
      '$baseUrl/customer/orders',
      data: {
        'guest_id': guestId,
        'customer_name': customerName,
        'customer_email': customerEmail,
        'customer_phone': customerPhone,
        'payment_method_id': paymentMethodId,
        'notes': notes,
      },
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      ),
    );
    
    if (response.data['success']) {
      return Order.fromJson(response.data['data']['order']);
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  /// Get order details
  Future<Order> getOrder(int orderId) async {
    final token = await _getAuthToken();
    
    final response = await _dio.get(
      '$baseUrl/customer/orders/$orderId',
      options: Options(
        headers: {'Authorization': 'Bearer $token'},
      ),
    );
    
    if (response.data['success']) {
      return Order.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  // Helper methods
  Future<String> _getGuestId() async {
    final prefs = await SharedPreferences.getInstance();
    String? guestId = prefs.getString('guest_id');
    
    if (guestId == null) {
      guestId = const Uuid().v4();
      await prefs.setString('guest_id', guestId);
    }
    
    return guestId;
  }
  
  Future<void> _saveSessionId(String sessionId) async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString('session_id', sessionId);
  }
  
  Future<String> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token == null) throw Exception('Not authenticated');
    return token;
  }
}
```

### Models

```dart
class Cart {
  final int id;
  final Branch branch;
  final List<CartItem> items;
  final CartSummary summary;
  final DateTime expiresAt;
  
  Cart({
    required this.id,
    required this.branch,
    required this.items,
    required this.summary,
    required this.expiresAt,
  });
  
  factory Cart.fromJson(Map<String, dynamic> json) {
    return Cart(
      id: json['id'],
      branch: Branch.fromJson(json['branch']),
      items: (json['items'] as List)
          .map((item) => CartItem.fromJson(item))
          .toList(),
      summary: CartSummary.fromJson(json['summary']),
      expiresAt: DateTime.parse(json['expires_at']),
    );
  }
}

class CartItem {
  final int id;
  final MenuItem menuItem;
  final int quantity;
  final double unitPrice;
  final double totalPrice;
  final Map<String, String> customizations;
  final String? specialInstructions;
  
  CartItem({
    required this.id,
    required this.menuItem,
    required this.quantity,
    required this.unitPrice,
    required this.totalPrice,
    required this.customizations,
    this.specialInstructions,
  });
  
  factory CartItem.fromJson(Map<String, dynamic> json) {
    return CartItem(
      id: json['id'],
      menuItem: MenuItem.fromJson(json['menu_item']),
      quantity: json['quantity'],
      unitPrice: double.parse(json['unit_price'].toString()),
      totalPrice: double.parse(json['total_price'].toString()),
      customizations: Map<String, String>.from(json['customizations'] ?? {}),
      specialInstructions: json['special_instructions'],
    );
  }
}

class CartSummary {
  final int itemCount;
  final double subtotal;
  final double taxAmount;
  final double totalAmount;
  
  CartSummary({
    required this.itemCount,
    required this.subtotal,
    required this.taxAmount,
    required this.totalAmount,
  });
  
  factory CartSummary.fromJson(Map<String, dynamic> json) {
    return CartSummary(
      itemCount: json['item_count'],
      subtotal: double.parse(json['subtotal'].toString()),
      taxAmount: double.parse(json['tax_amount'].toString()),
      totalAmount: double.parse(json['total_amount'].toString()),
    );
  }
}

class Order {
  final int id;
  final String orderNumber;
  final String code4digit;
  final String status;
  final String paymentStatus;
  final double totalAmount;
  final Branch branch;
  final List<OrderItem> items;
  final DateTime createdAt;
  
  Order({
    required this.id,
    required this.orderNumber,
    required this.code4digit,
    required this.status,
    required this.paymentStatus,
    required this.totalAmount,
    required this.branch,
    required this.items,
    required this.createdAt,
  });
  
  factory Order.fromJson(Map<String, dynamic> json) {
    return Order(
      id: json['id'],
      orderNumber: json['order_number'],
      code4digit: json['code_4digit'],
      status: json['status'],
      paymentStatus: json['payment_status'],
      totalAmount: double.parse(json['total_amount'].toString()),
      branch: Branch.fromJson(json['branch']),
      items: (json['items'] as List)
          .map((item) => OrderItem.fromJson(item))
          .toList(),
      createdAt: DateTime.parse(json['created_at']),
    );
  }
}
```

---

## ⚠️ Error Handling

### Common Errors & Solutions

| Status Code | Error Message | Solution |
|-------------|---------------|----------|
| 400 | Cart not found or expired | Add items to cart first |
| 400 | Cart is empty | Add items before creating order |
| 400 | Payment failed | Check card details, try again |
| 404 | Branch not found | Verify branch ID exists |
| 404 | Menu item not found | Item may have been removed |
| 404 | Route .../payment/create-intent not found | **Don't call this route!** Payment is handled automatically in `POST /customer/orders` |
| 422 | Cart contains items from different branch | Clear cart first |
| 422 | Branch not accepting orders | Show ordering hours |
| 422 | Invalid customizations | Validate against menu item options |
| 422 | Validation failed | Check required fields |
| 500 | Server error | Show generic error, retry |

### ⚠️ Important: Payment Flow

**WRONG:**
```dart
// ❌ Don't do this - route doesn't exist!
await dio.post('/customer/payment/create-intent');
```

**CORRECT:**
```dart
// ✅ Payment is processed automatically in order creation
final paymentMethod = await Stripe.instance.createPaymentMethod(...);
await dio.post('/customer/orders', data: {
  'payment_method_id': paymentMethod.id,
  ...
});
```

### Error Response Format

```json
{
  "success": false,
  "message": "Error description",
  "errors": {
    "field_name": ["Validation error message"]
  },
  "requires_cart_clear": true
}
```

### Flutter Error Handling Example

```dart
try {
  await orderService.addToCart(...);
} on DioException catch (e) {
  final data = e.response?.data;
  
  if (data?['requires_cart_clear'] == true) {
    // Show dialog to clear cart
    final clear = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Clear Cart?'),
        content: Text(data['message']),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Clear Cart'),
          ),
        ],
      ),
    );
    
    if (clear == true) {
      await orderService.clearCart();
      // Retry adding item
      await orderService.addToCart(...);
    }
  } else {
    // Show generic error
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(data?['message'] ?? 'An error occurred')),
    );
  }
}
```

---

## 🧪 Testing Guide

### Test Branch

**Branch ID:** 16  
**Name:** Caffè Roma - Via del Corso  
**Status:** Active with Stripe configured

### Test Flow

```bash
# 0. (Optional) Add a saved card (requires auth token)
# Create a real Stripe payment method client-side and paste its id below
curl -X POST 'https://api.qofferun.com/api/v1/customer/payment-methods' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "payment_method_id": "pm_1XXX_FROM_CLIENT_SDK",
    "set_as_default": true
  }'

# 1. Get available branches
curl 'https://api.qofferun.com/api/v1/customer/branches'

# 2. Get branch menu
curl 'https://api.qofferun.com/api/v1/customer/branches/16/menu'

# 3. Add item to cart
curl -X POST 'https://api.qofferun.com/api/v1/customer/cart/add' \
  -H 'Content-Type: application/json' \
  -d '{
    "branch_id": 16,
    "menu_item_id": 46,
    "quantity": 1,
    "customizations": {"size": "regular"},
    "guest_id": "test-guest-123"
  }'

# 4. Get cart
curl 'https://api.qofferun.com/api/v1/customer/cart' \
  -H 'X-Guest-ID: test-guest-123'

# 5. Register/Login
curl -X POST 'https://api.qofferun.com/api/v1/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test@example.com",
    "password": "TestPass123!",
    "password_confirmation": "TestPass123!"
  }'

# 6. Create order (requires Stripe payment_method_id from client SDK)
curl -X POST 'https://api.qofferun.com/api/v1/customer/orders' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "guest_id": "test-guest-123",
    "customer_name": "Test User",
    "customer_email": "test@example.com",
    "payment_method_id": "pm_card_visa"
  }'
```

### Stripe Test Cards

Use these test cards for development and testing:

| Card Number | Description | CVC | Expiry | Note |
|-------------|-------------|-----|--------|------|
| 4242 4242 4242 4242 | Success | Any 3 digits | Any future date | Always succeeds |
| 4000 0025 0000 3155 | Requires 3D Secure | Any | Any | Tests authentication |
| 4000 0000 0000 9995 | Declined | Any | Any | Always fails |
| 4000 0000 0000 0341 | Attaches to customer | Any | Any | For saved cards |

**Backend Test Mode:**
- You can also pass `payment_method_id` starting with `pm_test_` (e.g., `pm_test_123`) for quick testing
- Backend will simulate successful payment without calling Stripe
- Returns test payment intent ID: `pi_test_...`

**Test Example:**
```dart
// Quick test without Stripe SDK
final response = await dio.post(
  'https://api.qofferun.com/api/v1/customer/orders',
  data: {
    'guest_id': guestId,
    'customer_name': 'Test User',
    'customer_email': 'test@example.com',
    'payment_method_id': 'pm_test_123', // ← Mock payment method
  },
);
```

More test cards: https://stripe.com/docs/testing#cards

---

## 💡 Best Practices

### 1. Guest ID Management

```dart
class GuestIdManager {
  static const _key = 'guest_id';
  
  static Future<String> getOrCreate() async {
    final prefs = await SharedPreferences.getInstance();
    String? guestId = prefs.getString(_key);
    
    if (guestId == null) {
      guestId = const Uuid().v4();
      await prefs.setString(_key, guestId);
    }
    
    return guestId;
  }
  
  static Future<void> clear() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(_key);
  }
}
```

### 2. Cart State Management

```dart
class CartProvider extends ChangeNotifier {
  Cart? _cart;
  bool _loading = false;
  
  Cart? get cart => _cart;
  bool get loading => _loading;
  int get itemCount => _cart?.summary.itemCount ?? 0;
  double get total => _cart?.summary.totalAmount ?? 0.0;
  
  Future<void> loadCart() async {
    _loading = true;
    notifyListeners();
    
    try {
      _cart = await OrderService().getCart();
    } catch (e) {
      _cart = null;
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
  
  Future<void> addItem(MenuItem item, int quantity, Map<String, String>? customizations) async {
    await OrderService().addToCart(
      branchId: item.branchId,
      menuItemId: item.id,
      quantity: quantity,
      customizations: customizations,
    );
    await loadCart();
  }
  
  Future<void> removeItem(int cartItemId) async {
    await OrderService().removeCartItem(cartItemId);
    await loadCart();
  }
  
  Future<void> clear() async {
    await OrderService().clearCart();
    _cart = null;
    notifyListeners();
  }
}
```

### 3. Image Caching

```dart
dependencies:
  cached_network_image: ^3.3.0
  
// Usage
CachedNetworkImage(
  imageUrl: item.imageUrl,
  fit: BoxFit.cover,
  memCacheWidth: 400,
  placeholder: (context, url) => ShimmerPlaceholder(),
  errorWidget: (context, url, error) => Icon(Icons.restaurant),
)
```

### 4. Debouncing Cart Updates

```dart
class CartUpdateDebouncer {
  Timer? _timer;
  final Duration delay;
  
  CartUpdateDebouncer({this.delay = const Duration(milliseconds: 500)});
  
  void call(VoidCallback action) {
    _timer?.cancel();
    _timer = Timer(delay, action);
  }
  
  void dispose() {
    _timer?.cancel();
  }
}

// Usage
final _debouncer = CartUpdateDebouncer();

void updateQuantity(int cartItemId, int quantity) {
  _debouncer(() async {
    await orderService.updateCartItem(cartItemId, quantity);
    await loadCart();
  });
}
```

---

## 📊 Complete Order Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CUSTOMER ORDER FLOW                      │
└─────────────────────────────────────────────────────────────┘

1. Browse & Select
   │
   ├─→ GET /customer/branches
   │   └─→ Display list of available branches
   │
   ├─→ GET /customer/branches/{id}/menu
   │   └─→ Show menu items grouped by category
   │
   └─→ GET /customer/menu-items/{id}
       └─→ View item details & customizations

2. Build Cart
   │
   ├─→ POST /customer/cart/add
   │   └─→ Add item with customizations
   │
   ├─→ GET /customer/cart
   │   └─→ Review cart contents
   │
   └─→ PUT /customer/cart/items/{id}
       └─→ Update quantities

3. Authenticate
   │
   └─→ POST /register or /login
       └─→ Receive access token

4. Payment Setup
   │
   └─→ Stripe.createPaymentMethod()
       └─→ Get payment_method_id

5. Place Order
   │
   └─→ POST /customer/orders
       ├─→ Payment authorized (not captured)
       ├─→ Order created
       ├─→ Cart cleared
       └─→ Receive 4-digit pickup code

6. Order Completion (Staff Side)
   │
   └─→ POST /orders/{id}/capture
       ├─→ Payment captured
       ├─→ Funds transferred to branch
       └─→ Order marked complete

7. Customer Pickup
   │
   └─→ Show 4-digit code to staff
       └─→ Receive order
```

---

## 📚 Related Documentation

- **Authentication Details:** `IMPORTANT-API-ENDPOINTS.md`
- **Chain/Branch Images:** `IMAGE-URLS-FIXED.md`
- **Menu & Customization:** `MENU-CUSTOMIZATION-API.md`
- **API Test Results:** `API-TEST-RESULTS.md`
- **System Settings:** `../SETTINGS_API_DOCUMENTATION.md`

---

## 🔗 Quick Links

- **Stripe Documentation:** https://stripe.com/docs
- **Flutter Stripe Plugin:** https://pub.dev/packages/flutter_stripe
- **Stripe Test Cards:** https://stripe.com/docs/testing#cards
- **Stripe Connect:** https://stripe.com/docs/connect

---

## 📞 Support

**Email:** support@qofferun.com  
**API Issues:** Create an issue with request/response details  
**Version:** v1  
**Last Updated:** November 18, 2025

---

## ✅ Implementation Checklist

- [ ] Setup Stripe SDK in Flutter app
- [ ] Implement guest ID generation and storage
- [ ] Create cart management service
- [ ] Build menu browsing UI
- [ ] Implement customization selection
- [ ] Add payment method collection
- [ ] Handle order creation flow
- [ ] Implement error handling
- [ ] Add loading states
- [ ] Test with Stripe test cards
- [ ] Implement order history
- [ ] Add push notifications for order status
- [ ] Cache images and data
- [ ] Add analytics tracking

**Next Steps:** Start with authentication, then implement cart, finally add payment integration.
