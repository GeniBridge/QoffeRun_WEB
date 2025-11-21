#!/bin/bash

# QoffeRun - Aggiorna Client ID Stripe Connect
# Sostituisci IL_TUO_CLIENT_ID_QUI con il vero Client ID da Stripe

echo "🔧 Aggiornando Client ID Stripe Connect..."

CLIENT_ID="IL_TUO_CLIENT_ID_QUI"

if [[ $CLIENT_ID == "IL_TUO_CLIENT_ID_QUI" ]]; then
    echo "❌ ERRORE: Devi sostituire IL_TUO_CLIENT_ID_QUI con il vero Client ID!"
    echo "Il Client ID deve iniziare con 'ca_'"
    exit 1
fi

if [[ $CLIENT_ID != ca_* ]]; then
    echo "❌ ERRORE: Il Client ID deve iniziare con 'ca_'"
    echo "Hai inserito: $CLIENT_ID"
    exit 1
fi

docker compose exec backend php artisan tinker --execute="
\App\Models\SystemSetting::updateOrCreate(
  ['key' => 'stripe_connect_client_id'],
  [
    'value' => '$CLIENT_ID',
    'name' => 'Stripe Connect Client ID',
    'category' => 'payment',
    'type' => 'string',
    'is_public' => false
  ]
);

echo 'Client ID aggiornato: $CLIENT_ID\n';
echo '✅ Stripe Connect ora configurato correttamente!\n';
"

echo "🎉 Configurazione completata!"
echo "Ora puoi testare il collegamento account nel bar panel."