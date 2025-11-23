# Cart API Session ID Fix Documentation

**Base URL:** `https://api.qofferun.com/api/v1`
**Last Updated:** November 22, 2025

---

## 🔧 Issue Fixed

The `/customer/cart` endpoint was not returning the `session_id` field in the response, causing issues for guest users and session management on the client side.

---

## ✅ Solution Implemented

Updated `CartController::getCart()` to include `session_id` in the cart response data structure.

---

## 📋 Updated API Response

### Get Cart Contents
**Endpoint:** `GET /customer/cart`
**Auth:** Optional (works for both guest and authenticated users)

**Headers:**
```
Authorization: Bearer {token}  // For authenticated users
X-Guest-Session: {session_id}  // For guest users
```

**Response (200):**
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
          "image_url": "https://...",
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
    "session_id": "guest_abc123xyz789"  // ✨ NOW INCLUDED
  }
}
```

---

## 🔑 Session ID Usage

### For Guest Users
1. When adding first item to cart, store the `session_id` from the response
2. Include this `session_id` in the `X-Guest-Session` header for all subsequent cart operations
3. Use the same `session_id` when creating an order as a guest

### For Authenticated Users
- The `session_id` is still returned but is tied to the user's account
- Can be used for session tracking and debugging purposes

---

## 📱 Client Implementation Example

### Flutter/Dart Example
```dart
class CartService {
  String? _guestSessionId;
  
  Future<Cart> getCart() async {
    final headers = <String, String>{};
    
    // Add auth token if user is logged in
    if (isAuthenticated) {
      headers['Authorization'] = 'Bearer $token';
    } 
    // Add guest session if available
    else if (_guestSessionId != null) {
      headers['X-Guest-Session'] = _guestSessionId!;
    }
    
    final response = await http.get(
      Uri.parse('$baseUrl/customer/cart'),
      headers: headers,
    );
    
    final data = json.decode(response.body);
    
    // Store session_id from response for future requests
    if (data['data']['session_id'] != null) {
      _guestSessionId = data['data']['session_id'];
      await _saveSessionIdLocally(_guestSessionId!);
    }
    
    return Cart.fromJson(data['data']);
  }
}
```

### React Native Example
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';

class CartService {
  async getCart() {
    const headers = {};
    
    // Add auth token if user is logged in
    const token = await AsyncStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    } else {
      // Add guest session if available
      const sessionId = await AsyncStorage.getItem('guest_session_id');
      if (sessionId) {
        headers['X-Guest-Session'] = sessionId;
      }
    }
    
    const response = await fetch(`${baseUrl}/customer/cart`, { headers });
    const data = await response.json();
    
    // Store session_id from response for future requests
    if (data.data.session_id) {
      await AsyncStorage.setItem('guest_session_id', data.data.session_id);
    }
    
    return data.data;
  }
}
```

---

## 🔄 Related Endpoints

All cart endpoints work with the session system:

- `POST /customer/cart/add` - Add item to cart
- `PUT /customer/cart/items/{cartItemId}` - Update cart item
- `DELETE /customer/cart/items/{cartItemId}` - Remove cart item
- `DELETE /customer/cart/clear` - Clear entire cart

**Important:** Always include either `Authorization: Bearer {token}` or `X-Guest-Session: {session_id}` header in cart requests.

---

## 🎯 Benefits

✅ **Guest Checkout:** Users can now add items to cart without creating an account  
✅ **Session Persistence:** Cart is maintained across app restarts for guest users  
✅ **Seamless Conversion:** When guest user registers, their cart can be migrated  
✅ **Better UX:** No need to login before browsing and adding items  

---

## ⚠️ Important Notes

1. **Session Expiry:** Guest cart sessions expire after a configured time period (check `expires_at` field)
2. **Storage:** Client apps must store the `session_id` locally (SharedPreferences, AsyncStorage, etc.)
3. **Security:** Session IDs are unique per cart and cannot access other users' data
4. **Migration:** When a guest user logs in, call the cart merge/migration endpoint if available

---

## 🐛 Debugging Tips

### If cart is not persisting for guests:
1. Verify `session_id` is being stored locally after first cart operation
2. Check that `X-Guest-Session` header is included in subsequent requests
3. Ensure session hasn't expired (check `expires_at` timestamp)
4. Clear local storage and test fresh session creation

### Logging Example:
```dart
print('Cart Response: ${response.body}');
print('Session ID extracted: ${data['data']['session_id']}');
print('Session ID in storage: ${await getStoredSessionId()}');
```

---

## 📞 Support

**Issue:** Cart session_id not returned  
**Status:** ✅ Fixed (November 22, 2025)  
**API Version:** v1  
**Backend File:** `backend/src/app/Http/Controllers/Api/CartController.php`

For additional support, create an issue with:
- Request headers
- Response body
- Session ID storage logs
