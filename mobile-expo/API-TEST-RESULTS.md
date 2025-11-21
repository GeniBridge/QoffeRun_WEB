# QoffeRun API Test Results

**Test Date:** 2025-11-17  
**Tested Endpoint:** `POST /register` and `POST /login`  
**Base URL:** `https://api.qofferun.com/api/v1`

---

## ✅ Test 1: Register with first_name/last_name

**Request:**
```json
POST /register
{
  "first_name": "Test",
  "last_name": "User",
  "email": "test.user.1763409695@qofferun.test",
  "password": "TestPass123!",
  "password_confirmation": "TestPass123!",
  "phone": "+393339876543"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 55,
    "name": "Test User",
    "email": "test.user.1763409695@qofferun.test",
    "role": "customer",
    "phone": "+393339876543"
  },
  "access_token": "201|G4WP1YCzXZwwUGvexAmVVnQco7NOm7JZbR6G0wLAfd890482",
  "token_type": "Bearer",
  "success": true,
  "data": {
    "user": {
      "id": 55,
      "name": "Test User",
      "email": "test.user.1763409695@qofferun.test",
      "role": "customer",
      "phone": "+393339876543"
    },
    "token": "201|G4WP1YCzXZwwUGvexAmVVnQco7NOm7JZbR6G0wLAfd890482"
  }
}
```

**✅ Validation:**
- Name correctly built from first_name + last_name
- Role automatically assigned as "customer"
- Both legacy and new response formats included
- Token generated successfully

---

## ✅ Test 2: Register with single name field

**Request:**
```json
POST /register
{
  "name": "John Doe",
  "email": "john.doe.1763409811@qofferun.test",
  "password": "SecurePass99!",
  "password_confirmation": "SecurePass99!"
}
```

**Response (Success):**
```json
{
  "message": "User registered successfully.",
  "user": {
    "id": 57,
    "name": "John Doe",
    "email": "john.doe.1763409811@qofferun.test",
    "role": "customer",
    "phone": null
  },
  "access_token": "204|ogiMlY82VMF4wSrU7Za9lMmQWhzA0pJ1zRNqP4Iic6324b4d",
  "token_type": "Bearer",
  "success": true,
  "data": {
    "user": {
      "id": 57,
      "name": "John Doe",
      "email": "john.doe.1763409811@qofferun.test",
      "role": "customer",
      "phone": null
    },
    "token": "204|ogiMlY82VMF4wSrU7Za9lMmQWhzA0pJ1zRNqP4Iic6324b4d"
  }
}
```

**✅ Validation:**
- Single name field accepted
- Role automatically assigned as "customer"
- Phone is null (optional field)
- Token generated successfully

---

## ✅ Test 3: Login with registered credentials

**Request:**
```json
POST /login
{
  "email": "test.user.1763409695@qofferun.test",
  "password": "TestPass123!"
}
```

**Response (Success):**
```json
{
  "message": "Login successful.",
  "user": {
    "id": 55,
    "name": "Test User",
    "email": "test.user.1763409695@qofferun.test",
    "role": "customer",
    "phone": "+393339876543"
  },
  "access_token": "202|q90LdKI3Wv679nbYTVBxHMPp55I0rE7kFBff4Jspda318fb6",
  "token_type": "Bearer",
  "success": true,
  "data": {
    "user": {
      "id": 55,
      "name": "Test User",
      "email": "test.user.1763409695@qofferun.test",
      "role": "customer",
      "phone": "+393339876543"
    },
    "token": "202|q90LdKI3Wv679nbYTVBxHMPp55I0rE7kFBff4Jspda318fb6"
  }
}
```

**✅ Validation:**
- Login successful with registered credentials
- User data returned correctly
- New token issued
- Both response formats present

---

## Summary

### What Works ✅

1. **Registration with first_name/last_name**: Server correctly concatenates into full name
2. **Registration with single name field**: Direct name assignment works
3. **Automatic role assignment**: Default "customer" role applied without sending role field
4. **Password validation**: Minimum 8 characters enforced
5. **Optional fields**: Phone is optional, safely omitted
6. **Login**: Authentication working with registered credentials
7. **Response format**: Both legacy and new mobile-friendly formats included for backward compatibility

### Implementation Details

- **Server-side changes:**
  - `AuthController::register()` accepts both name formats
  - `User` model sets default `role => 'customer'` via `$attributes`
  - Both register and login return dual response format (legacy + new)

- **Database:**
  - Role field defaults to 'customer' at model level
  - No schema changes required

### Recommendations for Flutter App

Use the **Option B (first_name/last_name)** format from API docs:
```dart
final response = await _dio.post('/register', data: {
  'first_name': firstName,
  'last_name': lastName,
  'email': email,
  'password': password,
  'password_confirmation': password,
  'phone': phone, // optional
});

if (response.data['success']) {
  final token = response.data['data']['token'];
  final user = response.data['data']['user'];
  // Store token and user data
}
```

**Password requirements:** Minimum 8 characters (enforce in app UI validation)

---

## 📚 Additional Documentation

- **Registration & Login:** See `IMPORTANT-API-ENDPOINTS.md`
- **Branch Images:** See `IMAGE-URLS-FIXED.md`
- **Menu & Customization:** See `MENU-CUSTOMIZATION-API.md`
- **System Settings:** See `API-DOCUMENTATION.md`
