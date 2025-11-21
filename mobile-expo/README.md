# Qofferun Mobile App (Expo + React Native)

Complete mobile ordering app for customers to browse branches, view menus, place orders, and manage their order history.

## Setup

```bash
cd mobile-expo
npm install
```

### Configure API Base URL

The app uses environment variables for configuration. Copy the example:

```bash
cp .env.example .env
```

Edit `.env` and set your API URL:

```env
EXPO_PUBLIC_API_BASE=https://qofferun.com/api/v1
```

For local development:
- Android emulator: `http://10.0.2.2:8000/api/v1`
- iOS simulator: `http://localhost:8000/api/v1`

## Development

```bash
npm start
# or
expo start
```

Scan the QR code with **Expo Go** (iOS/Android) or run on an emulator:

```bash
npm run android  # Android
npm run ios      # iOS
npm run web      # Web browser
```

## Production Deployment

The mobile app is configured to deploy as a subdirectory at **https://qofferun.com/mobile/**

### Build for Web

```bash
./build.sh
```

Or manually:

```bash
npm run build:web
```

This creates an optimized static build in the `build/` directory.

### Deploy to Production

```bash
./deploy.sh
```

Or manually:

1. Build the app: `npm run build:web`
2. Copy `build/` contents to `/srv/qofferun/mobile-expo/build/`
3. Ensure nginx configuration includes the mobile location block
4. Reload nginx: `sudo nginx -t && sudo systemctl reload nginx`

### Nginx Configuration

The nginx configuration in `/srv/qofferun/nginx-spa.conf` already includes the mobile app location block:

```nginx
location /mobile/ {
    alias /srv/qofferun/mobile-expo/build/;
    try_files $uri $uri/ /mobile/index.html;
    # ... cache headers and static asset handling
}
```

After updating nginx config:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

The app will be accessible at **https://qofferun.com/mobile/**

## Features

### 🔐 Authentication
- **Login**: Email/password authentication
- **Register**: Create new customer account
- **Password Reset**: Recover account via email

### 🏪 Branch Discovery
- Browse all eligible branches
- View branch details: chain logo/cover, name, address, phone, rating
- See active menu with categorized items

### 🛒 Cart & Ordering
- Add menu items to cart
- Review cart with quantities and totals
- Checkout with customer info and payment (Stripe test mode)
- Real-time order placement via `/customer/orders/direct` endpoint

### 📦 Order Management
- View order history with status filters
- Pull-to-refresh for latest orders
- See order details (number, status, total)

### ⭐ Reviews (Future Enhancement)
- Post reviews for branches (requires ≥1 completed order)
- View average ratings

## API Integration

All API calls are configured via:
- `src/api/client.ts` - Axios instance with base URL and auth token
- `src/api/endpoints.ts` - Organized endpoint definitions

### Key Endpoints Used

#### Authentication
- `POST /register` - Create account
- `POST /login` - Authenticate
- `POST /auth/forgot-password` - Request password reset
- `GET /me` - Get current user

#### Discovery
- `GET /public/branches` - List eligible branches
- `GET /public/branches/{id}` - Branch details with chain info

#### Menu & Ordering
- `GET /customer/branches/{id}/menu` - Active menu items by category
- `POST /customer/orders/direct` - Place order with items directly (new)

#### Orders
- `GET /orders` - Customer order history

## Tech Stack

- **Expo SDK 52** - React Native framework
- **React Navigation** - Native stack navigator
- **Axios** - HTTP client
- **TypeScript** - Type safety
- **Context API** - State management (Auth, Cart)

## Project Structure

```
mobile-expo/
├── src/
│   ├── api/
│   │   ├── client.ts          # Axios instance
│   │   └── endpoints.ts       # API endpoint definitions
│   ├── context/
│   │   ├── AuthContext.tsx    # Auth state & token management
│   │   └── CartContext.tsx    # Cart state & branch selection
│   └── screens/
│       ├── auth/              # Login, Register, ResetPassword
│       ├── branches/          # BranchList, BranchDetails
│       ├── cart/              # Cart, Checkout
│       └── orders/            # OrdersScreen
├── App.tsx                    # Navigation setup
├── app.json                   # Expo config
└── package.json
```

## Backend Requirements

The mobile app expects the following backend routes to be available:

### New Endpoint (added for mobile)
- `POST /api/v1/customer/orders/direct` - Create order with items inline (no cart session)

### Existing Endpoints
- Public discovery routes under `/api/v1/public/branches`
- Customer menu routes under `/api/v1/customer/branches/{id}/menu`
- Order history under `/api/v1/orders` (authenticated)

## Development Notes

- **Test Mode**: Payment uses Stripe test tokens (`pm_card_visa`)
- **Guest vs Auth**: Cart works for both guest (via local state) and authenticated users
- **Error Handling**: API errors are caught and displayed via alerts
- **TypeScript**: JSX runtime errors in IDE are expected without full `@types/react` install; the app will compile and run correctly with Expo

## Next Steps

1. Install npm dependencies and configure API base URL
2. Run the app on Expo Go or emulator
3. Test the full flow: Browse branches → Add items → Checkout → View orders
4. Integrate real Stripe payment method collection (optional)
5. Add social login support (Google/Apple) if needed
