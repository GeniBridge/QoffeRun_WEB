# Accessi Multi-filiali - QoffeRun Bar Panel

## 🔐 Credenziali di Accesso

### **Pannello Bar**: https://bar.qofferun.com

---

## 👑 **Proprietario Catena (Chain Owner)**
- **Email**: `owner@testcoffee.com`
- **Password**: `password123`
- **Ruolo**: `chain_owner`
- **Accesso**: Tutte le filiali della catena
- **Catena**: Test Coffee Chain
- **Filiali Disponibili**: 2 filiali

---

## 🏪 **Gestore Filiale (Branch Manager)**
- **Email**: `manager2@testcoffee.com`
- **Password**: `password123`
- **Ruolo**: `branch_manager`
- **Accesso**: Filiali gestite direttamente
- **Filiali Assegnate**: 2 filiali (Test Coffee Branch 1 & 2)
- **Permessi**: Gestione operativa delle filiali

---

## ☕ **Barista/Staff**
- **Email**: `barista@testcoffee.com`
- **Password**: `password123`
- **Ruolo**: `barista`
- **Accesso**: Filiali della catena assegnata
- **Catena**: Test Coffee Chain
- **Filiali Disponibili**: 2 filiali

---

## 🏢 **Informazioni Catena di Test**

### **Test Coffee Chain**
- **ID Catena**: 15
- **Proprietario**: owner@testcoffee.com
- **Status**: Attiva
- **Filiali**:
  - **Test Coffee Branch 1** (ID: 14)
    - Codice: TCB001
    - Indirizzo: Via Test 123, Milano (MI)
    - Status: Attiva
  - **Test Coffee Branch 2** (ID: 15)
    - Codice: TCB002
    - Indirizzo: Via Roma 456, Milano (MI)
    - Status: Attiva

---

## 🔧 **API Endpoints Disponibili**

### **Base URL**: https://api.qofferun.com

### **Autenticazione**
- `POST /api/bar-panel/login` - Login
- `GET /api/bar-panel/me` - Info utente
- `POST /api/bar-panel/logout` - Logout

### **Gestione Filiali**
- `GET /api/bar-panel/user/branches` - Lista filiali utente
- `GET /api/bar-panel/branches/{id}/settings` - Impostazioni filiale
- `PUT /api/bar-panel/branches/{id}/settings/{key}` - Aggiorna impostazione
- `POST /api/bar-panel/branches/{id}/settings/batch` - Aggiorna multiple impostazioni

### **Esempio Login cURL**
```bash
curl -X POST "https://api.qofferun.com/api/bar-panel/login" \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -d '{"email": "barista@testcoffee.com", "password": "password123"}'
```

---

## 🎯 **Flusso di Autenticazione**

1. **Accesso**: Vai su https://bar.qofferun.com
2. **Login**: Usa una delle credenziali sopra
3. **Validazione Ruolo**: Il sistema verifica se l'utente ha accesso al pannello bar
4. **Selezione Filiale**: 
   - Se l'utente ha accesso a più filiali → Mostra selezione
   - Se ha accesso a una sola filiale → Accesso automatico
5. **Dashboard**: Accesso completo alle funzionalità della filiale

---

## 📊 **Livelli di Accesso per Ruolo**

### **Chain Owner (Proprietario Catena)**
- ✅ Tutte le filiali delle catene possedute
- ✅ Gestione completa
- ✅ Configurazione sistema
- ✅ Analisi e statistiche globali

### **Branch Manager (Gestore Filiale)**
- ✅ Filiali gestite direttamente
- ✅ Gestione operativa
- ✅ Staff management
- ✅ Analisi filiale

### **Barista/Staff**
- ✅ Filiali della catena assegnata
- ✅ Gestione ordini
- ✅ Menu e prodotti
- ✅ Operazioni quotidiane

---

## 🔄 **Cambio Filiale**

Se un utente ha accesso a più filiali:
- **Header del pannello** → Dropdown "Cambia Filiale"
- **Persistenza**: La filiale selezionata viene salvata in localStorage
- **Ricarica automatica** dei dati per la nuova filiale

---

## 🚀 **Status Produzione**

- **Frontend**: ✅ Attivo su https://bar.qofferun.com
- **Backend API**: ✅ Attivo su https://api.qofferun.com
- **Database**: ✅ PostgreSQL con dati di test
- **SSL**: ✅ Certificati Let's Encrypt attivi
- **CORS**: ✅ Configurato per chiamate cross-origin

---

## 📝 **Note Tecniche**

### **Architettura**
- **Frontend**: React + Vite (SPA)
- **Backend**: Laravel + PHP-FPM
- **Database**: PostgreSQL 15
- **Proxy**: Traefik con SSL automatico
- **Containerizzazione**: Docker Compose

### **Sicurezza**
- **Autenticazione**: Laravel Sanctum (Token-based)
- **HTTPS**: Obbligatorio in produzione
- **Validazione Ruoli**: Server-side e client-side
- **CORS**: Configurato per domini autorizzati

### **Performance**
- **Build Size**: ~235KB JavaScript (73KB gzipped)
- **CSS**: 6.79KB (1.85KB gzipped)
- **Load Time**: <500ms
- **API Response**: <100ms

---

*Ultimo aggiornamento: 12 Novembre 2025*
*Ambiente: Produzione - server vmi2774607*