# 🎯 QoffeRun - Integrazione Frontend & Backend

## 📋 Sistema Completato

Il sistema di autenticazione è stato completamente integrato tra backend Laravel e frontend React/CoreUI.

### 🏗️ Architettura

```
QoffeRun/
├── backend/                     # Laravel 10 + Sanctum
│   ├── src/app/Http/Controllers/
│   │   ├── Bar/BarAuthController.php
│   │   └── Admin/AdminAuthController.php
│   ├── src/app/Services/
│   │   └── BarEmailService.php
│   └── src/app/Mail/
│       ├── BarLoginNotification.php
│       ├── BarPasswordReset.php
│       └── BarPasswordChanged.php
├── frontend-bar-panel/          # React + Vite (Porto 5173)
│   ├── src/services/authService.js
│   ├── src/context/AuthContext.jsx  
│   └── src/pages/Login.jsx
└── frontend-admin-panel/        # React + CoreUI (Porto 3000)
    ├── src/services/adminAuthService.js
    └── src/views/pages/login/Login.js
```

## 🔐 Endpoint API

### Bar Panel (`/api/bar-panel/`)
- `POST /login` - Autenticazione barista
- `POST /forgot-password` - Reset password 
- `POST /reset-password` - Conferma nuovo password
- `POST /logout` - Disconnessione

### Admin Panel (`/api/admin-panel/`)
- `POST /login` - Autenticazione admin
- `POST /forgot-password` - Reset password
- `POST /reset-password` - Conferma nuovo password  
- `POST /logout` - Disconnessione

## 👥 Utenti di Test

```bash
# Barista (per bar.qofferun.com)
Email: luca@barista.it
Password: admin123
Role: barista

# Admin (per controllo.qofferun.com)  
Email: admin@qofferun.com
Password: admin123
Role: admin
```

## 🚀 Come Avviare

### 1. Backend (Docker)
```bash
cd /srv/qofferun
docker compose up -d
```

### 2. Bar Panel Frontend
```bash
cd /srv/qofferun/frontend-bar-panel
npm install
npm run dev
# Apri: http://localhost:5173
```

### 3. Admin Panel Frontend
```bash
cd /srv/qofferun/frontend-admin-panel
npm install  
npm start
# Apri: http://localhost:3000
```

## 📧 Sistema Email

### Configurazione SMTP
- **Server**: smtps.aruba.it:465
- **From**: noreply@qofferun.com (SOLO)
- **Auth**: SMTP_USERNAME e SMTP_PASSWORD

### Templates Email
- **Login Notification**: Inviata ad ogni accesso
- **Password Reset**: Link sicuro con token
- **Password Changed**: Conferma cambio password

## 🔧 Configurazione Frontend

### Environment Variables (.env)
```env
# Bar Panel & Admin Panel
VITE_API_URL=http://localhost:8000
VITE_NODE_ENV=development
```

## 🛡️ Sicurezza Implementata

### Authentication Flow
1. **Login**: Credenziali → JWT Token → localStorage
2. **API Calls**: Bearer Token in headers
3. **Auto-logout**: Su 401 Unauthorized  
4. **Role Check**: Backend valida ruolo utente
5. **Session**: Token persistente fino logout

### Protezioni
- ✅ CORS configurato
- ✅ Rate limiting su login
- ✅ Password reset con token temporaneo
- ✅ Separazione ruoli (barista/admin)
- ✅ Email notifications per sicurezza

## 📱 Funzionalità Frontend

### Bar Panel
- Login/Logout integrato
- Password reset funzionante
- User info nel header
- Auto-redirect su scadenza token
- Gestione errori API

### Admin Panel  
- Login CoreUI styled
- Dropdown user con logout
- Protected routes
- Session management
- Error handling

## 🧪 Test & Debug

### Test Login API
```bash
# Bar Panel Login
curl -X POST http://backend-url/api/bar-panel/login \
  -H "Content-Type: application/json" \
  -d '{"email":"luca@barista.it","password":"admin123"}'

# Admin Panel Login
curl -X POST http://backend-url/api/admin-panel/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@qofferun.com","password":"admin123"}'
```

### Debug Frontend
- **Browser Console**: Errori API e authentication
- **Network Tab**: Request/Response API  
- **localStorage**: Token e user data
- **React DevTools**: State e context

## 📝 Note Tecniche

### Differenze Storage
- **Bar Panel**: `auth_token`, `user`, `isAuthenticated`
- **Admin Panel**: `admin_auth_token`, `admin_user`, `admin_isAuthenticated`

### API Response Format
```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "name": "Nome Utente", 
    "email": "email@example.com",
    "role": "barista|admin"
  },
  "message": "Login successful"
}
```

## ✅ Checklist Completamento

- [x] Backend Laravel con Sanctum
- [x] Controllers separati Bar/Admin  
- [x] Email system con Aruba SMTP
- [x] Templates email professionali
- [x] Frontend Bar Panel integrato
- [x] Frontend Admin Panel integrato
- [x] Authentication services
- [x] Protected routes
- [x] Auto-logout functionality
- [x] Password reset completo
- [x] User management
- [x] Role-based access control
- [x] Error handling
- [x] Environment configuration

## 🎉 Sistema Pronto per Produzione!

Il sistema è completamente integrato e pronto per il deploy in produzione con:
- SSL certificates per HTTPS
- Environment variables di produzione  
- Database PostgreSQL configurato
- Email delivery via Aruba SMTP
- Frontend build ottimizzati