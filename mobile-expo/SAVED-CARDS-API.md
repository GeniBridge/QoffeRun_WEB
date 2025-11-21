# Saved Cards API Documentation

**Base URL:** `https://api.qofferun.com/api/v1`  
**Last Updated:** November 19, 2025

---

## 🎯 Overview

The Saved Cards API allows authenticated customers to manage their credit cards for faster checkout. Cards are securely stored in Stripe and metadata is cached locally for quick access.

**Key Features:**
- Save multiple credit cards per customer
- Set a default card for automatic checkout
- View card details (brand, last 4 digits, expiration)
- Automatic expiration tracking
- Secure deletion with Stripe synchronization

**Security:**
- All endpoints require authentication
- Card numbers are never stored - only metadata
- Stripe handles PCI compliance
- Cards are attached to Stripe Customer accounts

---

## 📋 Table of Contents

1. [Authentication](#-authentication)
2. [List All Cards](#-list-all-cards)
3. [Add New Card](#-add-new-card)
4. [Get Default Card](#-get-default-card)
5. [Set Default Card](#-set-default-card)
6. [Delete Card](#-delete-card)
7. [Using Default Card at Checkout](#-using-default-card-at-checkout)
8. [Flutter Implementation](#-flutter-implementation)
9. [Error Handling](#-error-handling)
10. [Testing Guide](#-testing-guide)

---

## 🔐 Authentication

All endpoints require a valid Bearer token obtained from login or registration.

**Header Format:**
```
Authorization: Bearer {access_token}
```

**Example:**
```bash
curl -H 'Authorization: Bearer 261|6PspD3jMYDYk05XyOmeb6hn3wbw4MFAr6sEgfgoMf1c980c8'
```

---

## 📋 List All Cards

Get all saved credit cards for the authenticated user.

**Endpoint:** `GET /customer/payment-methods`  
**Auth:** Required

### Request

```bash
curl -X GET 'https://api.qofferun.com/api/v1/customer/payment-methods' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Accept: application/json'
```

### Response (200 OK)

```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "user_id": 62,
      "card_brand": "visa",
      "card_last4": "4242",
      "card_exp_month": 11,
      "card_exp_year": 2026,
      "is_default": true,
      "display_name": "Visa •••• 4242",
      "is_expired": false,
      "billing_details": {
        "address": {
          "city": null,
          "country": null,
          "line1": null,
          "line2": null,
          "postal_code": null,
          "state": null
        },
        "email": null,
        "name": null,
        "phone": null
      },
      "created_at": "2025-11-19T11:11:03.000000Z",
      "updated_at": "2025-11-19T11:11:03.000000Z"
    },
    {
      "id": 2,
      "user_id": 62,
      "card_brand": "mastercard",
      "card_last4": "5555",
      "card_exp_month": 12,
      "card_exp_year": 2027,
      "is_default": false,
      "display_name": "Mastercard •••• 5555",
      "is_expired": false,
      "created_at": "2025-11-19T10:00:00.000000Z",
      "updated_at": "2025-11-19T10:00:00.000000Z"
    }
  ]
}
```

### Response Fields

| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Local database ID |
| `user_id` | integer | Owner user ID |
| `card_brand` | string | Card brand: `visa`, `mastercard`, `amex`, etc. |
| `card_last4` | string | Last 4 digits of card number |
| `card_exp_month` | integer | Expiration month (1-12) |
| `card_exp_year` | integer | Expiration year (YYYY) |
| `is_default` | boolean | Whether this is the default card |
| `display_name` | string | Formatted display name |
| `is_expired` | boolean | Computed: true if card is expired |
| `billing_details` | object | Billing information from Stripe |
| `created_at` | timestamp | When card was added |
| `updated_at` | timestamp | Last modification time |

### Response (401 Unauthorized)

```json
{
  "message": "Unauthenticated."
}
```

---

## ➕ Add New Card

Add a new credit card to the user's account. The card must be created client-side using Stripe SDK.

**Endpoint:** `POST /customer/payment-methods`  
**Auth:** Required

### Request

```bash
curl -X POST 'https://api.qofferun.com/api/v1/customer/payment-methods' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -H 'Accept: application/json' \
  -d '{
    "payment_method_id": "pm_1SV9Hj6Oy6LeFIOGL1VKtobT",
    "set_as_default": true
  }'
```

### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `payment_method_id` | string | Yes | Stripe PaymentMethod ID from client SDK |
| `set_as_default` | boolean | No | Set this card as default (default: false) |

**Important:**
- Create `payment_method_id` using Stripe SDK on the client
- Do NOT use `pm_test_*` IDs - they won't attach to Stripe Customer
- Use real Stripe test tokens like `tok_visa` to create PaymentMethods

### Response (201 Created)

```json
{
  "success": true,
  "message": "Payment method added successfully",
  "data": {
    "id": 1,
    "user_id": 62,
    "card_brand": "visa",
    "card_last4": "4242",
    "card_exp_month": 11,
    "card_exp_year": 2026,
    "is_default": true,
    "display_name": "Visa •••• 4242",
    "is_expired": false,
    "billing_details": {
      "address": {
        "city": null,
        "country": null,
        "line1": null,
        "line2": null,
        "postal_code": null,
        "state": null
      },
      "email": null,
      "name": null,
      "phone": null
    },
    "created_at": "2025-11-19T11:11:03.000000Z",
    "updated_at": "2025-11-19T11:11:03.000000Z"
  }
}
```

### Rules

1. **First Card Auto-Default:** If this is the user's first card, it automatically becomes default
2. **Set as Default:** If `set_as_default: true`, all other cards are marked non-default
3. **Stripe Customer:** A Stripe Customer is automatically created for new users
4. **Attach to Stripe:** Card is attached to user's Stripe Customer account

### Response (400 Bad Request)

```json
{
  "success": false,
  "message": "Failed to add payment method",
  "error": "No such PaymentMethod: 'pm_invalid123'"
}
```

### Response (422 Validation Error)

```json
{
  "message": "The payment method id field is required.",
  "errors": {
    "payment_method_id": [
      "The payment method id field is required."
    ]
  }
}
```

---

## 🎯 Get Default Card

Retrieve the user's default payment method.

**Endpoint:** `GET /customer/payment-methods/default`  
**Auth:** Required

### Request

```bash
curl -X GET 'https://api.qofferun.com/api/v1/customer/payment-methods/default' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Accept: application/json'
```

### Response (200 OK)

```json
{
  "success": true,
  "data": {
    "id": 1,
    "user_id": 62,
    "card_brand": "visa",
    "card_last4": "4242",
    "card_exp_month": 11,
    "card_exp_year": 2026,
    "is_default": true,
    "display_name": "Visa •••• 4242",
    "is_expired": false,
    "created_at": "2025-11-19T11:11:03.000000Z",
    "updated_at": "2025-11-19T11:11:03.000000Z"
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "No default payment method found"
}
```

---

## ⭐ Set Default Card

Change which card is the default for automatic checkout.

**Endpoint:** `PUT /customer/payment-methods/{id}/default`  
**Auth:** Required

### Request

```bash
curl -X PUT 'https://api.qofferun.com/api/v1/customer/payment-methods/1/default' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Accept: application/json'
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Card ID to set as default |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Payment method set as default",
  "data": {
    "id": 1,
    "user_id": 62,
    "card_brand": "visa",
    "card_last4": "4242",
    "is_default": true,
    "display_name": "Visa •••• 4242",
    "is_expired": false
  }
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Payment method not found"
}
```

### Response (422 Unprocessable Entity)

```json
{
  "success": false,
  "message": "Cannot set expired card as default"
}
```

### Rules

- Only valid (non-expired) cards can be set as default
- Previous default card is automatically unmarked
- Card must belong to the authenticated user

---

## 🗑️ Delete Card

Remove a credit card from the user's account.

**Endpoint:** `DELETE /customer/payment-methods/{id}`  
**Auth:** Required

### Request

```bash
curl -X DELETE 'https://api.qofferun.com/api/v1/customer/payment-methods/2' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Accept: application/json'
```

### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | integer | Card ID to delete |

### Response (200 OK)

```json
{
  "success": true,
  "message": "Payment method deleted successfully"
}
```

### Response (404 Not Found)

```json
{
  "success": false,
  "message": "Payment method not found"
}
```

### Behavior

1. **Detach from Stripe:** Card is detached from user's Stripe Customer
2. **Delete Locally:** Card record is deleted from database
3. **Auto-Reassign Default:** If deleted card was default:
   - Most recent valid card becomes new default
   - If no other valid cards exist, user has no default

### Rules

- Card must belong to authenticated user
- Cannot delete card that doesn't exist
- Deletion is permanent and cannot be undone

---

## 💳 Using Default Card at Checkout

When creating an order, authenticated users can omit `payment_method_id` to use their default card.

### With Default Card (Authenticated Users)

```dart
// No payment_method_id needed - uses default card
final response = await dio.post(
  'https://api.qofferun.com/api/v1/customer/orders',
  data: {
    'guest_id': guestId,
    'customer_name': 'John Doe',
    'customer_email': 'john@example.com',
    // payment_method_id is omitted
  },
  options: Options(
    headers: {'Authorization': 'Bearer $token'},
  ),
);
```

### With Specific Card (Guest or Authenticated)

```dart
// Provide payment_method_id to use specific card or new card
final response = await dio.post(
  'https://api.qofferun.com/api/v1/customer/orders',
  data: {
    'guest_id': guestId,
    'customer_name': 'John Doe',
    'customer_email': 'john@example.com',
    'payment_method_id': 'pm_1SV9Hj6Oy6LeFIOGL1VKtobT',
  },
);
```

### Rules

- **Authenticated + No `payment_method_id`:** Uses default card (must have one)
- **Authenticated + With `payment_method_id`:** Uses specified card
- **Guest:** Must always provide `payment_method_id`

---

## 📱 Flutter Implementation

### Complete Payment Methods Service

```dart
import 'package:dio/dio.dart';

class PaymentMethodsService {
  final Dio _dio;
  final String baseUrl = 'https://api.qofferun.com/api/v1';
  
  PaymentMethodsService(this._dio);
  
  /// Get authentication token
  Future<String> _getAuthToken() async {
    final prefs = await SharedPreferences.getInstance();
    final token = prefs.getString('auth_token');
    if (token == null) throw Exception('Not authenticated');
    return token;
  }
  
  /// List all saved cards
  Future<List<PaymentMethodModel>> listCards() async {
    final token = await _getAuthToken();
    
    final response = await _dio.get(
      '$baseUrl/customer/payment-methods',
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      ),
    );
    
    if (response.data['success']) {
      final List<dynamic> data = response.data['data'];
      return data.map((json) => PaymentMethodModel.fromJson(json)).toList();
    } else {
      throw Exception(response.data['message']);
    }
  }
  
  /// Add new card
  Future<PaymentMethodModel> addCard({
    required String paymentMethodId,
    bool setAsDefault = false,
  }) async {
    final token = await _getAuthToken();
    
    final response = await _dio.post(
      '$baseUrl/customer/payment-methods',
      data: {
        'payment_method_id': paymentMethodId,
        'set_as_default': setAsDefault,
      },
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );
    
    if (response.data['success']) {
      return PaymentMethodModel.fromJson(response.data['data']);
    } else {
      throw Exception(response.data['message'] ?? 'Failed to add card');
    }
  }
  
  /// Get default card
  Future<PaymentMethodModel?> getDefaultCard() async {
    final token = await _getAuthToken();
    
    try {
      final response = await _dio.get(
        '$baseUrl/customer/payment-methods/default',
        options: Options(
          headers: {
            'Authorization': 'Bearer $token',
            'Accept': 'application/json',
          },
        ),
      );
      
      if (response.data['success']) {
        return PaymentMethodModel.fromJson(response.data['data']);
      }
      return null;
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) {
        return null; // No default card
      }
      rethrow;
    }
  }
  
  /// Set card as default
  Future<void> setDefaultCard(int cardId) async {
    final token = await _getAuthToken();
    
    final response = await _dio.put(
      '$baseUrl/customer/payment-methods/$cardId/default',
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      ),
    );
    
    if (!response.data['success']) {
      throw Exception(response.data['message']);
    }
  }
  
  /// Delete card
  Future<void> deleteCard(int cardId) async {
    final token = await _getAuthToken();
    
    final response = await _dio.delete(
      '$baseUrl/customer/payment-methods/$cardId',
      options: Options(
        headers: {
          'Authorization': 'Bearer $token',
          'Accept': 'application/json',
        },
      ),
    );
    
    if (!response.data['success']) {
      throw Exception(response.data['message']);
    }
  }
  
  /// Add card using Stripe SDK
  Future<PaymentMethodModel> addCardFromStripe({
    required CardFieldInputDetails cardDetails,
    bool setAsDefault = false,
  }) async {
    // Step 1: Create PaymentMethod with Stripe
    final paymentMethod = await Stripe.instance.createPaymentMethod(
      params: PaymentMethodParams.card(
        paymentMethodData: PaymentMethodData(),
      ),
    );
    
    // Step 2: Save to backend
    return await addCard(
      paymentMethodId: paymentMethod.id,
      setAsDefault: setAsDefault,
    );
  }
}
```

### Model

```dart
class PaymentMethodModel {
  final int id;
  final int userId;
  final String cardBrand;
  final String cardLast4;
  final int cardExpMonth;
  final int cardExpYear;
  final bool isDefault;
  final String displayName;
  final bool isExpired;
  final DateTime createdAt;
  final DateTime updatedAt;
  
  PaymentMethodModel({
    required this.id,
    required this.userId,
    required this.cardBrand,
    required this.cardLast4,
    required this.cardExpMonth,
    required this.cardExpYear,
    required this.isDefault,
    required this.displayName,
    required this.isExpired,
    required this.createdAt,
    required this.updatedAt,
  });
  
  factory PaymentMethodModel.fromJson(Map<String, dynamic> json) {
    return PaymentMethodModel(
      id: json['id'],
      userId: json['user_id'],
      cardBrand: json['card_brand'],
      cardLast4: json['card_last4'],
      cardExpMonth: json['card_exp_month'],
      cardExpYear: json['card_exp_year'],
      isDefault: json['is_default'],
      displayName: json['display_name'],
      isExpired: json['is_expired'],
      createdAt: DateTime.parse(json['created_at']),
      updatedAt: DateTime.parse(json['updated_at']),
    );
  }
  
  String get formattedExpiry => '${cardExpMonth.toString().padLeft(2, '0')}/$cardExpYear';
  
  IconData get brandIcon {
    switch (cardBrand.toLowerCase()) {
      case 'visa':
        return Icons.credit_card; // Use actual brand icons
      case 'mastercard':
        return Icons.credit_card;
      case 'amex':
        return Icons.credit_card;
      default:
        return Icons.credit_card;
    }
  }
}
```

### UI Example - Saved Cards Screen

```dart
class SavedCardsScreen extends StatefulWidget {
  @override
  _SavedCardsScreenState createState() => _SavedCardsScreenState();
}

class _SavedCardsScreenState extends State<SavedCardsScreen> {
  final PaymentMethodsService _service = PaymentMethodsService(Dio());
  List<PaymentMethodModel> _cards = [];
  bool _loading = true;
  
  @override
  void initState() {
    super.initState();
    _loadCards();
  }
  
  Future<void> _loadCards() async {
    setState(() => _loading = true);
    try {
      final cards = await _service.listCards();
      setState(() {
        _cards = cards;
        _loading = false;
      });
    } catch (e) {
      setState(() => _loading = false);
      _showError('Failed to load cards: $e');
    }
  }
  
  Future<void> _addNewCard() async {
    // Navigate to add card screen with Stripe CardField
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (_) => AddCardScreen()),
    );
    
    if (result == true) {
      _loadCards();
    }
  }
  
  Future<void> _setDefault(int cardId) async {
    try {
      await _service.setDefaultCard(cardId);
      _loadCards();
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Default card updated')),
      );
    } catch (e) {
      _showError('Failed to set default: $e');
    }
  }
  
  Future<void> _deleteCard(int cardId) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (_) => AlertDialog(
        title: Text('Delete Card'),
        content: Text('Are you sure you want to delete this card?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context, false),
            child: Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(context, true),
            child: Text('Delete', style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    
    if (confirm == true) {
      try {
        await _service.deleteCard(cardId);
        _loadCards();
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text('Card deleted')),
        );
      } catch (e) {
        _showError('Failed to delete card: $e');
      }
    }
  }
  
  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }
  
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text('Saved Cards'),
        actions: [
          IconButton(
            icon: Icon(Icons.add),
            onPressed: _addNewCard,
          ),
        ],
      ),
      body: _loading
          ? Center(child: CircularProgressIndicator())
          : _cards.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Icon(Icons.credit_card_off, size: 64, color: Colors.grey),
                      SizedBox(height: 16),
                      Text('No saved cards', style: TextStyle(fontSize: 18)),
                      SizedBox(height: 8),
                      ElevatedButton(
                        onPressed: _addNewCard,
                        child: Text('Add Card'),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: EdgeInsets.all(16),
                  itemCount: _cards.length,
                  itemBuilder: (context, index) {
                    final card = _cards[index];
                    return Card(
                      margin: EdgeInsets.only(bottom: 12),
                      child: ListTile(
                        leading: Icon(card.brandIcon, size: 32),
                        title: Text(card.displayName),
                        subtitle: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Expires ${card.formattedExpiry}'),
                            if (card.isExpired)
                              Text(
                                'EXPIRED',
                                style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold),
                              ),
                            if (card.isDefault)
                              Text(
                                'DEFAULT',
                                style: TextStyle(color: Colors.green, fontWeight: FontWeight.bold),
                              ),
                          ],
                        ),
                        trailing: PopupMenuButton(
                          itemBuilder: (context) => [
                            if (!card.isDefault && !card.isExpired)
                              PopupMenuItem(
                                value: 'default',
                                child: Text('Set as Default'),
                              ),
                            PopupMenuItem(
                              value: 'delete',
                              child: Text('Delete', style: TextStyle(color: Colors.red)),
                            ),
                          ],
                          onSelected: (value) {
                            if (value == 'default') {
                              _setDefault(card.id);
                            } else if (value == 'delete') {
                              _deleteCard(card.id);
                            }
                          },
                        ),
                      ),
                    );
                  },
                ),
    );
  }
}
```

---

## ⚠️ Error Handling

### Common Errors

| Status | Error | Solution |
|--------|-------|----------|
| 401 | Unauthenticated | User must login first |
| 404 | Payment method not found | Card ID doesn't exist or doesn't belong to user |
| 404 | No default payment method found | User has no cards or no default set |
| 422 | Cannot set expired card as default | Choose a valid card |
| 422 | Validation failed | Check required fields |
| 400 | No such PaymentMethod | Invalid Stripe PaymentMethod ID |
| 500 | Failed to add payment method | Stripe error - check API keys |

### Flutter Error Handling

```dart
try {
  final cards = await paymentMethodsService.listCards();
} on DioException catch (e) {
  if (e.response?.statusCode == 401) {
    // Redirect to login
    Navigator.pushReplacementNamed(context, '/login');
  } else if (e.response?.statusCode == 404) {
    // No cards found
    setState(() => _cards = []);
  } else {
    // Generic error
    _showError(e.response?.data['message'] ?? 'An error occurred');
  }
} catch (e) {
  _showError('Network error: $e');
}
```

---

## 🧪 Testing Guide

### Test Flow

#### 1. Register/Login User

```bash
curl -X POST 'https://api.qofferun.com/api/v1/register' \
  -H 'Content-Type: application/json' \
  -d '{
    "first_name": "Test",
    "last_name": "User",
    "email": "test'$(date +%s)'@example.com",
    "password": "TestPass123!",
    "password_confirmation": "TestPass123!",
    "phone": "+393331234567"
  }'

# Save the access_token from response
TOKEN="YOUR_ACCESS_TOKEN"
```

#### 2. Create Stripe PaymentMethod

```bash
# Create PM using Stripe test token
STRIPE_KEY="sk_test_51SSRs86Oy6LeFIOGNb9TRP2CWKBUHdbAKIC3AAq3KnKpiuMzChUCIk2GqAfC6CgzAB6BAX16vA95nzXcSNc8osz200ufMBRA9m"

PM_ID=$(curl -s -X POST 'https://api.stripe.com/v1/payment_methods' \
  -u "$STRIPE_KEY:" \
  -d 'type=card' \
  -d 'card[token]=tok_visa' | jq -r '.id')

echo "PaymentMethod ID: $PM_ID"
```

#### 3. Add Card

```bash
curl -X POST 'https://api.qofferun.com/api/v1/customer/payment-methods' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"payment_method_id\": \"$PM_ID\",
    \"set_as_default\": true
  }"
```

#### 4. List Cards

```bash
curl -X GET 'https://api.qofferun.com/api/v1/customer/payment-methods' \
  -H "Authorization: Bearer $TOKEN"
```

#### 5. Get Default Card

```bash
curl -X GET 'https://api.qofferun.com/api/v1/customer/payment-methods/default' \
  -H "Authorization: Bearer $TOKEN"
```

#### 6. Add Second Card

```bash
# Create another PM
PM_ID_2=$(curl -s -X POST 'https://api.stripe.com/v1/payment_methods' \
  -u "$STRIPE_KEY:" \
  -d 'type=card' \
  -d 'card[token]=tok_mastercard' | jq -r '.id')

# Add it
curl -X POST 'https://api.qofferun.com/api/v1/customer/payment-methods' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d "{
    \"payment_method_id\": \"$PM_ID_2\",
    \"set_as_default\": false
  }"
```

#### 7. Set Default Card

```bash
# Set card ID 2 as default
curl -X PUT 'https://api.qofferun.com/api/v1/customer/payment-methods/2/default' \
  -H "Authorization: Bearer $TOKEN"
```

#### 8. Delete Card

```bash
curl -X DELETE 'https://api.qofferun.com/api/v1/customer/payment-methods/1' \
  -H "Authorization: Bearer $TOKEN"
```

### Stripe Test Tokens

| Token | Card Brand | Last 4 | Description |
|-------|------------|--------|-------------|
| `tok_visa` | Visa | 4242 | Standard success card |
| `tok_mastercard` | Mastercard | 5555 | Mastercard success |
| `tok_amex` | American Express | 0005 | Amex card |
| `tok_discover` | Discover | 0000 | Discover card |

More tokens: https://stripe.com/docs/testing#cards

---

## 💡 Best Practices

### 1. Cache Cards Locally

```dart
class PaymentMethodsProvider extends ChangeNotifier {
  List<PaymentMethodModel> _cards = [];
  PaymentMethodModel? _defaultCard;
  bool _loading = false;
  
  List<PaymentMethodModel> get cards => _cards;
  PaymentMethodModel? get defaultCard => _defaultCard;
  bool get loading => _loading;
  bool get hasCards => _cards.isNotEmpty;
  
  Future<void> loadCards() async {
    _loading = true;
    notifyListeners();
    
    try {
      _cards = await PaymentMethodsService().listCards();
      _defaultCard = _cards.firstWhere(
        (card) => card.isDefault,
        orElse: () => null,
      );
    } finally {
      _loading = false;
      notifyListeners();
    }
  }
  
  Future<void> addCard(String paymentMethodId, {bool setAsDefault = false}) async {
    final card = await PaymentMethodsService().addCard(
      paymentMethodId: paymentMethodId,
      setAsDefault: setAsDefault,
    );
    _cards.add(card);
    if (setAsDefault) _defaultCard = card;
    notifyListeners();
  }
  
  Future<void> deleteCard(int cardId) async {
    await PaymentMethodsService().deleteCard(cardId);
    _cards.removeWhere((card) => card.id == cardId);
    if (_defaultCard?.id == cardId) {
      _defaultCard = _cards.firstWhere(
        (card) => card.isDefault,
        orElse: () => null,
      );
    }
    notifyListeners();
  }
}
```

### 2. Validate Before Setting Default

```dart
Future<void> setDefaultCard(PaymentMethodModel card) async {
  if (card.isExpired) {
    throw Exception('Cannot set expired card as default');
  }
  
  await PaymentMethodsService().setDefaultCard(card.id);
  await loadCards(); // Refresh
}
```

### 3. Handle Expired Cards

```dart
List<PaymentMethodModel> get validCards => 
    _cards.where((card) => !card.isExpired).toList();

List<PaymentMethodModel> get expiredCards => 
    _cards.where((card) => card.isExpired).toList();

bool get hasValidCards => validCards.isNotEmpty;
```

### 4. Checkout with Default Card

```dart
Future<void> checkoutWithDefaultCard() async {
  final defaultCard = await PaymentMethodsService().getDefaultCard();
  
  if (defaultCard == null) {
    // Show add card dialog
    showAddCardDialog();
    return;
  }
  
  if (defaultCard.isExpired) {
    // Show update card dialog
    showExpiredCardWarning();
    return;
  }
  
  // Proceed with checkout (omit payment_method_id)
  await OrderService().createOrder(
    customerName: user.name,
    customerEmail: user.email,
    // payment_method_id omitted - uses default
  );
}
```

---

## 📊 Summary

**Endpoints:**
- `GET /customer/payment-methods` - List all cards
- `POST /customer/payment-methods` - Add new card
- `GET /customer/payment-methods/default` - Get default card
- `PUT /customer/payment-methods/{id}/default` - Set default card
- `DELETE /customer/payment-methods/{id}` - Delete card

**Key Features:**
- ✅ Multi-card support
- ✅ Default card for quick checkout
- ✅ Automatic expiration tracking
- ✅ Stripe synchronization
- ✅ Secure PCI-compliant storage

**Security:**
- All endpoints require authentication
- Cards stored in Stripe (PCI compliant)
- Only metadata cached locally
- Automatic cleanup on deletion

---

## 📞 Support

**API Issues:** Create issue with request/response details  
**Stripe Questions:** https://stripe.com/docs/api/payment_methods  
**Version:** v1  
**Last Updated:** November 19, 2025
