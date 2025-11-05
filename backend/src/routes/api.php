<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CustomerController;
use App\Http\Controllers\Api\BaristaController;
use App\Http\Controllers\Api\AdminController;
use App\Http\Controllers\Api\MenuController;
use App\Http\Controllers\Api\BarRegistrationController;

// Public Routes
Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Bar Registration (public endpoint)
    Route::post('/bar/registrazione', [BarRegistrationController::class, 'register']);
    Route::post('/bar/status', [BarRegistrationController::class, 'getRegistrationStatus']);
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

    // 👔 Admin (AMMINISTRATORE DEL SISTEMA)
    Route::middleware('role.admin')->group(function () {
        Route::get('/admin/bars', [AdminController::class, 'listBars']);
        Route::put('/admin/bars/{id}/status', [AdminController::class, 'updateBarStatus']);
        Route::get('/admin/revenue', [AdminController::class, 'revenue']);
    });
});