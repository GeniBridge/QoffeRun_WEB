# 📋 API Registrazione Bar - QoffeRun

## 🚀 Endpoint di Registrazione

### POST `/api/v1/bar/registrazione`

Endpoint pubblico per la registrazione di nuovi bar con indirizzo Google Maps e dati gestore.

#### Headers
```
Content-Type: multipart/form-data
Accept: application/json
```

#### Parametri Richiesti

##### 📍 Informazioni Bar
- `nome` (string, max:255) - Nome del bar
- `descrizione` (string, max:1000) - Descrizione del bar

##### 🗺️ Indirizzo Strutturato (Google Maps)
- `indirizzo_completo` (string, max:500) - Indirizzo formattato da Google Maps
- `via` (string, nullable, max:255) - Via/Piazza
- `numero_civico` (string, nullable, max:20) - Numero civico
- `citta` (string, required, max:100) - Città
- `provincia` (string, required, max:10) - Sigla provincia (es: "RM", "MI")
- `regione` (string, required, max:100) - Regione
- `cap` (string, required, max:10) - Codice avviamento postale
- `paese` (string, nullable, max:100, default:"Italia") - Paese
- `latitudine` (decimal, required, -90 to 90) - Latitudine GPS
- `longitudine` (decimal, required, -180 to 180) - Longitudine GPS

##### 👤 Dati Gestore
- `gestore_nome` (string, required, max:100) - Nome del gestore
- `gestore_cognome` (string, required, max:100) - Cognome del gestore
- `gestore_email` (email, required, max:255, unique) - Email del gestore
- `gestore_telefono` (string, nullable, max:20) - Telefono del gestore
- `gestore_password` (string, required, min:8) - Password per l'account

##### 🖼️ Media (Opzionali)
- `logo` (file, image, max:2MB) - Logo del bar (jpeg,png,jpg,gif)
- `cover` (file, image, max:5MB) - Immagine di copertina (jpeg,png,jpg,gif)

#### Esempio di Richiesta JavaScript

```javascript
const formData = new FormData()

// Dati bar
formData.append('nome', 'Bar Centrale')
formData.append('descrizione', 'Bar storico nel centro città')

// Indirizzo (da Google Maps Autocomplete)
formData.append('indirizzo_completo', 'Via Roma, 123, 00100 Roma RM, Italia')
formData.append('via', 'Via Roma')
formData.append('numero_civico', '123')
formData.append('citta', 'Roma')
formData.append('provincia', 'RM')
formData.append('regione', 'Lazio')
formData.append('cap', '00100')
formData.append('paese', 'Italia')
formData.append('latitudine', 41.9028)
formData.append('longitudine', 12.4964)

// Gestore
formData.append('gestore_nome', 'Mario')
formData.append('gestore_cognome', 'Rossi')
formData.append('gestore_email', 'mario.rossi@email.com')
formData.append('gestore_telefono', '+39 123 456 7890')
formData.append('gestore_password', 'password123')

// File (se presenti)
formData.append('logo', logoFile)
formData.append('cover', coverFile)

// Invio richiesta
fetch('https://api.qofferun.com/api/v1/bar/registrazione', {
  method: 'POST',
  body: formData,
  headers: {
    'Accept': 'application/json'
  }
})
```

#### Risposte

##### ✅ Successo (201)
```json
{
  "success": true,
  "message": "Registrazione completata con successo! Il tuo bar è in attesa di approvazione.",
  "data": {
    "bar_id": 123,
    "bar_name": "Bar Centrale",
    "qr_code": "QRAB1234",
    "registration_status": "pending",
    "user_id": 456,
    "address": {
      "formatted_address": "Via Roma, 123, 00100 Roma RM, Italia",
      "via": "Via Roma",
      "numero_civico": "123",
      "citta": "Roma",
      "provincia": "RM",
      "regione": "Lazio",
      "cap": "00100",
      "paese": "Italia",
      "lat": 41.9028,
      "lng": 12.4964
    },
    "coordinates": {
      "lat": 41.9028,
      "lng": 12.4964
    }
  }
}
```

##### ❌ Errore Validazione (422)
```json
{
  "success": false,
  "message": "Errori di validazione",
  "errors": {
    "gestore_email": ["The gestore email has already been taken."],
    "latitudine": ["The latitudine field is required."]
  }
}
```

##### ❌ Errore Server (500)
```json
{
  "success": false,
  "message": "Errore durante la registrazione: Database connection failed"
}
```

---

## 🔍 Controllo Stato Registrazione

### POST `/api/v1/bar/status`

Controlla lo stato di una registrazione esistente.

#### Parametri
- `email` (email, required) - Email del gestore

#### Esempio Richiesta
```javascript
fetch('https://api.qofferun.com/api/v1/bar/status', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  body: JSON.stringify({
    email: 'mario.rossi@email.com'
  })
})
```

#### Risposta Successo
```json
{
  "success": true,
  "data": {
    "bar_name": "Bar Centrale",
    "registration_status": "pending|approved|rejected",
    "registration_date": "2025-11-05T10:30:00.000000Z",
    "registration_notes": "In attesa di documenti",
    "qr_code": "QRAB1234"
  }
}
```

---

## 📱 Frontend - Google Maps Setup

### 1. Configurazione Environment
Aggiungi nel file `.env`:
```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
VITE_API_URL=https://api.qofferun.com
```

### 2. Abilitare APIs Google Cloud
Nel Google Cloud Console, abilita:
- **Maps JavaScript API**
- **Places API**
- **Geocoding API**

### 3. Configurazione API Key
Restriczioni consigliate per l'API key:
- **Application restrictions**: HTTP referrers
- **Referrers**: `https://qofferun.com/*`, `https://www.qofferun.com/*`
- **API restrictions**: Maps JavaScript API, Places API, Geocoding API

---

## 🗄️ Database Structure

### Tabella `bars`

```sql
-- Campi aggiornati per indirizzo strutturato
ALTER TABLE bars ADD COLUMN indirizzo_completo TEXT;
ALTER TABLE bars ADD COLUMN via VARCHAR(255);
ALTER TABLE bars ADD COLUMN numero_civico VARCHAR(20);
ALTER TABLE bars ADD COLUMN citta VARCHAR(100);
ALTER TABLE bars ADD COLUMN provincia VARCHAR(10);
ALTER TABLE bars ADD COLUMN regione VARCHAR(100);
ALTER TABLE bars ADD COLUMN cap VARCHAR(10);
ALTER TABLE bars ADD COLUMN paese VARCHAR(100) DEFAULT 'Italia';
ALTER TABLE bars ADD COLUMN place_name VARCHAR(255);

-- Campi gestore
ALTER TABLE bars ADD COLUMN gestore_nome VARCHAR(100);
ALTER TABLE bars ADD COLUMN gestore_cognome VARCHAR(100);
ALTER TABLE bars ADD COLUMN gestore_email VARCHAR(255);
ALTER TABLE bars ADD COLUMN gestore_telefono VARCHAR(20);

-- Stato registrazione
ALTER TABLE bars ADD COLUMN registration_status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending';
ALTER TABLE bars ADD COLUMN registration_date TIMESTAMP;
ALTER TABLE bars ADD COLUMN registration_notes TEXT;
```

---

## 🔄 Workflow di Registrazione

1. **Frontend**: Utente compila form con Google Maps Autocomplete
2. **Google Maps API**: Fornisce coordinate e indirizzo strutturato
3. **Frontend**: Invia dati completi al backend Laravel
4. **Backend**: Valida dati e crea User + Bar record
5. **Database**: Salva con status "pending"
6. **Admin**: Approva/rifiuta la registrazione
7. **Notifica**: Email di conferma al gestore

---

**Versione API**: v1.0  
**Ultimo aggiornamento**: 5 Novembre 2025