# QoffeRun API Documentation for Flutter App

Base URL: `https://api.qofferun.com/api/v1`

## 📋 Quick Reference - What's Included

This API provides **complete mobile app functionality** including:

✅ **Branch Discovery**
- List all branches with filters
- Search by location (GPS radius) or text
- Get branch details with complete info

✅ **Opening Hours & Status**
- Complete weekly schedule (Monday-Sunday)
- Real-time open/closed status (`is_open_now`)
- Today's hours with open/close times
- Closed days marked explicitly

✅ **Menu & Products**
- Full categorized menu (Coffee, Pastries, etc.)
- Product details (name, description, price, image)
- Availability status per item
- Customization options (extras, variations)
- Allergen information
- Preparation time estimates

✅ **Reviews & Ratings**
- Average rating per branch
- Total review count
- Recent customer reviews with comments
- Review dates and customer names

✅ **Chain Information**
- Chain name, logo, and cover images
- Chain description
- All branches under a chain

✅ **Services**
- Delivery availability
- Takeaway/pickup options
- Table service capability
- Payment readiness (Stripe Connect status)

✅ **Authentication & Users**
- Register, Login, Password reset
- Social login support (Google, Apple)
- Secure token-based auth

✅ **Cart & Orders**
- Guest and authenticated cart management
- Direct order creation (mobile-optimized)
- Order history with filters
- Order status tracking
- Stripe payment integration

---

## Authentication APIs

### Register
```
POST /register
Content-Type: application/json

Body (Option A - single field name):
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "yourPassw0rd!",          // min 8 chars
  "password_confirmation": "yourPassw0rd!"
}

Body (Option B - first/last name pair):
{
  "first_name": "John",
  "last_name": "Doe",
  "email": "john@example.com",
  "password": "yourPassw0rd!",          // min 8 chars
  "password_confirmation": "yourPassw0rd!",
  "phone": "+391234567890"             // optional
}

Notes:
- Do not send `role`; the system assigns `customer` by default.
- Extra fields are safely ignored.

Response:
{
  "success": true,
  "data": {
    "user": {"id": 1, "name": "John Doe", "email": "john@example.com", "role": "customer"},
    "token": "string"
  }
}
```

### Login
```
POST /login
Content-Type: application/json

Body:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "success": true,
  "data": {
    "user": {...},
    "token": "string"
  }
}
```

### Forgot Password
```
POST /auth/forgot-password
Content-Type: application/json

Body:
{
  "email": "string"
}

Response:
{
  "success": true,
  "message": "Password reset link sent"
}
```

### Reset Password
```
POST /auth/reset-password
Content-Type: application/json

Body:
{
  "email": "string",
  "token": "string",
  "password": "string",
  "password_confirmation": "string"
}
```

### Get Current User
```
GET /me
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "email": "string",
    ...
  }
}
```

### Social Login (Optional)
```
POST /auth/social-login
Content-Type: application/json

Body:
{
  "provider": "google|apple|facebook",
  "token": "string"
}
```

## Public Branch Discovery APIs

### List Public Branches
```
GET /public/branches?eligible=true
No authentication required

Query Parameters:
- eligible: boolean (optional) - filter only eligible branches

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Branch Name",
      "address": "Via Roma 123, 00100 Roma (RM)",
      "city": "Roma",
      "province": "RM",
      "phone": "+39 06 1234567",
      "lat": 41.9028,
      "lng": 12.4964,
      "chain": {
        "id": 1,
        "name": "Chain Name",
        "logo_url": "https://api.qofferun.com/storage/chains/logo.jpg",
        "cover_url": "https://api.qofferun.com/storage/chains/cover.jpg",
        "description": "Autentico caffè italiano"
      },
      "products_count": 25,
      "delivery_enabled": true,
      "takeaway_enabled": true,
      "table_service_enabled": false,
      "opening_hours": {
        "monday": { "open": "08:00", "close": "20:00", "closed": false },
        "tuesday": { "open": "08:00", "close": "20:00", "closed": false },
        "wednesday": { "open": "08:00", "close": "20:00", "closed": false },
        "thursday": { "open": "08:00", "close": "20:00", "closed": false },
        "friday": { "open": "08:00", "close": "20:00", "closed": false },
        "saturday": { "open": "09:00", "close": "19:00", "closed": false },
        "sunday": { "open": "09:00", "close": "19:00", "closed": true }
      },
      "is_open_now": true,
      "today_hours": { "open": "08:00", "close": "20:00", "closed": false },
      "has_stripe_account": true
    }
  ],
  "total": 15
}

Note: This endpoint returns branches that:
- Have Stripe Connect account configured (can accept payments)
- Have GPS coordinates (lat/lng)
- Have at least 5 menu items
- Are marked as active
- Include real-time open/closed status
- Include complete opening hours for the week
```

### Search Branches
```
GET /public/branches/search?query=coffee&lat=41.9028&lng=12.4964&radius=5
No authentication required

Query Parameters:
- query: string (optional) - search by branch name, address, city, or chain name
- lat: number (optional) - latitude for location-based search
- lng: number (optional) - longitude for location-based search
- radius: number (optional, default 10) - search radius in kilometers

Response: Same structure as List Public Branches

Note: 
- Location search calculates distance from provided coordinates
- Results are ordered by distance when lat/lng provided
- Text search is case-insensitive
- Can combine text search with location filtering
```

### Get Branch Details
```
GET /public/branches/{branchId}
No authentication required

Response:
{
  "success": true,
  "data": {
    "branch": {
      "id": 1,
      "name": "Branch Name",
      "address": "Via Roma 123, 00100 Roma (RM)",
      "city": "Roma",
      "postal_code": "00100",
      "phone": "+39 06 1234567",
      "email": "branch@example.com",
      "latitude": 41.9028,
      "longitude": 12.4964,
      "delivery_enabled": true,
      "takeaway_enabled": true,
      "table_service_enabled": false,
      "opening_hours": {
        "monday": { "open": "08:00", "close": "20:00", "closed": false },
        "tuesday": { "open": "08:00", "close": "20:00", "closed": false },
        "wednesday": { "open": "08:00", "close": "20:00", "closed": false },
        "thursday": { "open": "08:00", "close": "20:00", "closed": false },
        "friday": { "open": "08:00", "close": "20:00", "closed": false },
        "saturday": { "open": "09:00", "close": "19:00", "closed": false },
        "sunday": { "open": "09:00", "close": "19:00", "closed": true }
      },
      "is_open_now": true,
      "today_hours": { "open": "08:00", "close": "20:00", "closed": false }
    },
    "chain": {
      "id": 1,
      "name": "Chain Name",
      "logo": "https://api.qofferun.com/storage/chains/logo.jpg",
      "cover": "https://api.qofferun.com/storage/chains/cover.jpg",
      "description": "Autentico caffè italiano"
    },
    "menu": {
      "Coffee": [
        {
          "id": 1,
          "name": "Espresso",
          "description": "Classic Italian espresso",
          "price": 2.5,
          "image_url": "https://...",
          "is_available": true,
          "preparation_time": 5,
          "allergens": ["caffeine"],
          "customization_options": {
            "sugar": ["none", "little", "normal", "extra"],
            "extras": [
              { "id": 1, "name": "Extra shot", "price": 0.5 }
            ]
          },
          "menu_id": 1
        }
      ],
      "Pastries": [...]
    },
    "reviews": {
      "average_rating": 4.7,
      "total_reviews": 128,
      "recent_reviews": [
        {
          "id": 1,
          "customer_name": "Mario R.",
          "rating": 5,
          "comment": "Ottimo servizio e prodotti eccellenti!",
          "date": "2025-11-10"
        }
      ]
    },
    "stats": {
      "products_count": 25,
      "has_stripe_account": true
    }
  }
}

Note: This endpoint includes:
- Complete opening hours for all days of the week
- Real-time open/closed status (is_open_now)
- Full menu organized by categories
- Customer reviews and ratings
- Chain information (logo, cover, description)
```

## Customer Menu & Browsing APIs

### Get Ordering Branches
```
GET /customer/branches
No authentication required (works for guest users)

Response:
{
  "success": true,
  "data": [...]
}
```

### Get Branch Menu
```
GET /customer/branches/{branchId}/menu
No authentication required

Response:
{
  "success": true,
  "data": {
    "branch_id": 1,
    "menu": [
      {
        "category": "Coffee",
        "items": [
          {
            "id": 1,
            "name": "Espresso",
            "description": "string",
            "price": "2.50",
            "price_raw": 2.5,
            "category": "Coffee",
            "image": "url",
            "available": true,
            "extras": [
              {
                "id": 1,
                "name": "Extra shot",
                "price": 0.5
              }
            ]
          }
        ]
      }
    ]
  }
}
```

### Get Menu Item Details
```
GET /customer/menu-items/{itemId}
No authentication required

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "string",
    "description": "string",
    "price": 2.5,
    "category": "string",
    "image": "url",
    "available": true,
    "extras": [...]
  }
}
```

## Cart APIs (Guest or Authenticated)

### Get Cart
```
GET /customer/cart
Headers:
- X-Session-ID: {guest_id} (for guest users)
- Authorization: Bearer {token} (for authenticated users)

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "branch_id": 1,
    "items": [
      {
        "id": 1,
        "menu_item_id": 1,
        "quantity": 2,
        "price": 2.5,
        "menu_item": {...}
      }
    ],
    "subtotal": 5.0,
    "tax": 0.5,
    "total": 5.5
  }
}
```

### Add Item to Cart
```
POST /customer/cart/add
Content-Type: application/json

Body:
{
  "menu_item_id": 1,
  "quantity": 1,
  "customizations": {
    "extras": [1, 2]
  }
}

Response:
{
  "success": true,
  "data": {...}
}
```

### Update Cart Item
```
PUT /customer/cart/items/{cartItemId}
Content-Type: application/json

Body:
{
  "quantity": 2,
  "customizations": {...}
}
```

### Remove Cart Item
```
DELETE /customer/cart/items/{cartItemId}

Response:
{
  "success": true,
  "message": "Item removed"
}
```

### Clear Cart
```
DELETE /customer/cart/clear

Response:
{
  "success": true,
  "message": "Cart cleared"
}
```

## Order APIs

### Create Order (Direct - for mobile apps)
```
POST /customer/orders/direct
Content-Type: application/json

Body:
{
  "branch_id": 1,
  "items": [
    {
      "menu_item_id": 1,
      "quantity": 2,
      "extras": [1, 2]
    }
  ],
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "payment_method_id": "pm_card_visa",
  "notes": "Extra hot"
}

Response:
{
  "success": true,
  "message": "Order created successfully",
  "data": {
    "id": 1,
    "order_number": "ORD-12345",
    "code_4digit": "1234",
    "status": "pending",
    "payment_status": "paid",
    "total": 5.5,
    "items": [...]
  }
}
```

### Create Order (From Cart)
```
POST /customer/orders
Content-Type: application/json

Body:
{
  "guest_id": "guest_123456",
  "customer_name": "John Doe",
  "customer_email": "john@example.com",
  "customer_phone": "+1234567890",
  "payment_method_id": "pm_card_visa",
  "notes": "Extra hot"
}
```

### Get Order Details
```
GET /customer/orders/{orderId}
Authorization: Bearer {token}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "order_number": "ORD-12345",
    "code_4digit": "1234",
    "status": "pending|preparing|ready|completed|cancelled",
    "payment_status": "paid|failed",
    "branch_id": 1,
    "customer_name": "string",
    "customer_email": "string",
    "subtotal_amount": 5.0,
    "tax_amount": 0.5,
    "total_amount": 5.5,
    "created_at": "2025-11-17T00:00:00Z",
    "items": [...]
  }
}
```

### Get My Orders
```
GET /orders?status=pending&per_page=20
Authorization: Bearer {token}

Query Parameters:
- status: string (optional) - filter by status
- per_page: number (optional, default 15)
- page: number (optional, default 1)

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "order_number": "ORD-12345",
      "status": "pending",
      "total": 5.5,
      "created_at": "2025-11-17T00:00:00Z"
    }
  ],
  "meta": {
    "current_page": 1,
    "total": 50,
    "per_page": 20
  }
}
```

### Capture Payment (If needed)
```
POST /customer/orders/{orderId}/capture
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Payment captured"
}
```

### Cancel Payment
```
POST /customer/orders/{orderId}/cancel
Authorization: Bearer {token}

Response:
{
  "success": true,
  "message": "Payment cancelled"
}
```

## Reviews APIs

### Create Review
```
POST /branches/{branchId}/reviews
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "rating": 5,
  "comment": "Great service!"
}

Requirements:
- User must have at least 1 completed order at this branch

Response:
{
  "success": true,
  "message": "Review created successfully",
  "data": {
    "id": 1,
    "rating": 5,
    "comment": "string",
    "user_name": "string",
    "created_at": "2025-11-17T00:00:00Z"
  }
}
```

### Get Branch Reviews
```
GET /branches/{branchId}/reviews?page=1&per_page=10

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "rating": 5,
      "comment": "string",
      "user_name": "string",
      "created_at": "2025-11-17T00:00:00Z"
    }
  ],
  "meta": {...}
}
```

## Payment Methods

### Test Mode Stripe Payment Methods
For testing, use these Stripe test payment method IDs:
- `pm_card_visa` - Successful payment
- `pm_card_visa_debit` - Successful debit card
- `pm_card_mastercard` - Successful Mastercard
- `pm_card_amex` - Successful Amex

## Error Responses

All error responses follow this format:
```json
{
  "success": false,
  "message": "Error message",
  "errors": {
    "field_name": ["Validation error message"]
  }
}
```

Common HTTP Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request / Validation Error
- 401: Unauthorized (missing or invalid token)
- 403: Forbidden (insufficient permissions)
- 404: Not Found
- 422: Unprocessable Entity (validation failed)
- 500: Server Error

## Authentication Headers

For authenticated requests, include:
```
Authorization: Bearer {your_access_token}
Content-Type: application/json
Accept: application/json
```

For guest cart operations, include:
```
X-Session-ID: {guest_session_id}
```

## Notes for Flutter Implementation

1. **Base URL**: Use `https://api.qofferun.com/api/v1`
2. **Token Storage**: Store auth token securely (e.g., flutter_secure_storage)
3. **Guest ID**: Generate and persist a unique guest ID for cart operations
4. **Error Handling**: Check `success` field in all responses
5. **Pagination**: Most list endpoints support `page` and `per_page` query params
6. **Images**: Image URLs are absolute paths
7. **Stripe**: In production, integrate Stripe SDK for payment method collection
8. **Reviews**: Require at least 1 completed order before allowing review submission

## Example Flutter HTTP Client Setup

```dart
import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class ApiClient {
  static const String baseUrl = 'https://api.qofferun.com/api/v1';
  final Dio _dio = Dio();
  final storage = FlutterSecureStorage();

  ApiClient() {
    _dio.options.baseUrl = baseUrl;
    _dio.options.headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    // Add auth interceptor
    _dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) async {
        final token = await storage.read(key: 'auth_token');
        if (token != null) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
    ));
  }

  // Example: Get branches
  Future<List<dynamic>> getBranches() async {
    final response = await _dio.get('/public/branches?eligible=true');
    return response.data['data'];
  }

  // Example: Login
  Future<Map<String, dynamic>> login(String email, String password) async {
    final response = await _dio.post('/login', data: {
      'email': email,
      'password': password,
    });
    
    if (response.data['success']) {
      final token = response.data['data']['token'];
      await storage.write(key: 'auth_token', value: token);
      return response.data['data'];
    }
    throw Exception(response.data['message']);
  }
}
```
