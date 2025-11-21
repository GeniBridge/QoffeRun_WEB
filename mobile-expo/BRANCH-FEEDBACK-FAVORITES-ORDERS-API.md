# Branch Favorites, Feedback, and Orders API Documentation

**Base URL:** `https://api.qofferun.com/api/v1`
**Last Updated:** November 19, 2025

---

## 📋 Table of Contents

1. [Favorites Branches](#-favorites-branches)
2. [Branch Feedback & Rating](#-branch-feedback--rating)
3. [Order History & Management](#-order-history--management)

---

## ⭐ Favorites Branches

### Add Branch to Favorites
**Endpoint:** `POST /customer/favorites`
**Auth:** Required

**Request Body:**
```json
{
  "branch_id": 16
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Branch added to favorites"
}
```

---

### Remove Branch from Favorites
**Endpoint:** `DELETE /customer/favorites/{branch_id}`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "message": "Branch removed from favorites"
}
```

---

### Get All Favorite Branches
**Endpoint:** `GET /customer/favorites`
**Auth:** Required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 16,
      "name": "Caffè Roma - Via del Corso",
      "address": "Via del Corso 123, Roma",
      "chain": { "name": "Caffè Roma" },
      "is_favorite": true
    }
  ]
}
```

---

## 📝 Branch Feedback & Rating

### Add Feedback & Rating
**Endpoint:** `POST /customer/branches/{branch_id}/feedback`
**Auth:** Required

**Eligibility:** User must have at least 1 completed order with the branch.

**Request Body:**
```json
{
  "rating": 5, // 1-5
  "comment": "Great service!"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Feedback submitted successfully"
}
```

---

### Get All Feedback for Branch
**Endpoint:** `GET /customer/branches/{branch_id}/feedback`
**Auth:** Not required

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "user": { "name": "John Doe" },
      "rating": 5,
      "comment": "Great service!",
      "created_at": "2025-11-19T12:00:00Z"
    }
  ]
}
```

---

## 📦 Order History & Management

### Get All Orders by Status
**Endpoint:** `GET /customer/orders?status={status}`
**Auth:** Required

**Status Values:** `confirmed`, `ready`, `completed`, `cancelled`, `paid`, `pending`

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 789,
      "order_number": "QR2511181430123",
      "status": "confirmed",
      "branch": { "id": 16, "name": "Caffè Roma - Via del Corso" },
      "total_amount": 7.56,
      "created_at": "2025-11-18T12:30:00Z"
    }
  ]
}
```

---

### Cancel Order (if not completed/picked up)
**Endpoint:** `POST /customer/orders/{order_id}/cancel`
**Auth:** Required

**Eligibility:** Only orders with status `confirmed` or `ready` (not `completed` or `cancelled`).

**Response (200):**
```json
{
  "success": true,
  "message": "Order cancelled successfully"
}
```

---

## 🛠️ Flutter Integration Tips

- Use `GET /customer/favorites` to show favorite branches in the app
- Show feedback form only if user has completed an order with the branch
- Use `GET /customer/orders?status=confirmed` to show active orders
- Allow cancel only if order status is not `completed` or `cancelled`

---

## ⚠️ Error Handling

| Status | Error | Solution |
|--------|-------|----------|
| 401 | Unauthenticated | User must login |
| 404 | Branch/order not found | Check branch/order ID |
| 422 | Already favorited/feedback exists | Prevent duplicate actions |
| 400 | Not eligible for feedback/cancel | Check order status or history |

---

## 📞 Support

**API Issues:** Create issue with request/response details
**Version:** v1
**Last Updated:** November 19, 2025
