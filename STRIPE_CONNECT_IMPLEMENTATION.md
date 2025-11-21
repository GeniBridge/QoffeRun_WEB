# 🎯 Implementazione Stripe Connect - Sistema QoffeRun

## 📋 Panoramica del Sistema

Questo documento descrive l'implementazione completa di Stripe Connect per QoffeRun, un sistema di e-commerce multi-tenant per caffetterie e ristoranti con distribuzione automatica delle commissioni.

### 🏗️ Architettura del Sistema

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   QoffeRun      │    │  Stripe Connect  │    │  Branch/Chain   │
│   Platform      │────│    Gateway       │────│   Accounts      │
│  (5% Commission)│    │                  │    │ (95% Revenue)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 💡 Caratteristiche Principali

1. **Multi-Tenant Architecture**: Ogni catena può avere un proprio account Stripe Connect
2. **Manual Capture**: Pagamenti autorizzati ma catturati solo quando l'ordine è completato
3. **Automatic Commission Distribution**: 5% a QoffeRun, resto al merchant
4. **Express Account Setup**: Onboarding semplificato per merchant
5. **Webhook Integration**: Gestione eventi in tempo reale
6. **Test Mode Support**: Testing illimitato con simulazioni

## 🔧 Componenti Implementati

### 1. Database Schema

#### Tabella `chains`
```sql
-- Già esistente con:
stripe_account_id VARCHAR(255) -- Account Stripe Connect della catena
```

#### Tabella `branches` (Aggiornata)
```sql
-- Nuovi campi aggiunti:
separate_payments BOOLEAN DEFAULT false -- Pagamenti separati dalla catena
branch_commission_rate DECIMAL(5,2) -- Override commissioni per branch
payout_schedule ENUM('daily', 'weekly', 'monthly') DEFAULT 'daily'
```

#### Tabella `orders` (Esistente)
```sql
payment_status ENUM('pending', 'authorized', 'paid', 'failed', 'cancelled', 'refunded')
payment_intent_id VARCHAR(255) -- ID Stripe PaymentIntent
```

### 2. Controllers Implementati

#### 🏢 StripeConnectController (`/api/v1/stripe-connect/`)

**Endpoints:**
- `POST /accounts` - Crea account Express per catena
- `POST /account-links` - Genera link onboarding KYC
- `GET /accounts/{chainId}/status` - Stato account e requirements

**Funzionalità:**
- Creazione account Express con capabilities `card_payments` e `transfers`
- Generazione Account Links per processo KYC
- Verifica status e requirements compliance

#### 💳 OrderController (Aggiornato)

**Nuovi Endpoints:**
- `POST /orders/{orderId}/capture` - Cattura pagamento manuale
- `POST /orders/{orderId}/cancel` - Cancella pagamento autorizzato

**Funzionalità Manual Capture:**
- PaymentIntent con `capture_method: "manual"`
- Autorizzazione immediata, cattura deferred
- Commission split automatico tramite `application_fee_amount`

#### 🔔 StripeWebhookController (`/api/v1/stripe/webhook`)

**Eventi Gestiti:**
- `payment_intent.succeeded` - Conferma pagamento
- `payment_intent.payment_failed` - Pagamento fallito  
- `payment_intent.canceled` - Pagamento cancellato
- `account.updated` - Aggiornamenti account merchant
- `transfer.created/failed` - Stato trasferimenti

### 3. Frontend Test Interface

#### 🧪 Test Interface Completa (`test-ordering-system.html`)

**Nuova Sezione: Step 5 - Stripe Connect Management**

1. **Account Creation**:
   - Chain ID, Business Name, Email, Country
   - Crea account Express Stripe
   - Verifica capabilities e status

2. **Onboarding Management**:
   - Genera Account Links per KYC
   - Apertura automatica del processo onboarding
   - Tracking requirements e compliance

3. **Payment Operations**:
   - Manual capture per ordini autorizzati
   - Cancellazione pagamenti con motivo
   - Real-time status updates

## 🚀 Workflow Operativo

### 1. Setup Merchant (Una Tantum)

```javascript
// 1. Crea account Stripe Connect
const account = await createConnectedAccount({
    chain_id: 1,
    business_name: "Caffè Centrale",
    business_email: "admin@caffecentrale.it", 
    country: "IT"
});

// 2. Genera link onboarding
const onboardingLink = await createAccountLink({
    account_id: account.account_id,
    refresh_url: "https://admin.qofferun.com/setup",
    return_url: "https://admin.qofferun.com/dashboard"
});

// 3. Merchant completa KYC via Stripe
```

### 2. Processo Ordine con Manual Capture

```javascript
// 1. Customer crea ordine
const order = await createOrder({
    payment_method: "pm_card_visa", // o pm_test_* per testing
    customer_name: "Mario Rossi",
    total: 44.77 // €44.77 ordine
});
// → Payment Status: "authorized" (€44.77 held, not captured)

// 2. Staff prepara ordine e cattura pagamento
const capture = await capturePayment(order.id, {
    staff_id: 1
});
// → Payment Status: "paid" 
// → Commission: €2.24 to QoffeRun, €42.53 to Branch

// 3. Alternative: Cancellation
const cancel = await cancelPayment(order.id, {
    staff_id: 1,
    reason: "Order cancelled by customer"
});
// → Payment Status: "cancelled", funds released
```

### 3. Commission Distribution (Automatica)

```javascript
// Nel createOrder, automaticamente:
const paymentIntent = PaymentIntent.create({
    amount: 4477, // €44.77 in cents
    currency: 'eur',
    capture_method: 'manual',
    application_fee_amount: 224, // €2.24 commission (5%)
    transfer_data: {
        destination: 'acct_branch123' // Account del merchant
    }
});
```

## ⚙️ Configurazione Sistema

### System Settings Richiesti

```php
// Settings già configurati:
stripe_secret_key = "sk_test_51SSRs86Oy6LeFIOG..."
stripe_webhook_secret = "whsec_test_development_key"
default_commission_rate = 0.05 // 5%
min_commission_amount = 0.50 // €0.50 
max_commission_amount = 10.00 // €10.00
```

### Webhook Endpoint

```
POST https://api.qofferun.com/api/v1/stripe/webhook
```

**Events da configurare in Stripe Dashboard:**
- `payment_intent.succeeded`
- `payment_intent.payment_failed` 
- `payment_intent.canceled`
- `account.updated`
- `transfer.created`
- `transfer.failed`

## 🧪 Testing e Simulazioni

### Test Mode Features

1. **Unlimited Testing**: PaymentMethods che iniziano con `pm_test_` vengono simulate
2. **Instant Results**: No real API calls per test payments
3. **Full Workflow**: Tutti i passaggi simulati end-to-end

### Test Cards Disponibili

```javascript
// Utilizzabili nell'interfaccia test:
"4242424242424242" // Visa success
"4000000000000002" // Card declined  
"4000000000009995" // Insufficient funds
"4000000000000069" // Expired card
// + qualsiasi altra combinazione per test mode
```

### Test Scenarios

1. **Account Creation**: Test con chain_id=1
2. **Order Flow**: Test completo da branch selection a payment
3. **Manual Capture**: Simula staff che completa ordine
4. **Cancellation**: Test annullamento con various reasons
5. **Commission Calculation**: Verifica split corretto

## 📊 Monitoring e Logging

### Log Events

```php
// Tutti gli eventi vengono loggati:
\Log::info('Payment captured', [
    'order_id' => $orderId,
    'amount' => $totalAmount,
    'commission' => $commissionAmount,
    'staff_id' => $staffId
]);
```

### Webhook Logs

```php
// Webhook events tracciati:
\Log::info('Stripe webhook received', [
    'event_type' => $event['type'],
    'account_id' => $accountId,
    'payment_intent_id' => $paymentIntentId
]);
```

## 🔒 Sicurezza

1. **Webhook Signature Verification**: Tutti i webhook verificati con signature
2. **Account Isolation**: Ogni merchant può accedere solo ai propri dati
3. **Manual Capture Security**: Solo staff autorizzato può catturare payments
4. **API Rate Limiting**: Protezione contro abuso APIs

## 🚀 Deploy e Produzione

### Environment Variables Richiesti

```env
STRIPE_SECRET_KEY=sk_live_...  # Live key per produzione
STRIPE_WEBHOOK_SECRET=whsec_... # Webhook secret reale
```

### Pre-Deployment Checklist

- [ ] Migrate database con nuovi campi branches
- [ ] Configurare system settings per Stripe
- [ ] Setup webhook endpoint in Stripe Dashboard  
- [ ] Test completo con test keys
- [ ] Switch a live keys per produzione
- [ ] Setup monitoring per webhook failures

## 📞 Supporto e Documentazione

- **Test Interface**: https://api.qofferun.com/frontend-portal/build/test-ordering-system.html
- **API Docs**: Tutti gli endpoint documentati nei controllers
- **Stripe Connect Guide**: https://stripe.com/docs/connect/express-accounts
- **Webhook Reference**: https://stripe.com/docs/webhooks

---

**✨ Sistema pronto per produzione con architettura Stripe Connect professionale!**