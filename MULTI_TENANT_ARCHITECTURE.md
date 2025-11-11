# 🏢 QoffeRun Multi-Tenant Architecture

## 📋 Panoramica Sistema

Sistema multi-tenant gerarchico per la gestione di catene di bar con filiali multiple, gestori dedicati e sistema di pagamenti flessibile.

### 🏗️ Struttura Gerarchica
```
Titolare (Chain Owner)
└── Catena/Azienda (Chain)
    ├── Filiale 1 (Branch)
    │   ├── Gestore A (Branch Manager)
    │   └── Gestore B (Branch Manager)
    ├── Filiale 2 (Branch) 
    │   └── Gestore A (Branch Manager) [stesso gestore, filiale diversa]
    └── Filiale 3 (Branch)
        └── Staff (dipendenti)
```

---

## 🗄️ DATABASE - Struttura Completa

### Nuove Tabelle

#### 1. Catene/Aziende
```sql
CREATE TABLE chains (
    id BIGINT PRIMARY KEY,
    owner_id BIGINT NOT NULL,               -- Riferimento al titolare (User con role='chain_owner')
    name VARCHAR(255) NOT NULL,             -- Nome catena (es. "Caffè Centrale")
    business_name VARCHAR(255),             -- Ragione sociale
    vat_number VARCHAR(50) UNIQUE,          -- Partita IVA
    tax_code VARCHAR(50),                   -- Codice fiscale
    legal_address TEXT,                     -- Sede legale
    billing_address TEXT,                   -- Indirizzo fatturazione
    phone VARCHAR(50),
    email VARCHAR(255),
    pec_email VARCHAR(255),                 -- Email PEC per fatturazione elettronica
    website VARCHAR(255),
    logo_path VARCHAR(500),
    
    -- Configurazione Pagamenti
    stripe_account_id VARCHAR(255),         -- Account Stripe Connect della catena
    payment_mode ENUM('unified', 'separate') DEFAULT 'unified',
    commission_rate DECIMAL(5,2) DEFAULT 15.00,
    
    -- Status e Metadata
    status ENUM('active', 'suspended', 'closed') DEFAULT 'active',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    total_branches INT DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_owner_id (owner_id),
    INDEX idx_vat_number (vat_number)
);
```

#### 2. Filiali
```sql
CREATE TABLE branches (
    id BIGINT PRIMARY KEY,
    chain_id BIGINT NOT NULL,              -- Riferimento alla catena
    code VARCHAR(50) NOT NULL,             -- Codice univoco filiale (es. "ROM001", "MIL001")
    name VARCHAR(255) NOT NULL,            -- Nome filiale
    
    -- Indirizzo e Localizzazione  
    address TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    province VARCHAR(5),
    cap VARCHAR(10),
    region VARCHAR(100),
    country VARCHAR(100) DEFAULT 'Italia',
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    
    -- Contatti
    phone VARCHAR(50),
    email VARCHAR(255),
    
    -- Configurazione Operativa
    opening_hours JSON,                    -- Orari di apertura strutturati
    delivery_enabled BOOLEAN DEFAULT TRUE,
    takeaway_enabled BOOLEAN DEFAULT TRUE,
    table_service_enabled BOOLEAN DEFAULT FALSE,
    
    -- Pagamenti e Fatturazione
    has_separate_billing BOOLEAN DEFAULT FALSE,
    stripe_account_id VARCHAR(255),        -- Account Stripe specifico (opzionale)
    pos_system VARCHAR(100),               -- Sistema POS utilizzato
    
    -- Capacità e Limiti
    max_daily_orders INT DEFAULT 1000,
    seating_capacity INT,
    staff_count INT DEFAULT 0,
    
    -- Status
    status ENUM('active', 'inactive', 'maintenance', 'temporarily_closed') DEFAULT 'active',
    opening_date DATE,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chain_code (chain_id, code),
    INDEX idx_chain_id (chain_id),
    INDEX idx_status_city (status, city)
);
```

#### 3. Gestori delle Filiali
```sql
CREATE TABLE branch_managers (
    id BIGINT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,               -- Riferimento al gestore (User con role='branch_manager')
    assigned_by BIGINT NOT NULL,           -- Chi ha assegnato (chain_owner o admin)
    
    -- Assegnazione e Status
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('active', 'suspended', 'removed') DEFAULT 'active',
    is_primary_manager BOOLEAN DEFAULT FALSE, -- Gestore principale della filiale
    
    -- Permessi e Configurazione
    permissions JSON,                      -- Permessi specifici per questa filiale
    max_discount_percentage DECIMAL(5,2) DEFAULT 10.00,
    can_access_reports BOOLEAN DEFAULT TRUE,
    can_manage_staff BOOLEAN DEFAULT FALSE,
    can_modify_menu BOOLEAN DEFAULT FALSE,
    
    -- Orari di Lavoro
    work_schedule JSON,                    -- Programma turni del gestore
    hourly_rate DECIMAL(8,2),             -- Tariffa oraria (opzionale)
    
    -- Note e Metadata
    notes TEXT,                           -- Note private del titolare
    last_activity_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    UNIQUE KEY unique_active_assignment (branch_id, user_id, status),
    INDEX idx_user_id (user_id),
    INDEX idx_assigned_by (assigned_by)
);
```

#### 4. Permessi Personalizzati per Catena
```sql
CREATE TABLE chain_permissions (
    id BIGINT PRIMARY KEY,
    chain_id BIGINT NOT NULL,
    code VARCHAR(100) NOT NULL,            -- es. 'manage_orders', 'view_reports', 'manage_menu'
    name VARCHAR(255) NOT NULL,            -- Nome visualizzabile
    description TEXT,                      -- Descrizione dettagliata
    category VARCHAR(100) NOT NULL,        -- 'orders', 'menu', 'reports', 'settings', 'staff'
    
    -- Configurazione
    is_default BOOLEAN DEFAULT FALSE,      -- Permesso di default per nuovi gestori
    requires_approval BOOLEAN DEFAULT FALSE, -- Richiede approvazione del titolare
    risk_level ENUM('low', 'medium', 'high') DEFAULT 'low',
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chain_permission (chain_id, code),
    INDEX idx_category (category)
);
```

#### 5. Transazioni per Filiale
```sql
CREATE TABLE branch_transactions (
    id BIGINT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    chain_id BIGINT NOT NULL,              -- Denormalizzato per performance
    order_id BIGINT,                       -- Riferimento all'ordine (può essere NULL per altre transazioni)
    
    -- Importi
    gross_amount DECIMAL(10,2) NOT NULL,   -- Importo lordo
    commission_rate DECIMAL(5,2) NOT NULL, -- Tasso commissione applicato
    commission_amount DECIMAL(10,2) NOT NULL, -- Commissione QoffeRun
    net_amount DECIMAL(10,2) NOT NULL,     -- Importo netto alla filiale
    tax_amount DECIMAL(10,2) DEFAULT 0,    -- IVA
    
    -- Payment Gateway
    stripe_payment_intent_id VARCHAR(255),
    stripe_account_id VARCHAR(255),        -- Account che ha ricevuto il pagamento
    payment_method VARCHAR(50),            -- 'card', 'cash', 'digital_wallet'
    
    -- Status e Timing
    status ENUM('pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded') DEFAULT 'pending',
    processed_at TIMESTAMP NULL,
    settled_at TIMESTAMP NULL,             -- Quando i fondi sono stati trasferiti
    
    -- Metadata
    transaction_type ENUM('sale', 'refund', 'adjustment', 'commission') DEFAULT 'sale',
    reference_number VARCHAR(100),         -- Numero di riferimento interno
    notes TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE CASCADE,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_branch_date (branch_id, created_at),
    INDEX idx_chain_date (chain_id, created_at),
    INDEX idx_status (status)
);
```

### Modifiche Tabelle Esistenti

#### Users - Aggiunta Supporto Multi-Tenant
```sql
ALTER TABLE users 
ADD COLUMN chain_id BIGINT DEFAULT NULL,
ADD COLUMN employee_code VARCHAR(50) DEFAULT NULL,
ADD COLUMN hire_date DATE DEFAULT NULL,
ADD COLUMN termination_date DATE DEFAULT NULL,
ADD COLUMN emergency_contact JSON DEFAULT NULL,
ADD COLUMN work_preferences JSON DEFAULT NULL,
ADD CONSTRAINT fk_users_chain FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE SET NULL;

-- Aggiornare enum ruoli
ALTER TABLE users MODIFY COLUMN role ENUM(
    'chain_owner',     -- Titolare catena (può avere più catene)
    'branch_manager',  -- Gestore filiale (può gestire più filiali)
    'staff',          -- Dipendente (lavora in una o più filiali)
    'customer',       -- Cliente finale
    'admin'           -- Amministratore sistema QoffeRun
) NOT NULL DEFAULT 'customer';
```

#### Bars - Collegamento alle Filiali
```sql
ALTER TABLE bars 
ADD COLUMN branch_id BIGINT DEFAULT NULL,
ADD COLUMN chain_id BIGINT DEFAULT NULL,
ADD COLUMN is_primary_location BOOLEAN DEFAULT TRUE,
ADD CONSTRAINT fk_bars_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_bars_chain FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE SET NULL;
```

#### Orders - Tracciamento Multi-Filiale
```sql
ALTER TABLE orders 
ADD COLUMN branch_id BIGINT DEFAULT NULL,
ADD COLUMN chain_id BIGINT DEFAULT NULL,
ADD COLUMN served_by_manager BIGINT DEFAULT NULL, -- Quale gestore ha servito
ADD COLUMN branch_code VARCHAR(50) DEFAULT NULL,  -- Codice filiale per report
ADD CONSTRAINT fk_orders_branch FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_orders_chain FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE SET NULL,
ADD CONSTRAINT fk_orders_manager FOREIGN KEY (served_by_manager) REFERENCES users(id) ON DELETE SET NULL;
```

### Impostazioni Multi-Livello

#### Chain Settings
```sql
CREATE TABLE chain_settings (
    id BIGINT PRIMARY KEY,
    chain_id BIGINT NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    category VARCHAR(100) NOT NULL,        -- 'general', 'payments', 'branding', 'operations'
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    is_inheritable BOOLEAN DEFAULT TRUE,   -- Se può essere ereditato dalle filiali
    requires_restart BOOLEAN DEFAULT FALSE, -- Se richiede riavvio per applicare
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (chain_id) REFERENCES chains(id) ON DELETE CASCADE,
    UNIQUE KEY unique_chain_setting (chain_id, key),
    INDEX idx_category (category)
);
```

#### Branch Settings
```sql
CREATE TABLE branch_settings (
    id BIGINT PRIMARY KEY,
    branch_id BIGINT NOT NULL,
    key VARCHAR(255) NOT NULL,
    value TEXT,
    category VARCHAR(100) NOT NULL,
    data_type ENUM('string', 'number', 'boolean', 'json') DEFAULT 'string',
    inherits_from_chain BOOLEAN DEFAULT TRUE, -- Se eredita dalla catena
    override_chain_value BOOLEAN DEFAULT FALSE, -- Se sovrascrive il valore della catena
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (branch_id) REFERENCES branches(id) ON DELETE CASCADE,
    UNIQUE KEY unique_branch_setting (branch_id, key),
    INDEX idx_inherits (inherits_from_chain)
);
```

---

## 🔧 BACKEND API - Controller e Endpoint

### Nuovi Controller

#### 1. ChainController
**Gestione completa delle catene**
```php
namespace App\Http\Controllers\Api;

class ChainController extends Controller
{
    // CRUD Catene
    public function index()         // Lista catene del titolare
    public function store()         // Crea nuova catena
    public function show($id)       // Dettagli catena
    public function update($id)     // Aggiorna catena
    public function destroy($id)    // Elimina catena
    
    // Operazioni Avanzate
    public function dashboard($id)  // Dashboard catena con KPI
    public function analytics($id)  // Analytics aggregati
    public function duplicate($id)  // Duplica configurazione catena
}
```

#### 2. BranchController  
**Gestione filiali**
```php
class BranchController extends Controller
{
    // CRUD Filiali
    public function index($chainId)      // Lista filiali della catena
    public function store($chainId)      // Crea nuova filiale
    public function show($id)            // Dettagli filiale
    public function update($id)          // Aggiorna filiale
    public function destroy($id)         // Elimina filiale
    
    // Operazioni Specifiche
    public function clone($id)           // Clona filiale
    public function bulkUpdate()         // Aggiornamento bulk
    public function nearby($lat, $lng)   // Filiali nelle vicinanze
    public function performance($id)     // Performance filiale
}
```

#### 3. ChainManagerController
**Gestione gestori e permessi**
```php
class ChainManagerController extends Controller
{
    // Gestione Gestori
    public function listManagers($chainId)        // Lista gestori catena
    public function assignManager()               // Assegna gestore a filiale
    public function updatePermissions($managerId) // Modifica permessi gestore
    public function removeManager($managerId)     // Rimuovi gestore
    public function suspendManager($managerId)    // Sospendi gestore
    
    // Gestione Permessi
    public function availablePermissions($chainId) // Permessi disponibili
    public function createPermission($chainId)     // Crea permesso personalizzato
    public function permissionMatrix($chainId)     // Matrice permessi completa
}
```

#### 4. ChainPaymentController
**Sistema pagamenti multi-filiale**
```php
class ChainPaymentController extends Controller
{
    // Setup Pagamenti
    public function setupStripeConnect($chainId)  // Setup Stripe Connect
    public function configureBranchPayments($branchId) // Config pagamenti filiale
    
    // Transazioni
    public function transactions($chainId)        // Transazioni aggregate
    public function branchTransactions($branchId) // Transazioni filiale specifica
    public function reconciliation($chainId)      // Riconciliazione pagamenti
    
    // Payout e Split
    public function schedulePayout($chainId)      // Programma payout
    public function splitPayments($chainId)       // Configurazione split
}
```

#### 5. ChainReportController
**Report e Analytics**
```php
class ChainReportController extends Controller
{
    // Report Finanziari
    public function financialSummary($chainId)    // Riepilogo finanziario
    public function revenueByBranch($chainId)     // Fatturato per filiale
    public function profitLoss($chainId)          // Profit & Loss
    
    // Report Operativi
    public function operationalKPIs($chainId)     // KPI operativi
    public function staffPerformance($chainId)    // Performance staff
    public function customerAnalytics($chainId)   // Analytics clienti
    
    // Export
    public function exportData($chainId)          // Export dati per contabilità
}
```

#### 6. ChainSettingsController
**Impostazioni multi-livello**
```php
class ChainSettingsController extends Controller
{
    // Chain Settings
    public function getChainSettings($chainId)    // Impostazioni catena
    public function updateChainSettings($chainId) // Aggiorna impostazioni catena
    
    // Branch Settings
    public function getBranchSettings($branchId)  // Impostazioni filiale
    public function updateBranchSettings($branchId) // Aggiorna impostazioni filiale
    public function inheritFromChain($branchId)   // Eredita da catena
    
    // Bulk Operations
    public function applyToAllBranches($chainId)  // Applica a tutte le filiali
    public function resetToDefaults($chainId)     // Reset a valori default
}
```

### Endpoint API Completi

```http
# ============================================
# GESTIONE CATENE
# ============================================

GET    /api/v1/chains                           # Lista catene del titolare
POST   /api/v1/chains                           # Crea nuova catena
GET    /api/v1/chains/{id}                      # Dettagli catena
PUT    /api/v1/chains/{id}                      # Aggiorna catena
DELETE /api/v1/chains/{id}                      # Elimina catena
GET    /api/v1/chains/{id}/dashboard            # Dashboard catena
GET    /api/v1/chains/{id}/analytics            # Analytics catena
POST   /api/v1/chains/{id}/duplicate            # Duplica catena

# ============================================
# GESTIONE FILIALI
# ============================================

GET    /api/v1/chains/{id}/branches             # Lista filiali della catena
POST   /api/v1/chains/{id}/branches             # Crea nuova filiale
GET    /api/v1/branches/{id}                    # Dettagli filiale
PUT    /api/v1/branches/{id}                    # Aggiorna filiale
DELETE /api/v1/branches/{id}                    # Elimina filiale
POST   /api/v1/branches/{id}/clone              # Clona filiale
PUT    /api/v1/branches/bulk-update             # Aggiornamento bulk filiali
GET    /api/v1/branches/nearby                  # Filiali nelle vicinanze
GET    /api/v1/branches/{id}/performance        # Performance filiale

# ============================================
# GESTIONE GESTORI E PERMESSI
# ============================================

GET    /api/v1/chains/{id}/managers             # Lista gestori catena
POST   /api/v1/branches/{id}/managers           # Assegna gestore a filiale
GET    /api/v1/branch-managers/{id}             # Dettagli assegnazione
PUT    /api/v1/branch-managers/{id}             # Modifica permessi gestore
DELETE /api/v1/branch-managers/{id}             # Rimuovi gestore da filiale
PUT    /api/v1/branch-managers/{id}/suspend     # Sospendi gestore
PUT    /api/v1/branch-managers/{id}/reactivate  # Riattiva gestore

# Gestione Permessi
GET    /api/v1/chains/{id}/permissions          # Lista permessi disponibili
POST   /api/v1/chains/{id}/permissions          # Crea permesso personalizzato
GET    /api/v1/chains/{id}/permission-matrix    # Matrice permessi completa
PUT    /api/v1/branch-managers/{id}/permissions # Assegna permessi specifici

# ============================================
# SISTEMA PAGAMENTI
# ============================================

# Setup e Configurazione
POST   /api/v1/chains/{id}/stripe-setup         # Setup Stripe Connect
PUT    /api/v1/chains/{id}/payment-config       # Configurazione pagamenti catena
PUT    /api/v1/branches/{id}/payment-config     # Configurazione pagamenti filiale

# Transazioni e Movimenti
GET    /api/v1/chains/{id}/transactions         # Transazioni aggregate catena
GET    /api/v1/branches/{id}/transactions       # Transazioni filiale specifica  
GET    /api/v1/chains/{id}/reconciliation       # Riconciliazione pagamenti
POST   /api/v1/chains/{id}/manual-payout        # Payout manuale

# Configurazione Split
GET    /api/v1/chains/{id}/split-config         # Configurazione split payments
PUT    /api/v1/chains/{id}/split-config         # Aggiorna split config
GET    /api/v1/branches/{id}/commission-rates   # Tassi commissione per filiale

# ============================================
# REPORT E ANALYTICS
# ============================================

# Report Finanziari
GET    /api/v1/chains/{id}/financial-summary    # Riepilogo finanziario
GET    /api/v1/chains/{id}/revenue-by-branch    # Fatturato per filiale
GET    /api/v1/chains/{id}/profit-loss          # Profit & Loss
GET    /api/v1/chains/{id}/tax-report           # Report fiscale

# Report Operativi  
GET    /api/v1/chains/{id}/operational-kpis     # KPI operativi
GET    /api/v1/chains/{id}/staff-performance    # Performance staff
GET    /api/v1/chains/{id}/customer-analytics   # Analytics clienti
GET    /api/v1/chains/{id}/inventory-report     # Report inventario

# Export e Integrazione
POST   /api/v1/chains/{id}/export-accounting    # Export per contabilità
GET    /api/v1/chains/{id}/export-payroll       # Export per paghe
POST   /api/v1/chains/{id}/sync-external        # Sync con sistemi esterni

# ============================================
# IMPOSTAZIONI MULTI-LIVELLO
# ============================================

# Impostazioni Catena
GET    /api/v1/chains/{id}/settings             # Impostazioni catena
PUT    /api/v1/chains/{id}/settings             # Aggiorna impostazioni catena
POST   /api/v1/chains/{id}/settings/batch       # Batch update impostazioni

# Impostazioni Filiale
GET    /api/v1/branches/{id}/settings           # Impostazioni filiale
PUT    /api/v1/branches/{id}/settings           # Aggiorna impostazioni filiale
POST   /api/v1/branches/{id}/inherit-settings   # Eredita da catena
POST   /api/v1/branches/{id}/reset-settings     # Reset a default

# Operazioni Bulk
POST   /api/v1/chains/{id}/apply-to-all-branches # Applica a tutte le filiali
POST   /api/v1/chains/{id}/reset-all-settings   # Reset tutte le impostazioni

# ============================================
# DASHBOARD E NOTIFICHE
# ============================================

GET    /api/v1/chains/{id}/dashboard            # Dashboard principale
GET    /api/v1/chains/{id}/notifications        # Notifiche catena
GET    /api/v1/branches/{id}/dashboard          # Dashboard filiale
POST   /api/v1/chains/{id}/alerts               # Configura alert automatici
```

---

## 💻 FRONTEND - Nuove Interfacce

### Nuovo Panel: Chain Owner Dashboard

#### URL e Struttura
- **Dominio Principale**: `owner.qofferun.com` o `catena.qofferun.com`
- **Struttura**: Single Page Application (SPA) con React
- **Autenticazione**: Sistema separato per titolari di catena

### Architettura Frontend

```
frontend-chain-owner/
├── public/
├── src/
│   ├── components/          # Componenti riutilizzabili
│   │   ├── common/         # Componenti comuni
│   │   ├── charts/         # Grafici e visualizzazioni
│   │   ├── forms/          # Form specializzati
│   │   └── layout/         # Layout e navigazione
│   ├── pages/              # Pagine principali
│   │   ├── dashboard/      # Dashboard e overview
│   │   ├── chains/         # Gestione catene
│   │   ├── branches/       # Gestione filiali
│   │   ├── managers/       # Gestione personale
│   │   ├── reports/        # Report e analytics
│   │   ├── payments/       # Gestione pagamenti
│   │   └── settings/       # Impostazioni
│   ├── services/           # API services
│   ├── hooks/              # Custom React hooks
│   ├── utils/              # Utility functions
│   └── store/              # State management
├── package.json
└── vite.config.js
```

### Pagine Principali

#### 1. Dashboard e Overview
```jsx
// pages/dashboard/
├── MainDashboard.jsx          // Dashboard principale con KPI aggregati
├── ChainOverview.jsx          // Panoramica singola catena
├── BranchComparison.jsx       // Confronto performance filiali
└── RealTimeMonitor.jsx        // Monitoraggio in tempo reale
```

#### 2. Gestione Catene
```jsx  
// pages/chains/
├── ChainList.jsx              // Lista catene del titolare
├── ChainDetails.jsx           // Dettagli e configurazione catena
├── ChainForm.jsx              // Form creazione/modifica catena
├── ChainDuplication.jsx       // Duplicazione catena esistente
└── ChainArchive.jsx           // Archivio catene chiuse
```

#### 3. Gestione Filiali
```jsx
// pages/branches/
├── BranchList.jsx             // Lista filiali della catena
├── BranchDetails.jsx          // Dettagli filiale specifica
├── BranchForm.jsx             // Form creazione/modifica filiale
├── BranchMap.jsx              // Mappa con tutte le filiali
├── BranchComparison.jsx       // Confronto performance tra filiali
└── BranchCloning.jsx          // Clonazione configurazioni
```

#### 4. Gestione Personale
```jsx
// pages/managers/
├── ManagerList.jsx            // Lista gestori della catena
├── ManagerAssignment.jsx      // Assegnazione gestori a filiali
├── PermissionMatrix.jsx       // Matrice permessi completa
├── ManagerPerformance.jsx     // Valutazione performance gestori
├── StaffScheduling.jsx        // Programmazione turni
└── PayrollManagement.jsx      // Gestione buste paga
```

#### 5. Report e Analytics
```jsx
// pages/reports/
├── FinancialReports.jsx       // Report finanziari
├── OperationalReports.jsx     // Report operativi
├── CustomerAnalytics.jsx      // Analisi comportamento clienti
├── InventoryReports.jsx       // Report inventario
├── CustomReports.jsx          // Report personalizzabili
└── ExportCenter.jsx           // Centro esportazione dati
```

#### 6. Gestione Pagamenti
```jsx
// pages/payments/
├── PaymentOverview.jsx        // Overview pagamenti
├── StripeConfiguration.jsx    // Configurazione Stripe Connect
├── TransactionHistory.jsx     // Storico transazioni
├── PayoutScheduling.jsx       // Programmazione pagamenti
├── CommissionSettings.jsx     // Impostazioni commissioni
└── TaxReporting.jsx           // Reportistica fiscale
```

#### 7. Impostazioni
```jsx
// pages/settings/
├── ChainSettings.jsx          // Impostazioni catena
├── BranchSettings.jsx         // Impostazioni filiali
├── UserManagement.jsx         // Gestione utenti e ruoli
├── IntegrationSettings.jsx    // Integrazioni esterne
├── NotificationSettings.jsx   // Impostazioni notifiche
└── SecuritySettings.jsx       // Impostazioni sicurezza
```

### Componenti Specializzati

#### Charts e Visualizzazioni
```jsx
// components/charts/
├── RevenueChart.jsx           // Grafico fatturato
├── BranchPerformanceChart.jsx // Performance filiali
├── CustomerFlowChart.jsx      // Flusso clienti
├── HeatmapComponent.jsx       // Heatmap geografica
├── KPIWidget.jsx              // Widget KPI riutilizzabile
└── RealTimeChart.jsx          // Grafici tempo reale
```

#### Form Specializzati  
```jsx
// components/forms/
├── ChainRegistrationForm.jsx  // Form registrazione catena
├── BranchSetupForm.jsx        // Setup nuova filiale
├── ManagerAssignmentForm.jsx  // Assegnazione gestore
├── PermissionForm.jsx         // Gestione permessi
├── PaymentConfigForm.jsx      // Configurazione pagamenti
└── BulkUpdateForm.jsx         // Form aggiornamenti bulk
```

#### Layout e Navigazione
```jsx
// components/layout/
├── ChainOwnerLayout.jsx       // Layout principale
├── Sidebar.jsx                // Sidebar navigazione
├── TopNavbar.jsx              // Navbar superiore
├── ChainSelector.jsx          // Selettore catena attiva
├── BranchSelector.jsx         // Selettore filiale
├── NotificationCenter.jsx     // Centro notifiche
└── UserProfileMenu.jsx        // Menu profilo utente
```

### Modifiche Panel Esistenti

#### Admin Panel (controllo.qofferun.com)
```jsx
// Nuove pagine per admin sistema
├── ChainManagement.jsx        // Gestione tutte le catene (admin)
├── ChainAnalytics.jsx         // Analytics aggregate sistema
├── ChainApprovals.jsx         // Approvazioni nuove catene
└── SystemReports.jsx          // Report sistema globale
```

#### Bar Panel (bar.qofferun.com)
```jsx
// Modifiche per supporto multi-filiale
├── BranchSelector.jsx         // Selettore filiale (se gestore multi-filiale)
├── BranchDashboard.jsx        // Dashboard specifica filiale
├── ManagerProfile.jsx         // Profilo gestore con permessi
├── MultiLocationOrders.jsx    // Gestione ordini multi-location
└── LocationSwitcher.jsx       // Switch rapido tra filiali
```

---

## 🔐 SISTEMA AUTENTICAZIONE E PERMESSI

### Nuova Struttura Ruoli

```php
enum UserRole: string {
    case CHAIN_OWNER = 'chain_owner';      // Titolare catena (può possedere più catene)
    case BRANCH_MANAGER = 'branch_manager'; // Gestore filiale (può gestire più filiali)
    case STAFF = 'staff';                  // Dipendente (lavora in filiali specifiche)
    case CUSTOMER = 'customer';            // Cliente finale
    case ADMIN = 'admin';                  // Admin sistema QoffeRun
}
```

### Sistema Permessi Granulare

#### Categorie Permessi
```php
$permissionCategories = [
    'orders' => [
        'view_orders',           // Visualizzare ordini
        'create_orders',         // Creare ordini
        'modify_orders',         // Modificare ordini
        'cancel_orders',         // Cancellare ordini
        'refund_orders',         // Rimborsare ordini
        'export_orders'          // Esportare ordini
    ],
    
    'menu' => [
        'view_menu',             // Visualizzare menu
        'create_items',          // Creare prodotti
        'modify_items',          // Modificare prodotti
        'delete_items',          // Eliminare prodotti
        'manage_categories',     // Gestire categorie
        'set_prices',            // Impostare prezzi
        'manage_availability'    // Gestire disponibilità
    ],
    
    'reports' => [
        'view_daily_reports',    // Report giornalieri
        'view_weekly_reports',   // Report settimanali
        'view_monthly_reports',  // Report mensili
        'view_financial_data',   // Dati finanziari
        'export_reports',        // Esportare report
        'create_custom_reports'  // Report personalizzati
    ],
    
    'settings' => [
        'view_settings',         // Visualizzare impostazioni
        'modify_basic_settings', // Modifiche base
        'modify_advanced_settings', // Modifiche avanzate
        'manage_integrations',   // Gestire integrazioni
        'configure_payments'     // Configurare pagamenti
    ],
    
    'staff' => [
        'view_staff',            // Visualizzare staff
        'create_staff_accounts', // Creare account staff
        'modify_staff_data',     // Modificare dati staff
        'assign_roles',          // Assegnare ruoli
        'manage_schedules',      // Gestire orari
        'access_payroll'         // Accesso buste paga
    ],
    
    'customers' => [
        'view_customer_data',    // Visualizzare dati clienti
        'modify_customer_data',  // Modificare dati clienti
        'view_customer_analytics', // Analytics clienti
        'manage_loyalty_programs', // Gestire programmi fedeltà
        'send_communications'    // Inviare comunicazioni
    ],
    
    'inventory' => [
        'view_inventory',        // Visualizzare inventario
        'manage_stock',          // Gestire scorte
        'create_suppliers',      // Creare fornitori
        'manage_orders_supply',  // Gestire ordini fornitura
        'set_reorder_levels'     // Impostare livelli riordino
    ],
    
    'payments' => [
        'view_transactions',     // Visualizzare transazioni
        'process_payments',      // Processare pagamenti
        'issue_refunds',         // Emettere rimborsi
        'configure_payment_methods', // Configurare metodi pagamento
        'access_financial_reports'   // Accedere report finanziari
    ]
];
```

#### Livelli Permessi
```php
enum PermissionLevel: string {
    case NONE = 'none';           // Nessun accesso
    case READ = 'read';           // Solo lettura
    case WRITE = 'write';         // Lettura e scrittura
    case ADMIN = 'admin';         // Controllo completo
    case OWNER = 'owner';         // Proprietario (tutti i permessi)
}
```

### Middleware di Autorizzazione

```php
// Middleware per controllo permessi specifici
class CheckChainPermission
{
    public function handle($request, Closure $next, $permission, $chainId = null)
    {
        $user = $request->user();
        
        // Admin sistema: accesso completo
        if ($user->role === 'admin') {
            return $next($request);
        }
        
        // Chain Owner: accesso alle proprie catene
        if ($user->role === 'chain_owner') {
            $chain = Chain::find($chainId);
            if ($chain && $chain->owner_id === $user->id) {
                return $next($request);
            }
        }
        
        // Branch Manager: controllo permessi specifici
        if ($user->role === 'branch_manager') {
            $hasPermission = BranchManager::where('user_id', $user->id)
                ->whereHas('branch', function($query) use ($chainId) {
                    $query->where('chain_id', $chainId);
                })
                ->where('status', 'active')
                ->whereJsonContains('permissions', $permission)
                ->exists();
                
            if ($hasPermission) {
                return $next($request);
            }
        }
        
        abort(403, 'Accesso negato: permesso insufficiente');
    }
}
```

---

## 💳 SISTEMA PAGAMENTI MULTI-FILIALE

### Architettura Pagamenti

#### Opzione A: Account Stripe Separati (Consigliata)
```php
// Ogni catena ha il proprio Stripe Connect Account
$chain = Chain::find(1);
$chain->stripe_account_id = "acct_1234567890";

// Filiali possono avere account separati per fatturazione locale
$branch = Branch::find(1);
$branch->stripe_account_id = "acct_0987654321"; // Opzionale
$branch->has_separate_billing = true;
```

#### Opzione B: Account Unico con Split Payment
```php
// Un solo account Stripe principale con split automatico
$paymentIntent = \Stripe\PaymentIntent::create([
    'amount' => 2000, // €20.00
    'currency' => 'eur',
    'transfer_data' => [
        'destination' => $chain->stripe_account_id,
        'amount' => 1700, // €17.00 alla catena (85%)
    ],
    'application_fee_amount' => 300, // €3.00 commissione QoffeRun (15%)
    'metadata' => [
        'chain_id' => $chain->id,
        'branch_id' => $branch->id,
        'order_id' => $order->id
    ]
]);
```

### Configurazione Commissioni

```php
class CommissionCalculator
{
    public static function calculate($amount, $chainId, $branchId)
    {
        $chain = Chain::find($chainId);
        $branch = Branch::find($branchId);
        
        // Tasso commissione base della catena
        $baseRate = $chain->commission_rate ?? 15.00;
        
        // Eventuali sconti per volume
        $volumeDiscount = self::calculateVolumeDiscount($chain);
        
        // Commissione specifica filiale (se configurata)
        $branchRate = $branch->commission_rate ?? $baseRate;
        
        $finalRate = max(5.00, $branchRate - $volumeDiscount); // Min 5%
        $commissionAmount = ($amount * $finalRate) / 100;
        
        return [
            'gross_amount' => $amount,
            'commission_rate' => $finalRate,
            'commission_amount' => $commissionAmount,
            'net_amount' => $amount - $commissionAmount
        ];
    }
    
    private static function calculateVolumeDiscount($chain)
    {
        $monthlyRevenue = $chain->getMonthlyRevenue();
        
        if ($monthlyRevenue > 100000) return 3.0;      // Sconto 3% oltre €100k/mese
        if ($monthlyRevenue > 50000) return 2.0;       // Sconto 2% oltre €50k/mese  
        if ($monthlyRevenue > 25000) return 1.0;       // Sconto 1% oltre €25k/mese
        
        return 0;
    }
}
```

### Gestione Payout

```php
class PayoutService
{
    public function schedulePayout($chainId, $frequency = 'weekly')
    {
        $chain = Chain::find($chainId);
        
        // Calcola totale da trasferire
        $pendingTransactions = BranchTransaction::where('chain_id', $chainId)
            ->where('status', 'completed')
            ->whereNull('payout_id')
            ->sum('net_amount');
            
        if ($pendingTransactions < $chain->minimum_payout_amount) {
            return false; // Non raggiunta soglia minima
        }
        
        // Crea payout Stripe
        $payout = \Stripe\Payout::create([
            'amount' => $pendingTransactions * 100, // Stripe usa centesimi
            'currency' => 'eur',
            'description' => "Payout settimanale catena {$chain->name}",
            'metadata' => [
                'chain_id' => $chainId,
                'payout_type' => $frequency
            ]
        ], ['stripe_account' => $chain->stripe_account_id]);
        
        // Marca transazioni come pagate
        BranchTransaction::where('chain_id', $chainId)
            ->where('status', 'completed')
            ->whereNull('payout_id')
            ->update(['payout_id' => $payout->id]);
            
        return $payout;
    }
}
```

---

## 📊 RIEPILOGO MODIFICHE COMPLETE

### Database
| **Tipo** | **Elemento** | **Azione** | **Complessità** |
|----------|--------------|------------|-----------------|
| Tabelle | chains | Nuova | 🔴 Alta |
| Tabelle | branches | Nuova | 🔴 Alta |
| Tabelle | branch_managers | Nuova | 🟡 Media |
| Tabelle | chain_permissions | Nuova | 🟡 Media |
| Tabelle | branch_transactions | Nuova | 🔴 Alta |
| Tabelle | chain_settings | Nuova | 🟡 Media |
| Tabelle | branch_settings | Nuova | 🟡 Media |
| Tabelle | users | Modificata | 🟡 Media |
| Tabelle | bars | Modificata | 🟠 Bassa |
| Tabelle | orders | Modificata | 🟡 Media |

### Backend API
| **Tipo** | **Elemento** | **Azione** | **Endpoint** |
|----------|--------------|------------|--------------|
| Controller | ChainController | Nuovo | 8 endpoint |
| Controller | BranchController | Nuovo | 9 endpoint |
| Controller | ChainManagerController | Nuovo | 7 endpoint |
| Controller | ChainPaymentController | Nuovo | 8 endpoint |
| Controller | ChainReportController | Nuovo | 10 endpoint |
| Controller | ChainSettingsController | Nuovo | 8 endpoint |
| Middleware | CheckChainPermission | Nuovo | - |
| Services | CommissionCalculator | Nuovo | - |
| Services | PayoutService | Nuovo | - |

### Frontend
| **Tipo** | **Elemento** | **Azione** | **Complessità** |
|----------|--------------|------------|-----------------|
| Panel | Chain Owner Dashboard | Nuovo | 🔴 Alta |
| Pagine | Dashboard e Overview | 4 nuove | 🟡 Media |
| Pagine | Gestione Catene | 5 nuove | 🟡 Media |
| Pagine | Gestione Filiali | 6 nuove | 🟡 Media |
| Pagine | Gestione Personale | 6 nuove | 🔴 Alta |
| Pagine | Report e Analytics | 6 nuove | 🔴 Alta |
| Pagine | Gestione Pagamenti | 6 nuove | 🟡 Media |
| Pagine | Impostazioni | 6 nuove | 🟡 Media |
| Componenti | Charts e Visualizzazioni | 6 nuovi | 🟡 Media |
| Componenti | Form Specializzati | 6 nuovi | 🟡 Media |
| Componenti | Layout e Navigazione | 7 nuovi | 🟡 Media |

### Sistema Autenticazione
| **Elemento** | **Azione** | **Complessità** |
|--------------|------------|-----------------|
| Ruoli Utente | 3 nuovi ruoli | 🟡 Media |
| Sistema Permessi | Completo rewrite | 🔴 Alta |
| Middleware Auth | 2 nuovi middleware | 🟡 Media |
| Multi-tenant Logic | Nuovo sistema | 🔴 Alta |

### Sistema Pagamenti
| **Elemento** | **Azione** | **Complessità** |
|--------------|------------|-----------------|
| Stripe Connect | Integrazione completa | 🔴 Alta |
| Split Payments | Nuovo sistema | 🔴 Alta |
| Commission Engine | Nuovo calcolo | 🟡 Media |
| Payout Automation | Nuovo sistema | 🟡 Media |

---

## 🎯 FASI IMPLEMENTAZIONE CONSIGLIATE

### Fase 1: Fondamenta Database
- ✅ Creazione tabelle base (chains, branches, branch_managers)
- ✅ Migrazione dati esistenti
- ✅ Setup relazioni foreign key

### Fase 2: Backend API Core
- ✅ ChainController e BranchController base
- ✅ Sistema autenticazione multi-tenant
- ✅ Middleware permessi base

### Fase 3: Frontend Chain Owner Panel
- ✅ Struttura base applicazione
- ✅ Autenticazione e routing
- ✅ Dashboard principale

### Fase 4: Gestione Complessa
- ✅ ChainManagerController e permessi granulari
- ✅ Sistema report e analytics
- ✅ Interface gestione avanzate

### Fase 5: Sistema Pagamenti
- ✅ Integrazione Stripe Connect
- ✅ Split payments e commissioni
- ✅ Automation payout

### Fase 6: Ottimizzazioni e Test
- ✅ Performance optimization
- ✅ Testing completo sistema
- ✅ Documentation finale

---

## 🔧 CONSIDERAZIONI TECNICHE

### Performance e Scalabilità
- **Database Indexing**: Index ottimizzati per query multi-tenant
- **Caching Strategy**: Cache separata per catena/filiale
- **API Rate Limiting**: Rate limit per catena
- **Background Jobs**: Processing asincrono per operazioni pesanti

### Sicurezza
- **Data Isolation**: Isolamento completo dati tra catene
- **Permission Inheritance**: Sistema ereditarietà permessi
- **Audit Logging**: Log completo tutte le operazioni
- **GDPR Compliance**: Gestione privacy multi-tenant

### Integrazione
- **Webhook System**: Notifiche real-time tra catene
- **API Versioning**: Supporto versioni API multiple
- **External Systems**: Integrazione POS e sistemi contabilità
- **Mobile Apps**: SDK per app mobile dedicate

Questo sistema fornisce una base solida per la gestione di catene multi-filiale con massima flessibilità e controllo granulare dei permessi.