# 🔐 QoffeRun - Credenziali di Accesso Complete

## 📋 Sistema di Autenticazione

Il sistema QoffeRun utilizza autenticazione separata per due tipi di pannelli con ruoli diversi e controllo accessi basato su role-based authentication.

---

## 🏪 BAR PANEL - Gestione Baristi

### 🌐 URL di Accesso
- **Produzione**: https://bar.qofferun.com
- **Sviluppo**: http://localhost:5173

### 👤 Credenziali Barista
```
Email: luca@barista.it
Password: admin123
Ruolo: barista
Nome: Luca Barista
ID: 1
```

### 🔗 Endpoint API
- **Base URL**: https://api.qofferun.com/api/bar-panel
- **Login**: POST /login
- **Logout**: POST /logout
- **Password Reset**: POST /forgot-password
- **Conferma Reset**: POST /reset-password

### 📧 Notifiche Email
- **Login**: Email automatica ad ogni accesso
- **Reset Password**: Link sicuro con token
- **Cambio Password**: Conferma via email
- **Destinazione Test**: shikosoft.italia@gmail.com

---

## 🛡️ ADMIN PANEL - Gestione Amministratori

### 🌐 URL di Accesso  
- **Produzione**: https://controllo.qofferun.com
- **Sviluppo**: http://localhost:3000

### 👤 Credenziali Admin
```
Email: admin@qofferun.com
Password: admin123
Ruolo: admin
Nome: Admin QoffeRun
ID: 2
```

### 🔗 Endpoint API
- **Base URL**: https://api.qofferun.com/api/admin-panel
- **Login**: POST /login
- **Logout**: POST /logout
- **Password Reset**: POST /forgot-password
- **Conferma Reset**: POST /reset-password

### 📧 Notifiche Email
- **Login**: Email automatica ad ogni accesso amministrativo
- **Reset Password**: Link sicuro con token
- **Cambio Password**: Conferma via email
- **Destinazione Test**: shikosoft.italia@gmail.com

---

## 🔑 Controllo Accessi

### Separazione Ruoli
```
BARISTA (role: barista):
- ✅ Accesso a bar.qofferun.com
- ❌ NO accesso a controllo.qofferun.com
- ✅ API: /api/bar-panel/*
- ❌ NO API: /api/admin-panel/*

ADMIN (role: admin):
- ❌ NO accesso a bar.qofferun.com  
- ✅ Accesso a controllo.qofferun.com
- ❌ NO API: /api/bar-panel/*
- ✅ API: /api/admin-panel/*
```

### Sicurezza Implementata
- **JWT Tokens**: Autenticazione con Sanctum
- **localStorage Separato**: Credenziali isolate per tipo
- **Auto-logout**: Su token scaduto (401)
- **Rate Limiting**: Protezione anti-brute force
- **Role Validation**: Backend verifica ruolo ad ogni request

---

## 📡 API Testing

### Test Login Bar Panel
```bash
curl -X POST https://api.qofferun.com/api/bar-panel/login \
  -H "Content-Type: application/json" \
  -d '{"email":"luca@barista.it","password":"admin123"}'
```

### Test Login Admin Panel
```bash
curl -X POST https://api.qofferun.com/api/admin-panel/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@qofferun.com","password":"admin123"}'
```

### Test Password Reset Bar
```bash
curl -X POST https://api.qofferun.com/api/bar-panel/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"luca@barista.it"}'
```

### Test Password Reset Admin
```bash
curl -X POST https://api.qofferun.com/api/admin-panel/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@qofferun.com"}'
```

---

## 🗄️ Database - Tabella Users

### Struttura Utenti
```sql
SELECT id, name, email, role, created_at, updated_at 
FROM users;

+----+---------------+-------------------+---------+---------------------+---------------------+
| id | name          | email             | role    | created_at          | updated_at          |
+----+---------------+-------------------+---------+---------------------+---------------------+
|  1 | Luca Barista  | luca@barista.it   | barista | 2025-08-29 20:39:00 | 2025-11-06 12:56:00 |
|  2 | Admin QoffeRun| admin@qofferun.com| admin   | 2025-11-06 12:56:00 | 2025-11-06 12:56:00 |
+----+---------------+-------------------+---------+---------------------+---------------------+
```

### Creazione Nuovi Utenti

#### Nuovo Barista
```bash
# Nel backend Laravel
User::create([
    'name' => 'Nome Barista',
    'email' => 'nuovo@barista.it',
    'password' => Hash::make('admin123'),
    'role' => 'barista'
]);
```

#### Nuovo Admin
```bash
# Nel backend Laravel
User::create([
    'name' => 'Nome Admin', 
    'email' => 'nuovo@admin.com',
    'password' => Hash::make('admin123'),
    'role' => 'admin'
]);
```

---

## 📧 Sistema Email - Configurazione SMTP

### Server SMTP Aruba
```env
MAIL_MAILER=smtp
MAIL_HOST=smtps.aruba.it
MAIL_PORT=465
MAIL_USERNAME=noreply@qofferun.com
MAIL_PASSWORD=[PASSWORD_ARUBA]
MAIL_ENCRYPTION=ssl
MAIL_FROM_ADDRESS=noreply@qofferun.com
MAIL_FROM_NAME="QoffeRun System"
```

### Templates Email Disponibili
- **BarLoginNotification**: Notifica login barista
- **BarPasswordReset**: Reset password barista  
- **BarPasswordChanged**: Conferma cambio password
- **AdminLoginNotification**: Notifica login admin (usa stesso template)
- **AdminPasswordReset**: Reset password admin (usa stesso template)

---

## 🚀 Deploy e Avvio Sistema

### Backend (Laravel)
```bash
cd /srv/qofferun
docker compose up -d backend db
```

### Frontend Bar Panel  
```bash
cd /srv/qofferun/frontend-bar-panel
npm run build
docker compose up -d bar_frontend
```

### Frontend Admin Panel
```bash
cd /srv/qofferun/frontend-admin-panel  
npm run build
docker compose up -d controllo_frontend
```

### Verifica Sistema
```bash
docker compose ps
curl https://api.qofferun.com/health
curl https://bar.qofferun.com
curl https://controllo.qofferun.com
```

---

## 🛠️ Troubleshooting

### Password Reset Non Funziona
1. Verifica SMTP credentials in `.env`
2. Controlla logs: `docker compose logs backend`
3. Test manuale API reset password

### Frontend Non Carica  
1. Hard refresh: Ctrl+F5
2. Verifica build: `npm run build`
3. Check volume Docker: `docker compose logs bar_frontend`

### Token Scaduto
1. Logout completo
2. Clear localStorage browser
3. Login nuovamente

### API Non Risponde
1. Verifica container: `docker compose ps`
2. Check logs backend: `docker compose logs backend` 
3. Test diretto: `curl https://api.qofferun.com/health`

---

## 📝 Note Sviluppo

### Environment Variables
```env
# Frontend (.env)
VITE_API_URL=https://api.qofferun.com

# Backend (.env)
APP_URL=https://api.qofferun.com
DB_HOST=qoffe-run-db
DB_DATABASE=qofferun_db
```

### URLs Completi Sistema
- **Backend API**: https://api.qofferun.com
- **Bar Panel**: https://bar.qofferun.com  
- **Admin Panel**: https://controllo.qofferun.com
- **Portal**: https://qofferun.com (se configurato)

---

## ✅ Checklist Verifica Sistema

- [ ] Backend API risponde su https://api.qofferun.com
- [ ] Login barista funziona su bar.qofferun.com
- [ ] Login admin funziona su controllo.qofferun.com
- [ ] Password reset invia email correttamente
- [ ] Logout invalida token correttamente  
- [ ] Role separation funziona (barista ≠ admin)
- [ ] Email notifications arrivano
- [ ] Auto-logout su token scaduto
- [ ] Hard refresh mostra modifiche frontend

---

**📅 Ultimo Aggiornamento**: 6 Novembre 2025
**🔧 Sistema**: Laravel 10 + React + Docker + Traefik
**📧 Email**: Aruba SMTP - noreply@qofferun.com