# 📚 Documentazione Server QoffeRun
**Server Root**: `/srv/qofferun`  
**Data Creazione**: 2 Novembre 2025  
**Ambiente**: Produzione  

## 🏗️ Architettura Sistema

### Stack Tecnologico Principale
- **Containerizzazione**: Docker + Docker Compose
- **Reverse Proxy**: Traefik v3.0 con SSL automatico (Let's Encrypt)
- **Database**: PostgreSQL 15 + pgAdmin 4
- **Backend**: PHP 8.1 + Laravel 10 + Nginx + PHP-FPM
- **Frontend**: React 18.3.1 + Vite 5.4 + Tailwind CSS

### Domini e Subdomain
- **`qofferun.com`** / **`www.qofferun.com`** → Portal Landing Page
- **`api.qofferun.com`** → Backend API Laravel
- **`bar.qofferun.com`** → Panel Gestionale Bar
- **`controllo.qofferun.com`** → Panel Amministrativo
- **`db.qofferun.com`** → pgAdmin Database Manager

---

## 🗂️ Struttura Progetti

### 📂 `/srv/qofferun/`
```
├── docker-compose.yml          # Orchestrazione containers
├── nginx-spa.conf             # Configurazione Nginx per SPA
├── backend/                   # API Laravel PHP
├── frontend-portal/           # Landing Page React
├── frontend-admin-panel/      # Panel Amministrativo CoreUI
├── frontend-bar-panel/        # Panel Bar React
├── docker/                    # Dockerfiles aggiuntivi
└── .git/                     # Repository Git
```

---

## 🚀 Backend API - Laravel

### Informazioni Tecniche
- **Path**: `/srv/qofferun/backend/`
- **Framework**: Laravel 10.x
- **PHP Version**: 8.1+
- **Container**: `qoffe-run-backend` (PHP-FPM) + `backend-web` (Nginx)
- **Domain**: `api.qofferun.com`

### Stack Backend
```json
{
  "php": "^8.1",
  "laravel/framework": "^10.10",
  "laravel/sanctum": "^3.0",      // Authentication API
  "guzzlehttp/guzzle": "^7.2",    // HTTP Client
  "laravel/tinker": "^2.8"        // REPL
}
```

### Struttura Directory Backend
```
backend/src/
├── app/
│   ├── Console/              # Comandi Artisan
│   ├── Exceptions/           # Gestione Errori
│   ├── Http/                 # Controllers, Middleware, Requests
│   ├── Models/               # Eloquent Models
│   └── Providers/            # Service Providers
├── config/                   # Configurazioni Laravel
├── database/
│   ├── migrations/           # Migration Database
│   ├── seeders/             # Seed Data
│   └── factories/           # Model Factories
├── routes/
│   ├── api.php              # Route API
│   ├── web.php              # Route Web
│   └── channels.php         # Broadcasting
├── storage/                 # File Storage + Logs
├── tests/                   # Unit & Feature Tests
└── vendor/                  # Composer Dependencies
```

### Configurazione Docker Backend
- **PHP-FPM**: Porta 9000 (rete interna)
- **Nginx**: Porta 80 (esposta via Traefik)
- **Volume Mount**: `./backend/src:/var/www/html`

---

## 🎨 Frontend Portal - Landing Page

### Informazioni Tecniche
- **Path**: `/srv/qofferun/frontend-portal/`
- **Framework**: React 18.3.1 + Vite 5.4
- **Container**: `portal-frontend` (Nginx Alpine)
- **Domain**: `qofferun.com` / `www.qofferun.com`

### Stack Frontend Portal
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.27.0",    // Routing SPA
  "tailwindcss": "^3.4.13",        // CSS Framework
  "vite": "^5.4.8",                // Build Tool
  "autoprefixer": "^10.4.20",      // CSS Post-processing
  "postcss": "^8.4.47"             // CSS Processing
}
```

### Funzionalità Implementate
- ✅ **Landing Page Responsive** con sezioni multiple
- ✅ **Registrazione Multi-step** (4 fasi: dettagli bar, upload media, info manager, riepilogo)
- ✅ **Form di Contatto** con modal
- ✅ **Navigazione Smooth Scroll** tra sezioni
- ✅ **Gallery Screenshots** dell'app mobile
- ✅ **Design System** con colori qorange personalizzati
- ✅ **Typography Bootstrap** per consistenza visiva

### Struttura Pagine Portal
```
src/
├── pages/
│   ├── Home.jsx              # Landing page principale
│   └── Registrazione.jsx     # Form multi-step registrazione
├── layout/
│   └── Layout.jsx            # Layout principale + navigation
├── assets/
│   └── screenshots/          # Screenshot app mobile
└── index.css                 # Stili globali + CSS variables
```

---

## 🏪 Frontend Bar Panel - Gestionale Bar

### Informazioni Tecniche
- **Path**: `/srv/qofferun/frontend-bar-panel/`
- **Framework**: React 18.3.1 + Vite 5.4
- **Container**: `bar-frontend` (Nginx Alpine)
- **Domain**: `bar.qofferun.com`

### Stack Frontend Bar
```json
{
  "react": "^18.3.1",
  "react-dom": "^18.3.1",
  "react-router-dom": "^6.26.2",
  "qrcode.react": "^3.1.0",        // Generazione QR Code
  "vite": "^5.4.21"
}
```

### Funzionalità Bar Panel
- 🏪 **Gestione Menu** prodotti e prezzi
- 📱 **QR Code Generator** per tavoli
- 📊 **Dashboard Ordini** in tempo reale
- 💰 **Gestione Pagamenti** 
- 🧾 **Scontrini Elettronici**
- ⚙️ **Impostazioni Bar**

---

## 🛠️ Frontend Admin Panel - Pannello Controllo

### Informazioni Tecniche
- **Path**: `/srv/qofferun/frontend-admin-panel/`
- **Framework**: CoreUI React 5.5.0
- **Container**: `controllo-frontend` (Nginx Alpine)
- **Domain**: `controllo.qofferun.com`

### Stack Admin Panel
- **Template**: CoreUI Free React Admin Template
- **UI Library**: CoreUI Components
- **Icons**: CoreUI Icons
- **Charts**: Chart.js integration
- **Design**: Bootstrap-based responsive admin theme

### Funzionalità Admin Panel
- 👥 **Gestione Utenti** e permessi
- 🏢 **Gestione Bar** registrati
- 📈 **Analytics** e reportistica
- ⚙️ **Configurazioni Sistema**
- 🔧 **Tools Amministrativi**

---

## 🗄️ Database - PostgreSQL

### Informazioni Tecniche
- **Container**: `qoffe-run-db` (PostgreSQL 15)
- **Volume**: `pgdata:/var/lib/postgresql/data`
- **Network**: `internal` (isolata)

### Configurazione Database
```yaml
POSTGRES_DB: qoffe_run
POSTGRES_USER: qoffeuser  
POSTGRES_PASSWORD: qoffe2025
```

### Management Interface
- **pgAdmin 4**: Accessibile via `db.qofferun.com`
- **Container**: `qoffe-run-pgadmin`
- **Login**: admin@qofferun.com / change_me_now

---

## 🔀 Reverse Proxy - Traefik

### Configurazione Traefik v3.0
- **SSL**: Automatico con Let's Encrypt
- **Email**: admin@qofferun.com
- **Ports**: 80 (HTTP) → 443 (HTTPS redirect)
- **Networks**: `traefik` per routing esterno

### Route Mapping
```yaml
qofferun.com          → portal-frontend (Landing)
api.qofferun.com      → backend-web (Laravel API)  
bar.qofferun.com      → bar-frontend (Bar Panel)
controllo.qofferun.com → controllo-frontend (Admin)
db.qofferun.com       → pgadmin (Database Manager)
```

---

## 🚀 Deploy & Build Process

### Build Commands per Progetto
```bash
# Portal Landing
cd /srv/qofferun/frontend-portal
npm run build  # → output in ./build/

# Bar Panel  
cd /srv/qofferun/frontend-bar-panel
npm run build  # → output in ./build/

# Admin Panel
cd /srv/qofferun/frontend-admin-panel  
npm run build  # → output in ./build/
```

### Deploy Commands
```bash
# Riavvio completo sistema
cd /srv/qofferun
docker compose down
docker compose up -d

# Riavvio singolo servizio
docker compose restart portal-frontend
docker compose restart backend-web
```

---

## 🔧 File di Configurazione Chiave

### Docker Compose
- **File**: `docker-compose.yml`
- **Networks**: `traefik` (external), `internal` (database)
- **Volumes**: `pgdata` (database), `letsencrypt` (certificati SSL)

### Nginx SPA Configuration
- **File**: `nginx-spa.conf`
- **Purpose**: Configurazione per Single Page Applications
- **Features**: Fallback to index.html, gzip, security headers

### Vite Configurations
```javascript
// Ogni frontend ha vite.config.js con:
{
  plugins: [react()],
  server: { port: 5173, host: true },
  build: { outDir: 'build' }  // Output Docker-compatible
}
```

---

## 📋 Maintenance Tasks

### Backup Essentials
- **Database**: Volume `pgdata` 
- **Source Code**: Repository Git
- **SSL Certificates**: Volume `letsencrypt`
- **Uploads**: Backend `storage/` directory

### Monitoring
- **Logs**: `docker compose logs [service-name]`
- **Health**: `docker ps` status check
- **Database**: Via pgAdmin interface
- **SSL**: Automatic renewal via Traefik

---

## 🔒 Security Notes

### SSL/TLS
- **Certificati**: Let's Encrypt automatico
- **Redirect**: HTTP → HTTPS forzato
- **HSTS**: Headers di sicurezza via Nginx

### Network Isolation  
- **Database**: Rete `internal` isolata
- **API**: Accessibile solo via Traefik
- **Containers**: Comunicazione inter-container sicura

---

**Ultimo aggiornamento**: 2 Novembre 2025  
**Versione documentazione**: 1.0  
**Maintainer**: System Administrator QoffeRun