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
use App\Http\Controllers\Api\BranchSettingsController;
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
use App\Http\Controllers\Api\FavoriteController;
use App\Http\Controllers\Api\BranchFeedbackController;

// Placeholder image endpoint
Route::get('/placeholder/{width}/{height}', function($width, $height) {
    // Create a simple SVG placeholder
    $svg = '
    <svg width="' . $width . '" height="' . $height . '" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" text-anchor="middle" dy="0.3em" font-family="Arial, sans-serif" font-size="14" fill="#999">No Image</text>
    </svg>';
    
    return response($svg, 200, [
        'Content-Type' => 'image/svg+xml',
        'Cache-Control' => 'public, max-age=31536000',
    ]);
});

// Public Routes
Route::prefix('v1')->group(function () {
    Route::post('/register', [AuthController::class, 'register']);
    Route::post('/login', [AuthController::class, 'login']);
    
    // Chain Owner Registration (public endpoint)
    Route::post('/auth/register-chain-owner', [AuthController::class, 'registerChainOwner']);
    
    // Public System Settings
    Route::get('/settings/public', [SystemSettingsController::class, 'publicSettings']);
    Route::get('/settings/public/google_maps', [SystemSettingsController::class, 'googleMapsConfig']);
    Route::get('/stripe/config', [SystemSettingsController::class, 'stripeConfig']);
    
    // System Settings (public access for logo)
    Route::get('/system-settings/{key}', [SystemSettingController::class, 'show']);
    Route::get('/system-settings', [SystemSettingController::class, 'index']);
    
    // System Logo Management - GET is public, POST requires admin
    Route::get('/system/logo', [SystemLogoController::class, 'getCurrentLogo']);
    
    // Stripe Webhooks (must be public)
    Route::post('/stripe/webhook', [\App\Http\Controllers\Api\StripeWebhookController::class, 'handleWebhook']);
    
    // Public Order Creation (for testing - REMOVE IN PRODUCTION)
    Route::post('/test/branches/{branchId}/orders', [\App\Http\Controllers\Api\BranchOrderController::class, 'createTestOrder']);
    
    // Payment Management (temporarily public for testing)
    Route::prefix('payment')->group(function () {
        Route::post('/create-intent', [\App\Http\Controllers\Api\PaymentController::class, 'createPaymentIntent']);
        Route::post('/confirm', [\App\Http\Controllers\Api\PaymentController::class, 'confirmPayment']);
        Route::post('/test/branches/{branchId}/orders', [\App\Http\Controllers\Api\PaymentController::class, 'createTestOrderWithPayment']);
        Route::post('/create-test-funds', [\App\Http\Controllers\Api\PaymentController::class, 'createTestFunds']);
    });
    
    // Stripe Management (temporarily public for testing)
    Route::prefix('stripe')->group(function () {
        Route::get('/balance', [\App\Http\Controllers\Api\PaymentController::class, 'getStripeBalance']);
    });
    
    // Stripe Connect Management (temporarily public for testing)
    Route::prefix('stripe-connect')->group(function () {
        Route::post('/accounts', [\App\Http\Controllers\Api\StripeConnectController::class, 'createConnectedAccount']);
        Route::post('/account-links', [\App\Http\Controllers\Api\StripeConnectController::class, 'createAccountLink']);
        Route::get('/accounts/{chainId}/status', [\App\Http\Controllers\Api\StripeConnectController::class, 'getAccountStatus']);
    });
    
    // 🍕 Customer Ordering System (Public browsing, auth required for orders)
    Route::prefix('customer')->group(function () {
        // Public browsing - no auth required
        Route::get('/branches', [\App\Http\Controllers\Api\CustomerOrderingController::class, 'getBranches']);
        Route::get('/branches/{branchId}/menu', [\App\Http\Controllers\Api\CustomerOrderingController::class, 'getBranchMenu']);
        Route::get('/menu-items/{itemId}', [\App\Http\Controllers\Api\CustomerOrderingController::class, 'getMenuItem']);
        
        // Cart management (works for both guest and authenticated users)
        Route::get('/cart', [\App\Http\Controllers\Api\CartController::class, 'getCart']);
        Route::post('/cart/add', [\App\Http\Controllers\Api\CartController::class, 'addItem']);
        Route::put('/cart/items/{cartItemId}', [\App\Http\Controllers\Api\CartController::class, 'updateItem']);
        Route::delete('/cart/items/{cartItemId}', [\App\Http\Controllers\Api\CartController::class, 'removeItem']);
        Route::delete('/cart/clear', [\App\Http\Controllers\Api\CartController::class, 'clearCart']);
        
        // Order management 
        Route::post('/orders', [\App\Http\Controllers\Api\OrderController::class, 'create']);
        Route::post('/orders/direct', [\App\Http\Controllers\Api\OrderController::class, 'createDirect']);
        Route::get('/orders/{orderId}', [\App\Http\Controllers\Api\OrderController::class, 'show']);
        Route::post('/orders/{orderId}/capture', [\App\Http\Controllers\Api\OrderController::class, 'capturePayment']);
        Route::post('/orders/{orderId}/cancel', [\App\Http\Controllers\Api\OrderController::class, 'cancelPayment']);
        
        // Customer order management (auth required)
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/my-orders', [\App\Http\Controllers\Api\OrderController::class, 'myOrders']);
            Route::post('/orders/{orderId}/cancel-order', [\App\Http\Controllers\Api\OrderController::class, 'cancelOrder']);
        });
        
        // Payment Methods Management (auth required)
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/payment-methods', [\App\Http\Controllers\Api\PaymentMethodController::class, 'index']);
            Route::post('/payment-methods', [\App\Http\Controllers\Api\PaymentMethodController::class, 'store']);
            Route::get('/payment-methods/default', [\App\Http\Controllers\Api\PaymentMethodController::class, 'getDefault']);
            Route::put('/payment-methods/{id}/default', [\App\Http\Controllers\Api\PaymentMethodController::class, 'setDefault']);
            Route::delete('/payment-methods/{id}', [\App\Http\Controllers\Api\PaymentMethodController::class, 'destroy']);
            
            // Favorites Management
            Route::get('/favorites', [FavoriteController::class, 'index']);
            Route::post('/favorites', [FavoriteController::class, 'store']);
            Route::delete('/favorites/{branchId}', [FavoriteController::class, 'destroy']);
            Route::get('/favorites/check/{branchId}', [FavoriteController::class, 'check']);
            
            // Branch Feedback Management
            Route::get('/branches/{branchId}/feedback', [BranchFeedbackController::class, 'index']);
            Route::post('/branches/{branchId}/feedback', [BranchFeedbackController::class, 'store']);
            Route::get('/orders/{orderId}/feedback-eligibility', [BranchFeedbackController::class, 'checkEligibility']);
            Route::get('/my-feedback', [BranchFeedbackController::class, 'myFeedback']);
        });
    });
    
    // Debug endpoint for branch 16 staff (temporary)
    Route::get('/debug-branch-16-staff', function() {
        // Direct database query for debugging
        $assignments = \DB::table('user_branches')
            ->join('users', 'users.id', '=', 'user_branches.user_id')
            ->join('branches', 'branches.id', '=', 'user_branches.branch_id')
            ->where('user_branches.branch_id', 16)
            ->select('users.id', 'users.name', 'users.email', 'user_branches.role_at_branch')
            ->get();
            
        $managers = $assignments->where('role_at_branch', 'branch_manager')->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'branch_manager',
                'role_at_branch' => 'branch_manager'
            ];
        })->values();
        
        $staff = $assignments->where('role_at_branch', 'barista')->map(function($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => 'barista',
                'role_at_branch' => 'barista'
            ];
        })->values();
        
        return response()->json([
            'success' => true,
            'data' => [
                'managers' => $managers,
                'staff' => $staff
            ]
        ]);
    });
    
    // Debug endpoint for individual staff member (temporary)
    Route::get('/debug-staff/{staffId}', function($staffId) {
        $user = \DB::table('users')
            ->leftJoin('user_branches', 'users.id', '=', 'user_branches.user_id')
            ->leftJoin('branches', 'user_branches.branch_id', '=', 'branches.id')
            ->where('users.id', $staffId)
            ->select('users.*', 'user_branches.role_at_branch', 'user_branches.permissions', 'branches.name as branch_name', 'branches.id as branch_id')
            ->first();
            
        if (!$user) {
            return response()->json(['success' => false, 'message' => 'Staff member not found'], 404);
        }
        
        // Parse permissions from JSON
        $permissions = [];
        if ($user->permissions) {
            $permissionsData = is_string($user->permissions) ? json_decode($user->permissions, true) : $user->permissions;
            $permissions = $permissionsData ?: [];
        }
        
        return response()->json([
            'success' => true,
            'data' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'role_at_branch' => $user->role_at_branch,
                'branch_name' => $user->branch_name,
                'branch_id' => $user->branch_id,
                'hire_date' => $user->created_at,
                'employee_code' => 'EMP' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                'permissions' => $permissions // Actual permissions from user_branches table
            ]
        ]);
    });
    
    // Debug endpoint to get all branch assignments for a staff member
    Route::get('/debug-staff/{staffId}/branches', function($staffId) {
        $assignments = \DB::table('user_branches')
            ->join('branches', 'user_branches.branch_id', '=', 'branches.id')
            ->where('user_branches.user_id', $staffId)
            ->select('branches.id', 'branches.name', 'user_branches.role_at_branch', 'user_branches.permissions')
            ->get()
            ->map(function($assignment) {
                $permissions = [];
                if ($assignment->permissions) {
                    $permissionsData = is_string($assignment->permissions) ? json_decode($assignment->permissions, true) : $assignment->permissions;
                    $permissions = $permissionsData ?: [];
                }
                return [
                    'branch_id' => $assignment->id,
                    'branch_name' => $assignment->name,
                    'role_at_branch' => $assignment->role_at_branch,
                    'permissions' => $permissions
                ];
            });
            
        return response()->json([
            'success' => true,
            'data' => $assignments
        ]);
    });
    
    // Debug endpoint to update staff permissions (temporary)
    Route::put('/debug-staff/{staffId}/permissions', function(Request $request, $staffId) {
        $permissions = $request->input('permissions', []);
        
        // Update permissions in user_branches table
        $updated = \DB::table('user_branches')
            ->where('user_id', $staffId)
            ->update([
                'permissions' => json_encode($permissions),
                'updated_at' => now()
            ]);
            
        if ($updated) {
            return response()->json([
                'success' => true,
                'message' => 'Permissions updated successfully',
                'data' => ['permissions' => $permissions]
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Failed to update permissions'
            ], 400);
        }
    });
    
    // Debug endpoint to assign user to additional branch
    Route::post('/debug-assign-staff/{userId}/branch/{branchId}', function($userId, $branchId) {
        $request = request();
        
        // Check if assignment already exists
        $existing = \DB::table('user_branches')
            ->where('user_id', $userId)
            ->where('branch_id', $branchId)
            ->first();
            
        if ($existing) {
            return response()->json([
                'success' => false,
                'message' => 'User already assigned to this branch'
            ], 400);
        }
        
        // Default permissions for branch manager
        $defaultPermissions = [
            'view_orders' => true,
            'create_orders' => true,
            'manage_orders' => true,
            'delete_orders' => true,
            'view_menu' => true,
            'manage_menu' => true,
            'create_menu' => true,
            'view_payments' => true,
            'process_payments' => true,
            'refund_payments' => true,
            'view_reports' => true,
            'export_reports' => true,
            'view_analytics' => true,
            'view_staff' => true,
            'manage_staff' => true,
            'view_schedules' => true,
            'manage_schedules' => true,
            'manage_settings' => true
        ];
        
        $role = $request->input('role_at_branch', 'branch_manager');
        $permissions = $request->input('permissions', $defaultPermissions);
        
        \DB::table('user_branches')->insert([
            'user_id' => $userId,
            'branch_id' => $branchId,
            'role_at_branch' => $role,
            'is_primary_branch' => false,
            'assigned_at' => now(),
            'permissions' => json_encode($permissions),
            'work_schedule' => json_encode([]),
            'created_at' => now(),
            'updated_at' => now()
        ]);
        
        return response()->json([
            'success' => true,
            'message' => 'User assigned to branch successfully'
        ]);
    });
    
    // Debug endpoint for branch staff list (for schedules)
    Route::get('/debug-branch-staff/{branchId}', function($branchId) {
        $staff = \DB::table('user_branches')
            ->join('users', 'users.id', '=', 'user_branches.user_id')
            ->join('branches', 'branches.id', '=', 'user_branches.branch_id')
            ->where('user_branches.branch_id', $branchId)
            ->select('users.id', 'users.name', 'users.email', 'users.phone', 'users.created_at', 'user_branches.role_at_branch')
            ->get()
            ->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'phone' => $user->phone,
                    'role' => $user->role_at_branch,
                    'employee_code' => 'EMP' . str_pad($user->id, 4, '0', STR_PAD_LEFT),
                    'created_at' => $user->created_at,
                    'status' => 'active'
                ];
            });
        
        return response()->json([
            'success' => true,
            'data' => $staff->toArray()
        ]);
    });
    
    // Debug endpoint to remove staff from branch
    Route::delete('/debug-remove-staff/{userId}/branch/{branchId}', function($userId, $branchId) {
        $deleted = \DB::table('user_branches')
            ->where('user_id', $userId)
            ->where('branch_id', $branchId)
            ->delete();
            
        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Staff removed from branch successfully'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Assignment not found or already removed'
            ], 404);
        }
    });

    // Debug endpoint: Get schedules for a branch (temporary bypass auth)
    Route::get('/debug-branch/{branchId}/schedules', function($branchId) {
        $request = request();
        $startDate = $request->input('start_date', now()->startOfWeek()->toDateString());
        $endDate = $request->input('end_date', now()->endOfWeek()->toDateString());

        $schedules = \DB::table('schedules')
            ->join('users', 'users.id', '=', 'schedules.staff_id')
            ->where('schedules.branch_id', $branchId)
            ->whereBetween('schedules.date', [$startDate, $endDate])
            ->select(
                'schedules.*',
                'users.name as staff_name',
                'users.email as staff_email'
            )
            ->orderBy('schedules.date')
            ->orderBy('schedules.start_time')
            ->get();

        // Group by date and shift type
        $groupedSchedules = [];
        foreach ($schedules as $schedule) {
            $date = $schedule->date;
            $shiftType = $schedule->shift_type;
            
            if (!isset($groupedSchedules[$date])) {
                $groupedSchedules[$date] = [];
            }
            
            if (!isset($groupedSchedules[$date][$shiftType])) {
                $groupedSchedules[$date][$shiftType] = [];
            }
            
            $groupedSchedules[$date][$shiftType][] = [
                'id' => $schedule->id,
                'staff_id' => $schedule->staff_id,
                'staff' => [
                    'id' => $schedule->staff_id,
                    'name' => $schedule->staff_name,
                    'email' => $schedule->staff_email
                ],
                'branch_id' => $schedule->branch_id,
                'shift_type' => $schedule->shift_type,
                'date' => $schedule->date,
                'start_time' => $schedule->start_time,
                'end_time' => $schedule->end_time,
                'status' => $schedule->status,
                'notes' => $schedule->notes
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $groupedSchedules,
            'meta' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_schedules' => $schedules->count()
            ]
        ]);
    });

    // Debug endpoint: Assign staff to schedule (temporary bypass auth)
    Route::post('/debug-schedules-assign', function() {
        try {
            $request = request();
            
            $staffId = $request->input('staff_id');
            $branchId = $request->input('branch_id');
            $shiftType = $request->input('shift_id');
            $date = $request->input('date');
            $notes = $request->input('notes', '');

            if (!$staffId || !$branchId || !$shiftType || !$date) {
                return response()->json([
                    'success' => false,
                    'message' => 'Parametri mancanti: staff_id, branch_id, shift_id, date sono richiesti'
                ], 422);
            }

            // Check if assignment already exists
            $existing = \DB::table('schedules')
                ->where('staff_id', $staffId)
                ->where('date', $date)
                ->where('shift_type', $shiftType)
                ->first();

            if ($existing) {
                return response()->json([
                    'success' => false,
                    'message' => 'Lo staff è già assegnato a questo turno'
                ], 422);
            }

            // Define shift times
            $shiftTimes = [
                'morning' => ['06:00', '14:00'],
                'afternoon' => ['14:00', '22:00'],
                'evening' => ['18:00', '02:00'],
                'night' => ['22:00', '06:00']
            ];

            $times = $shiftTimes[$shiftType] ?? $shiftTimes['morning'];

            // Create schedule
            $scheduleId = \DB::table('schedules')->insertGetId([
                'staff_id' => $staffId,
                'branch_id' => $branchId,
                'shift_type' => $shiftType,
                'date' => $date,
                'start_time' => $times[0],
                'end_time' => $times[1],
                'status' => 'scheduled',
                'notes' => $notes,
                'created_at' => now(),
                'updated_at' => now()
            ]);

            // Get staff details
            $staff = \DB::table('users')->where('id', $staffId)->first();

            return response()->json([
                'success' => true,
                'message' => 'Turno assegnato con successo',
                'data' => [
                    'id' => $scheduleId,
                    'staff_id' => $staffId,
                    'staff' => [
                        'id' => $staff->id ?? $staffId,
                        'name' => $staff->name ?? 'Unknown',
                        'email' => $staff->email ?? null
                    ],
                    'branch_id' => $branchId,
                    'shift_type' => $shiftType,
                    'date' => $date,
                    'start_time' => $times[0],
                    'end_time' => $times[1],
                    'status' => 'scheduled',
                    'notes' => $notes
                ]
            ]);
        } catch (\Throwable $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore interno: '.$e->getMessage()
            ], 500);
        }
    });

    // Debug endpoint: Remove schedule assignment (temporary bypass auth)
    Route::delete('/debug-schedules-assignments/{id}', function($id) {
        $deleted = \DB::table('schedules')
            ->where('id', $id)
            ->delete();

        if ($deleted) {
            return response()->json([
                'success' => true,
                'message' => 'Assegnazione rimossa con successo'
            ]);
        } else {
            return response()->json([
                'success' => false,
                'message' => 'Assegnazione non trovata'
            ], 404);
        }
    });

    // Branch overview metrics
    Route::get('/branches/{branchId}/overview', [\App\Http\Controllers\Api\BranchController::class, 'overview']);
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

    // Debug endpoint: get branch details by ID
    Route::get('/debug-branch/{branchId}', function($branchId) {
        $branch = \DB::table('branches')
            ->leftJoin('chains', 'chains.id', '=', 'branches.chain_id')
            ->where('branches.id', $branchId)
            ->select(
                'branches.id', 'branches.name', 'branches.address', 'branches.city', 'branches.status',
                'branches.delivery_enabled', 'branches.takeaway_enabled',
                'chains.id as chain_id', 'chains.name as chain_name'
            )
            ->first();

        if (!$branch) {
            return response()->json(['success' => false, 'message' => 'Branch not found'], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $branch
        ]);
    });

    // Debug endpoint: list all branches with chain info
    Route::get('/debug-branches', function() {
        $branches = \DB::table('branches')
            ->leftJoin('chains', 'chains.id', '=', 'branches.chain_id')
            ->select(
                'branches.id', 'branches.name', 'branches.address', 'branches.city', 'branches.status',
                'branches.delivery_enabled', 'branches.takeaway_enabled',
                'chains.id as chain_id', 'chains.name as chain_name'
            )
            ->orderBy('chains.name')
            ->orderBy('branches.name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $branches
        ]);
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
        Route::get('/branches/{id}/overview', [BranchController::class, 'overview']);
        Route::get('/branches/{branchId}/orders-stats', [\App\Http\Controllers\Api\BranchOrderController::class, 'getStats']);
        // Orders listing and details for chain owners
        Route::get('/branches/{branchId}/orders', [\App\Http\Controllers\Api\BranchOrderController::class, 'index']);
        Route::get('/branches/{branchId}/orders/{orderId}', [\App\Http\Controllers\Api\BranchOrderController::class, 'show']);
        Route::patch('/branches/{id}/status', [BranchController::class, 'updateStatus']);
        Route::get('/branches/{id}/staff', [StaffController::class, 'getByBranch']);
        
        // Stripe Connect Management moved to public routes for testing
        
        // Gestione Manager Filiali
        Route::apiResource('/branch-managers', BranchManagerController::class);
        Route::patch('/branch-managers/{id}/status', [BranchManagerController::class, 'updateStatus']);
        Route::get('/available-managers', [BranchManagerController::class, 'availableManagers']);
        
        // Gestione Staff/Personale
        Route::apiResource('/staff', StaffController::class);
        Route::post('/staff/{id}/terminate', [StaffController::class, 'terminate']);
        Route::get('/branches/{id}/staff', [StaffController::class, 'getByBranch']);
        
        // Staff Management (New Multi-Branch System)
        Route::get('/staff-management/chain-staff', [\App\Http\Controllers\Api\StaffManagementController::class, 'getChainStaff']);
        Route::get('/staff-management/all-assigned', [\App\Http\Controllers\Api\StaffManagementController::class, 'getAllAssignedStaff']);
        Route::get('/staff-management/branch/{branchId}', [\App\Http\Controllers\Api\StaffManagementController::class, 'getBranchStaff']);
        Route::get('/staff-management/branch/{branchId}/managers', [\App\Http\Controllers\Api\StaffManagementController::class, 'getBranchManagers']);
        Route::post('/staff-management/assign', [\App\Http\Controllers\Api\StaffManagementController::class, 'assignUserToBranch']);
        Route::delete('/staff-management/remove', [\App\Http\Controllers\Api\StaffManagementController::class, 'removeUserFromBranch']);
        
        // Gestione Impostazioni Filiali
        Route::get('/branches/{id}/settings', [\App\Http\Controllers\Api\BranchSettingsController::class, 'index']);
        Route::put('/branches/{id}/settings/{key}', [\App\Http\Controllers\Api\BranchSettingsController::class, 'updateSetting']);
        Route::post('/branches/{id}/settings/batch', [\App\Http\Controllers\Api\BranchSettingsController::class, 'batchUpdate']);
        Route::get('/branches/{id}/settings/stripe', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getStripeConfig']);
        Route::get('/branches/{id}/settings/hours', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getOpeningHours']);
        Route::get('/branches/{id}/settings/fiscal', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getFiscalData']);
        Route::get('/branches/{id}/settings/fiscal/chain-branches', [\App\Http\Controllers\Api\BranchSettingsController::class, 'getChainBranchesFiscalData']);
        Route::post('/branches/{id}/settings/fiscal/copy', [\App\Http\Controllers\Api\BranchSettingsController::class, 'copyFiscalData']);

        // Stripe Connect Management per Chain Owner
        Route::get("/branches/{id}/stripe-account", [\App\Http\Controllers\Api\StripeConnectController::class, "getAccount"]);
        Route::post("/branches/{id}/stripe-connect", [\App\Http\Controllers\Api\StripeConnectController::class, "createConnectAccount"]);
        Route::post("/branches/{id}/stripe-disconnect", [\App\Http\Controllers\Api\StripeConnectController::class, "disconnectAccount"]);
        Route::get("/branches/{id}/stripe-onboarding-complete", [\App\Http\Controllers\Api\StripeConnectController::class, "handleOnboardingComplete"]);
        
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

        // Reviews - authenticated customers can post a review if eligible
        Route::post('/branches/{branchId}/reviews', [\App\Http\Controllers\Api\ReviewController::class, 'store']);
    });
});

// ==========================================
// 🌍 PUBLIC API ROUTES (No Authentication Required)
// ==========================================

Route::prefix('v1/public')->group(function () {
    // Branch Discovery API
    Route::get('/branches', [\App\Http\Controllers\Api\PublicBranchController::class, 'getPublicBranches']);
    Route::get('/branches/search', [\App\Http\Controllers\Api\PublicBranchController::class, 'searchBranches']);
    Route::get('/branches/{branchId}', [\App\Http\Controllers\Api\PublicBranchController::class, 'getBranchDetails']);
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
        
        // Branch management for authenticated users
        Route::get('/user/branches', [BarAuthController::class, 'getUserBranches']);
        
        // Branch Settings (gestione impostazioni filiali)
        Route::get('/branches/{branchId}/settings', [\App\Http\Controllers\Api\BranchSettingsController::class, 'index']);
        Route::put('/branches/{branchId}/settings/{key}', [\App\Http\Controllers\Api\BranchSettingsController::class, 'updateSetting']);
        Route::post('/branches/{branchId}/settings/batch', [\App\Http\Controllers\Api\BranchSettingsController::class, 'batchUpdate']);
        
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
        
        // Branch Menu Management
        Route::prefix('branches/{branchId}')->group(function () {
            // Menu management
            Route::get('/menus', [\App\Http\Controllers\Api\BranchMenuController::class, 'index']);
            Route::post('/menus', [\App\Http\Controllers\Api\BranchMenuController::class, 'createMenu']);
            
            // Menu items management
            Route::get('/menus/{menuId}/items', [\App\Http\Controllers\Api\BranchMenuController::class, 'getMenuItems']);
            Route::post('/menus/{menuId}/items', [\App\Http\Controllers\Api\BranchMenuController::class, 'addMenuItem']);
            Route::put('/menus/{menuId}/items/{itemId}', [\App\Http\Controllers\Api\BranchMenuController::class, 'updateMenuItem']);
            Route::post('/menus/{menuId}/items/{itemId}', [\App\Http\Controllers\Api\BranchMenuController::class, 'updateMenuItem']); // For method spoofing
            Route::delete('/menus/{menuId}/items/{itemId}', [\App\Http\Controllers\Api\BranchMenuController::class, 'deleteMenuItem']);
            Route::patch('/menus/{menuId}/items/{itemId}/toggle-availability', [\App\Http\Controllers\Api\BranchMenuController::class, 'toggleAvailability']);
            
            // Debug: Menu access testing  
            Route::get('/debug-menu-access', function(Request $request) {
                $branchId = $request->route('branchId');
                $user = $request->user();
                
                // Check if user has assignedBranches relationship
                $branchAssignment = $user->assignedBranches()->where('branches.id', $branchId)->first();
                
                $permissions = [];
                if ($branchAssignment && $branchAssignment->pivot->permissions) {
                    $permissions = is_string($branchAssignment->pivot->permissions) ? json_decode($branchAssignment->pivot->permissions, true) : $branchAssignment->pivot->permissions;
                }
                
                return response()->json([
                    'success' => true,
                    'user' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'isBarista' => $user->isBarista()
                    ],
                    'branch_assignment' => $branchAssignment ? [
                        'branch_id' => $branchAssignment->id,
                        'branch_name' => $branchAssignment->name,
                        'role_at_branch' => $branchAssignment->pivot->role_at_branch,
                        'permissions' => $permissions,
                        'has_manage_menu' => isset($permissions['manage_menu']) && $permissions['manage_menu'] === true
                    ] : null
                ]);
            });
            
            // Order management
            Route::get('/orders', [\App\Http\Controllers\Api\BranchOrderController::class, 'index']);
            Route::get('/orders/{orderId}', [\App\Http\Controllers\Api\BranchOrderController::class, 'show']);
            Route::patch('/orders/{orderId}/status', [\App\Http\Controllers\Api\BranchOrderController::class, 'updateStatus']);
            Route::post('/orders/{orderId}/notes', [\App\Http\Controllers\Api\BranchOrderController::class, 'addNotes']);
            
            // Stripe Connect management
            Route::get('/stripe-account', [\App\Http\Controllers\Api\StripeConnectController::class, 'getAccount']);
            Route::post('/stripe-connect', [\App\Http\Controllers\Api\StripeConnectController::class, 'createConnectAccount']);
            Route::post('/stripe-disconnect', [\App\Http\Controllers\Api\StripeConnectController::class, 'disconnectAccount']);
            Route::get('/stripe-onboarding-complete', [\App\Http\Controllers\Api\StripeConnectController::class, 'handleOnboardingComplete']);
            Route::get('/orders/{orderId}/pickup-info', [\App\Http\Controllers\Api\BranchOrderController::class, 'getPickupInfo']);
            
            // Order statistics and active orders
            Route::get('/orders-stats', [\App\Http\Controllers\Api\BranchOrderController::class, 'getStats']);
            Route::get('/active-orders', [\App\Http\Controllers\Api\BranchOrderController::class, 'getActiveOrders']);
        });
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

    // Test routes for Stripe Connect functionality
    Route::prefix('test')->group(function () {
        Route::get('/orders', [\App\Http\Controllers\Api\OrderController::class, 'getTestOrders']);
        Route::post('/orders/{orderId}/simulate-capture', [\App\Http\Controllers\Api\OrderController::class, 'simulateCapture']);
    });
});