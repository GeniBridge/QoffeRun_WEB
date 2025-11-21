# ⚠️ IMPORTANT: Correct API Endpoints

## Authentication Endpoints

### ✅ CORRECT Endpoints

```
POST https://api.qofferun.com/api/v1/register
POST https://api.qofferun.com/api/v1/login
```

### ❌ WRONG Endpoints (Will return 404)

```
POST https://api.qofferun.com/api/v1/auth/register  ❌ 404 Error
POST https://api.qofferun.com/api/v1/auth/login     ❌ Not tested but likely wrong
```

## Quick Reference

| Action | Correct URL |
|--------|-------------|
| Register | `POST /api/v1/register` |
| Login | `POST /api/v1/login` |
| Forgot Password | `POST /api/v1/auth/forgot-password` |
| Reset Password | `POST /api/v1/auth/reset-password` |
| Get Current User | `GET /api/v1/me` |

## Test with cURL

### Register (CORRECT)
```bash
curl -X POST https://api.qofferun.com/api/v1/register \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "John",
    "last_name": "Doe",
    "email": "john@example.com",
    "password": "Pass1234!",
    "password_confirmation": "Pass1234!"
  }'
```

### Login (CORRECT)
```bash
curl -X POST https://api.qofferun.com/api/v1/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "Pass1234!"
  }'
```

## For Flutter Developers

**Update your API client base URLs:**

```dart
class ApiClient {
  static const String baseUrl = 'https://api.qofferun.com/api/v1';
  
  // CORRECT - Register endpoint
  Future<Map<String, dynamic>> register({
    required String firstName,
    required String lastName,
    required String email,
    required String password,
  }) async {
    final response = await _dio.post('/register', data: {  // ✅ /register
      'first_name': firstName,
      'last_name': lastName,
      'email': email,
      'password': password,
      'password_confirmation': password,
    });
    return response.data;
  }
  
  // CORRECT - Login endpoint
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await _dio.post('/login', data: {  // ✅ /login
      'email': email,
      'password': password,
    });
    return response.data;
  }
}
```
