<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BaristaController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\SystemSettingsController;
use App\Http\Controllers\Api\BarSettingsController;
use App\Http\Controllers\Api\ChainController;
use App\Http\Controllers\Api\BranchController;
use App\Http\Controllers\Api\BranchManagerController;
use App\Http\Controllers\Api\StaffController;
use App\Http\Controllers\Bar\BarAuthController;
use App\Http\Controllers\Admin\AdminAuthController;
use App\Http\Controllers\SystemSettingController;
use App\Http\Controllers\SystemLogoController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ChainImageGenericController;

// Public Routes
Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Chain Owner Registration (public endpoint)
    Route::post('/auth/register-chain-owner', [AuthController::class, 'registerChainOwner']);
    
    // Public System Settings
    Route::get('/settings/public', [SystemSettingsController::class, 'publicSettings']);
    Route::get('/settings/public/google_maps', [SystemSettingsController::class, 'googleMapsConfig']);
    
    // System Settings (public access for logo)
    Route::get('/system-settings/{key}', [SystemSettingController::class, 'show']);
    Route::get('/system-settings', [SystemSettingController::class, 'index']);
    
    // System Logo Management - GET is public, POST requires admin
    Route::get('/system/logo', [SystemLogoController::class, 'getCurrentLogo']);
});

// Protected Routes
Route::middleware('auth:sanctum')->prefix('v1')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    // 👤 Customer ( QUESTO è L'ACCESSO PER LE APP )
    Route::middleware('role.customer')->group(function () {
        Route::get('/bars', [CustomerController::class, 'bars']);
        Route::get('/orders', [CustomerController::class, 'myOrders']);
    });

    // ☕ Barista ( Gestione dei bar )
    Route::middleware('role.barista')->group(function () {
        Route::post('/bar/register', [BaristaController::class, 'registerBar']);
        Route::get('/bar/dashboard', [BaristaController::class, 'dashboard']);
        Route::get('/bar/orders', [BaristaController::class, 'pendingOrders']);
        Route::put('/bar/orders/{id}/confirm', [BaristaController::class, 'confirmOrder']);
        Route::apiResource('/menu/items', MenuController::class)->only(['index', 'store']);
    });

    // 🏢 Chain Owner (PROPRIETARI DI CATENA)
    Route::middleware('role.chain_owner')->group(function () {
        // Gestione Catene - ATTENZIONE: route specifiche prima delle resource
        Route::get('/chains/my-chains', [ChainController::class, 'index']);
        Route::apiResource('/chains', ChainController::class);
        
        // Upload Immagini Catene
        Route::post('/chains/upload-image', [\App\Http\Controllers\Api\ChainImageGenericController::class, 'uploadImage']);
        Route::post('/chains/{id}/upload-logo', [\App\Http\Controllers\Api\ChainImageController::class, 'uploadLogo']);
        Route::post('/chains/{id}/upload-cover', [\App\Http\Controllers\Api\ChainImageController::class, 'uploadCover']);
        Route::get('/chains/{id}/images', [\App\Http\Controllers\Api\ChainImageController::class, 'getImages']);
        
        // Gestione Filiali (CRUD completo)
        Route::apiResource('/branches', BranchController::class);
        Route::post('/branches/{id}/clone', [BranchController::class, 'clone']);
        Route::get('/branches/{id}/stats', [BranchController::class, 'stats']);
        Route::patch('/branches/{id}/status', [BranchController::class, 'updateStatus']);
        Route::get('/branches/{id}/staff', [StaffController::class, 'getByBranch']);
        
        // Gestione Manager Filiali
        Route::apiResource('/branch-managers', BranchManagerController::class);
        Route::patch('/branch-managers/{id}/status', [BranchManagerController::class, 'updateStatus']);
        Route::get('/available-managers', [BranchManagerController::class, 'availableManagers']);
        
        // Gestione Staff/Personale
        Route::apiResource('/staff', StaffController::class);
        Route::post('/staff/{id}/terminate', [StaffController::class, 'terminate']);
        Route::get('/branches/{id}/staff', [StaffController::class, 'getByBranch']);
        
        // Gestione Impostazioni Filiali
        Route::get('/branches/{id}/settings', [\App\Http\Controllers\Api\BranchSettingsController::class, 'index']);
        Route::put('/branches/{id}/settings/{key}', [\App\Http\Controllers\Api\BranchSettingsController::class, 'updateSetting']);
        Route::post('/branches/{id}/settings/batch', [\App\Http\Controllers\Api\BranchSettingsController::class, 'batchUpdate']);
        Route::get('/branches/{id}/settings/stripe', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getStripeConfig']);
        Route::get('/branches/{id}/settings/hours', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getOpeningHours']);
        Route::get('/branches/{id}/settings/fiscal', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getFiscalData']);
        Route::get('/branches/{id}/settings/fiscal/chain-branches', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getChainBranchesFiscalData']);
        Route::post('/branches/{id}/settings/fiscal/copy', [\App\Http\Controllers\Api\BranchSettingsController::class, 'copyFiscalData']);
        
        // Gestione Turni/Schedule
        Route::get('/branches/{branchId}/schedules', [ScheduleController::class, 'index']);
        Route::post('/schedules/assign', [ScheduleController::class, 'assign']);
        Route::delete('/schedules/assignments/{id}', [ScheduleController::class, 'removeAssignment']);
        Route::put('/schedules/{id}/status', [ScheduleController::class, 'updateStatus']);
    });

    // 🏪 Branch Manager (GESTORI DI FILIALE)
    Route::middleware('role.branch_manager')->group(function () {
        // Gestione Filiali (solo visualizzazione e aggiornamenti limitati)
        Route::get('/manager/branches', [BranchController::class, 'index']);
        Route::get('/manager/branches/{id}', [BranchController::class, 'show']);
        Route::patch('/manager/branches/{id}', [BranchController::class, 'update']);
        Route::get('/manager/branches/{id}/stats', [BranchController::class, 'stats']);
        
        // Gestione Staff (se autorizzato)
        Route::get('/manager/staff', [StaffController::class, 'index']);
        Route::get('/manager/staff/{id}', [StaffController::class, 'show']);
        Route::post('/manager/staff', [StaffController::class, 'store']);
        Route::put('/manager/staff/{id}', [StaffController::class, 'update']);
        Route::post('/manager/staff/{id}/terminate', [StaffController::class, 'terminate']);
        
        // Gestione Turni/Schedule (per branch manager)
        Route::get('/branches/{branchId}/schedules', [ScheduleController::class, 'index']);
        Route::post('/schedules/assign', [ScheduleController::class, 'assign']);
        Route::delete('/schedules/assignments/{id}', [ScheduleController::class, 'removeAssignment']);
        Route::put('/schedules/{id}/status', [ScheduleController::class, 'updateStatus']);
    });

    // 👔 Admin (AMMINISTRATORE DEL SISTEMA)
    Route::middleware('role.admin')->group(function () {
        Route::get('/admin/bars', [AdminController::class, 'listBars']);
        Route::put('/admin/bars/{id}/status', [AdminController::class, 'updateBarStatus']);
        Route::get('/admin/revenue', [AdminController::class, 'revenue']);
        
        // System Settings (Admin only)
        Route::apiResource('/admin/settings', SystemSettingsController::class)->except(['show']);
        Route::get('/admin/settings/{key}', [SystemSettingsController::class, 'show']);
        Route::put('/admin/settings/{key}', [SystemSettingsController::class, 'update']);
        Route::delete('/admin/settings/{key}', [SystemSettingsController::class, 'destroy']);
        Route::post('/admin/settings/batch', [SystemSettingsController::class, 'batchUpdate']);
        
        // System Logo Management (Admin only)
        Route::post('/system/logo', [SystemLogoController::class, 'uploadLogo']);
        
        // Admin può gestire tutte le catene, filiali e manager
        Route::apiResource('/admin/chains', ChainController::class);
        Route::apiResource('/admin/branches', BranchController::class);
        Route::post('/admin/branches/{id}/clone', [BranchController::class, 'clone']);
        Route::get('/admin/branches/{id}/stats', [BranchController::class, 'stats']);
        Route::patch('/admin/branches/{id}/status', [BranchController::class, 'updateStatus']);
        Route::apiResource('/admin/branch-managers', BranchManagerController::class);
        Route::patch('/admin/branch-managers/{id}/status', [BranchManagerController::class, 'updateStatus']);
        Route::get('/admin/available-managers', [BranchManagerController::class, 'availableManagers']);
        
        // Admin gestione completa staff
        Route::apiResource('/admin/staff', StaffController::class);
        Route::post('/admin/staff/{id}/terminate', [StaffController::class, 'terminate']);
    });

    // Settings routes accessible by both baristas and admins
    Route::middleware(['auth:sanctum'])->group(function () {
        // System Settings (read access for authenticated users)
        Route::get('/settings', [SystemSettingsController::class, 'index']);
        Route::get('/settings/{key}', [SystemSettingsController::class, 'show']);
        
        // Bar Settings (bar owners and admins)
        Route::get('/bars/{barId}/settings', [BarSettingsController::class, 'index']);
        Route::get('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'show']);
        Route::post('/bars/{barId}/settings', [BarSettingsController::class, 'store']);
        Route::put('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'update']);
        Route::delete('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'destroy']);
        Route::post('/bars/{barId}/settings/batch', [BarSettingsController::class, 'batchUpdate']);
        Route::post('/bars/{barId}/settings/initialize', [BarSettingsController::class, 'initializeDefaults']);
    });
});

// ==========================================
// PANNELLI SPECIFICI CON EMAIL PERSONALIZZATE
// ==========================================

// 🏪 BAR PANEL ROUTES (bar.qofferun.com)
Route::prefix('bar-panel')->group(function () {
    // Public routes per autenticazione bar
    Route::post('/login', [BarAuthController::class, 'login']);
    Route::post('/forgot-password', [BarAuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [BarAuthController::class, 'resetPassword']);
    
    // Protected routes per bar autenticati
    Route::middleware(['auth:sanctum', 'role.barista'])->group(function () {
        Route::get('/me', [BarAuthController::class, 'me']);
        Route::post('/logout', [BarAuthController::class, 'logout']);
        
        // System Settings (lettura per bar)
        Route::get('/settings', [SystemSettingsController::class, 'index']);
        Route::get('/settings/{key}', [SystemSettingsController::class, 'show']);
        
        // Bar Settings (gestione impostazioni bar)
        Route::get('/bars/{barId}/settings', [BarSettingsController::class, 'index']);
        Route::get('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'show']);
        Route::post('/bars/{barId}/settings', [BarSettingsController::class, 'store']);
        Route::put('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'update']);
        Route::delete('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'destroy']);
        Route::post('/bars/{barId}/settings/batch', [BarSettingsController::class, 'batchUpdate']);
        Route::post('/bars/{barId}/settings/initialize', [BarSettingsController::class, 'initializeDefaults']);
        
        // Dashboard e funzionalità bar
        // Route::get('/dashboard', [BarPanelController::class, 'dashboard']);
        // Route::get('/orders', [BarPanelController::class, 'orders']);
        // Route::get('/menu', [BarPanelController::class, 'menu']);
    });
});

// 🛡️ ADMIN PANEL ROUTES (controllo.qofferun.com)
Route::prefix('admin-panel')->group(function () {
    // Public routes per autenticazione admin
    Route::post('/login', [AdminAuthController::class, 'login']);
    Route::post('/forgot-password', [AdminAuthController::class, 'forgotPassword']);
    Route::post('/reset-password', [AdminAuthController::class, 'resetPassword']);
    
    // Protected routes per admin autenticati
    Route::middleware(['auth:sanctum', 'role.admin'])->group(function () {
        Route::get('/me', [AdminAuthController::class, 'me']);
        Route::post('/logout', [AdminAuthController::class, 'logout']);
        
        // System Settings (gestione completa per admin)
        Route::apiResource('/settings', SystemSettingsController::class)->except(['show']);
        Route::get('/settings/{key}', [SystemSettingsController::class, 'show']);
        Route::put('/settings/{key}', [SystemSettingsController::class, 'update']);
        Route::delete('/settings/{key}', [SystemSettingsController::class, 'destroy']);
        Route::post('/settings/batch', [SystemSettingsController::class, 'batchUpdate']);
        
        // Bar Management (gestione completa per admin)
        Route::get('/bars', [BarSettingsController::class, 'getAllBars']);
        
        // Bar Settings (gestione completa per admin)
        Route::get('/bars/{barId}/settings', [BarSettingsController::class, 'index']);
        Route::get('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'show']);
        Route::post('/bars/{barId}/settings', [BarSettingsController::class, 'store']);
        Route::put('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'update']);
        Route::delete('/bars/{barId}/settings/{key}', [BarSettingsController::class, 'destroy']);
        Route::post('/bars/{barId}/settings/batch', [BarSettingsController::class, 'batchUpdate']);
        Route::post('/bars/{barId}/settings/initialize', [BarSettingsController::class, 'initializeDefaults']);
        
        // Dashboard e gestione admin
        // Route::get('/dashboard', [AdminPanelController::class, 'dashboard']);
        // Route::get('/bars', [AdminPanelController::class, 'bars']);
        // Route::get('/users', [AdminPanelController::class, 'users']);
    });
});