#!/bin/bash

# QoffeRun Stripe Connect Setup Script
# Replace the values below with your actual Stripe test keys

echo "🔧 Setting up Stripe Connect for QoffeRun..."

# Replace these with your actual Stripe test keys from https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY="sk_test_YOUR_SECRET_KEY_HERE"
STRIPE_PUBLISHABLE_KEY="pk_test_YOUR_PUBLISHABLE_KEY_HERE"  
STRIPE_CONNECT_CLIENT_ID="ca_YOUR_CONNECT_CLIENT_ID_HERE"

# Update system settings
docker compose exec backend php artisan tinker --execute="
// Update Stripe Secret Key
\App\Models\SystemSetting::updateOrCreate(
  ['key' => 'stripe_secret_key'],
  [
    'value' => '$STRIPE_SECRET_KEY',
    'category' => 'payment',
    'type' => 'string', 
    'is_public' => false
  ]
);

// Update Stripe Publishable Key  
\App\Models\SystemSetting::updateOrCreate(
  ['key' => 'stripe_publishable_key'],
  [
    'value' => '$STRIPE_PUBLISHABLE_KEY',
    'category' => 'payment',
    'type' => 'string',
    'is_public' => true
  ]
);

// Update Stripe Connect Client ID
\App\Models\SystemSetting::updateOrCreate(
  ['key' => 'stripe_connect_client_id'],
  [
    'value' => '$STRIPE_CONNECT_CLIENT_ID',
    'category' => 'payment',
    'type' => 'string',
    'is_public' => false
  ]
);

echo 'All Stripe settings updated successfully!\n';
"

echo "✅ Stripe Connect setup complete!"
echo "📝 Next steps:"
echo "   1. Get your Stripe keys from: https://dashboard.stripe.com/test/apikeys"
echo "   2. Enable Connect in: https://dashboard.stripe.com/test/connect/accounts/overview"
echo "   3. Update this script with your real keys and run it"