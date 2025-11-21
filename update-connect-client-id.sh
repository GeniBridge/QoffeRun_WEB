#!/bin/bash
# Sostituisci CA_YOUR_CLIENT_ID_HERE con il tuo vero Client ID da Stripe Connect

echo "Aggiornando Stripe Connect Client ID..."

docker compose exec backend php artisan tinker --execute="
\App\Models\SystemSetting::updateOrCreate(
  ['key' => 'stripe_connect_client_id'],
  [
    'value' => 'CA_YOUR_CLIENT_ID_HERE',
    'name' => 'Stripe Connect Client ID',
    'category' => 'payment',
    'type' => 'string',
    'is_public' => false
  ]
);

echo 'Client ID aggiornato!\n';
"

echo "✅ Fatto! Ora le filiali possono collegare i loro account Stripe."