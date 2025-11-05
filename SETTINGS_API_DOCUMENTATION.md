# 🔧 API Documentazione - Sistema di Configurazione QoffeRun

## Overview del Sistema di Configurazione

Il sistema QoffeRun implementa un doppio livello di configurazione:
1. **System Settings**: Configurazioni globali del sistema (Google Maps, Stripe, Social Login, ecc.)
2. **Bar Settings**: Configurazioni specifiche per ogni bar (Stripe Connect, Social Media, Notifiche, ecc.)

---

## 🌐 System Settings API

### Endpoints Pubblici

#### GET `/api/v1/settings/public`
Ottieni tutte le impostazioni pubbliche del sistema (non autenticato)

**Response:**
```json
{
  "success": true,
  "data": {
    "google_maps": {
      "google_maps_api_key": "AIza...",
      "google_maps_region": "IT"
    },
    "emails": {
      "support_email": "support@qofferun.com",
      "info_email": "info@qofferun.com"
    },
    "stripe_system": {
      "stripe_public_key": "pk_live_...",
      "stripe_connect_client_id": "ca_..."
    },
    "app": {
      "app_version": "1.0.0",
      "maintenance_mode": false,
      "max_upload_size": 10485760
    }
  }
}
```

### Endpoints Autenticati

#### GET `/api/v1/settings`
Ottieni tutte le impostazioni (pubbliche per utenti normali, tutte per admin)

**Headers:** `Authorization: Bearer {token}`

**Query Parameters:**
- `category` (opzionale): Filtra per categoria
- `public_only` (opzionale): Solo impostazioni pubbliche

#### GET `/api/v1/settings/{key}`
Ottieni un'impostazione specifica

**Esempio:** `GET /api/v1/settings/google_maps_api_key`

### Endpoints Admin (Solo Amministratori)

#### POST `/api/v1/admin/settings`
Crea una nuova impostazione

**Body:**
```json
{
  "key": "custom_setting",
  "value": "valore",
  "name": "Nome Impostazione",
  "description": "Descrizione opzionale",
  "type": "string",
  "category": "custom",
  "is_encrypted": false,
  "is_public": false
}
```

#### PUT `/api/v1/admin/settings/{key}`
Aggiorna un'impostazione esistente

**Body:**
```json
{
  "value": "nuovo_valore",
  "name": "Nome Aggiornato"
}
```

#### DELETE `/api/v1/admin/settings/{key}`
Elimina un'impostazione

#### POST `/api/v1/admin/settings/batch`
Aggiorna multiple impostazioni

**Body:**
```json
{
  "settings": [
    {
      "key": "google_maps_api_key",
      "value": "AIzaSyC..."
    },
    {
      "key": "stripe_public_key", 
      "value": "pk_live_..."
    }
  ]
}
```

---

## 🏪 Bar Settings API

### Endpoints Bar (Proprietari e Admin)

#### GET `/api/v1/bars/{barId}/settings`
Ottieni tutte le impostazioni di un bar

**Headers:** `Authorization: Bearer {token}`
**Permessi:** Proprietario del bar o Admin

**Query Parameters:**
- `category` (opzionale): Filtra per categoria

**Response:**
```json
{
  "success": true,
  "data": {
    "stripe": {
      "stripe_account_id": "acct_...",
      "stripe_onboarding_completed": true
    },
    "social": {
      "facebook_page_url": "https://facebook.com/miobar",
      "instagram_profile": "miobar_instagram"
    },
    "notifications": {
      "push_notifications_enabled": true,
      "email_notifications_enabled": true
    }
  }
}
```

#### GET `/api/v1/bars/{barId}/settings/{key}`
Ottieni un'impostazione specifica del bar

#### POST `/api/v1/bars/{barId}/settings`
Crea una nuova impostazione per il bar

**Body:**
```json
{
  "key": "custom_bar_setting",
  "value": "valore",
  "name": "Nome Impostazione",
  "type": "string",
  "category": "custom",
  "is_encrypted": false
}
```

#### PUT `/api/v1/bars/{barId}/settings/{key}`
Aggiorna un'impostazione del bar

#### DELETE `/api/v1/bars/{barId}/settings/{key}`
Elimina un'impostazione del bar

#### POST `/api/v1/bars/{barId}/settings/batch`
Aggiorna multiple impostazioni del bar

#### POST `/api/v1/bars/{barId}/settings/initialize`
Inizializza impostazioni predefinite per un nuovo bar

---

## 📊 Categorie di Configurazione

### System Settings

| Categoria | Descrizione | Impostazioni Principali |
|-----------|-------------|-------------------------|
| `google_maps` | Google Maps API | api_key, region |
| `emails` | Configurazioni email | support_email, noreply_email, info_email |
| `stripe_system` | Stripe configurazione sistema | public_key, secret_key, webhook_secret |
| `social` | Login social | facebook_app_id, google_client_id |
| `notifications` | Notifiche push | firebase_server_key, apns_certificate |
| `commissions` | Commissioni sistema | default_rate, min_amount, max_amount |
| `app` | Configurazioni app | version, maintenance_mode, max_upload |

### Bar Settings

| Categoria | Descrizione | Impostazioni Principali |
|-----------|-------------|-------------------------|
| `stripe` | Stripe Connect bar | account_id, onboarding_completed |
| `social` | Social media bar | facebook_page_url, instagram_profile |
| `notifications` | Notifiche bar | push_enabled, email_enabled |
| `commissions` | Commissioni personalizzate | custom_commission_rate |

---

## 🔐 Sicurezza e Crittografia

### Campi Crittografati
Alcuni campi sensibili vengono automaticamente crittografati:
- `stripe_secret_key`
- `facebook_app_secret`
- `google_client_secret`
- `firebase_server_key`
- `apns_certificate_password`

### Permessi
- **Pubbliche**: Accessibili senza autenticazione (es. google_maps_api_key)
- **Autenticate**: Richiedono token valido
- **Admin**: Solo amministratori di sistema
- **Bar Owner**: Solo proprietario del bar o admin

---

## 💡 Esempi di Utilizzo

### Frontend: Ottenere Google Maps API Key
```javascript
// Ottieni impostazioni pubbliche
const response = await fetch('/api/v1/settings/public')
const settings = await response.json()
const googleMapsKey = settings.data.google_maps.google_maps_api_key
```

### Backend: Leggere una configurazione
```php
use App\Models\SystemSetting;
use App\Models\BarSetting;

// Impostazione di sistema
$commission = SystemSetting::get('default_commission_rate', 0.05);

// Impostazione specifica del bar
$customCommission = BarSetting::getForBar($barId, 'custom_commission_rate');
$finalCommission = $customCommission ?: $commission;
```

### Configurare Stripe per un bar
```javascript
// Inizializza impostazioni predefinite
await fetch(`/api/v1/bars/${barId}/settings/initialize`, {
  method: 'POST',
  headers: { 'Authorization': `Bearer ${token}` }
})

// Aggiorna account Stripe
await fetch(`/api/v1/bars/${barId}/settings/stripe_account_id`, {
  method: 'PUT',
  headers: { 
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ value: 'acct_1234567890' })
})
```

---

## 🔄 Commissioni Sistema

### Configurazione Commissioni
Il sistema supporta commissioni flessibili:

1. **Commissione Globale**: `default_commission_rate` (es. 5%)
2. **Commissione Minima**: `min_commission_amount` (es. €0.50)
3. **Commissione Massima**: `max_commission_amount` (es. €10.00)
4. **Commissione Personalizzata Bar**: `custom_commission_rate` per bar specifici

### Calcolo Commissioni
```php
$orderAmount = 25.00; // €25
$systemRate = 0.05;   // 5%
$minCommission = 0.50; // €0.50
$maxCommission = 10.00; // €10.00

$commission = $orderAmount * $systemRate; // €1.25
$commission = max($commission, $minCommission); // €1.25 (maggiore di €0.50)
$commission = min($commission, $maxCommission); // €1.25 (minore di €10.00)
```

---

**Documentazione aggiornata:** 5 Novembre 2025  
**Versione API:** v1  
**Sistema:** QoffeRun Settings Management