<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BranchManager;
use App\Models\Branch;
use App\Models\User;
use App\Services\StaffEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class BranchManagerController extends Controller
{
    /**
     * Lista tutti i manager della catena
     * GET /api/v1/branch-managers
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if ($user->role === 'chain_owner') {
            $chainIds = $user->ownedChains->pluck('id');
            $branchIds = Branch::whereIn('chain_id', $chainIds)->pluck('id');
            
            $managers = BranchManager::with(['branch', 'user', 'assignedBy'])
                ->whereIn('branch_id', $branchIds)
                ->when($request->branch_id, function ($query, $branchId) {
                    return $query->where('branch_id', $branchId);
                })
                ->when($request->status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }
        elseif ($user->role === 'admin') {
            $managers = BranchManager::with(['branch', 'user', 'assignedBy'])
                ->when($request->branch_id, function ($query, $branchId) {
                    return $query->where('branch_id', $branchId);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }
        else {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato ad accedere ai manager'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $managers
        ]);
    }

    /**
     * Assegna un manager ad una filiale
     * POST /api/v1/branch-managers
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['chain_owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato ad assegnare manager'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'branch_id' => 'required|exists:branches,id',
            'user_id' => 'required|exists:users,id',
            'is_primary_manager' => 'boolean',
            'permissions' => 'array',
            'max_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'can_access_reports' => 'boolean',
            'can_manage_staff' => 'boolean',
            'can_modify_menu' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $branch = Branch::find($request->branch_id);
        $managerUser = User::find($request->user_id);

        // Controllo autorizzazioni sulla filiale
        if ($user->role === 'chain_owner') {
            if (!$user->ownedChains->contains($branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non puoi assegnare manager a questa filiale'
                ], 403);
            }
        }

        // Verifica che l'utente sia un branch_manager
        if (!in_array($managerUser->role, ['branch_manager', 'staff'])) {
            return response()->json([
                'success' => false,
                'message' => 'L\'utente deve avere ruolo branch_manager o staff'
            ], 422);
        }

        // Verifica che l'utente non sia già assegnato a questa filiale
        $existingAssignment = BranchManager::where('branch_id', $request->branch_id)
            ->where('user_id', $request->user_id)
            ->where('status', 'active')
            ->first();

        if ($existingAssignment) {
            return response()->json([
                'success' => false,
                'message' => 'L\'utente è già assegnato a questa filiale'
            ], 422);
        }

        $branchManagerData = $validator->validated();
        $branchManagerData['assigned_by'] = $user->id;
        $branchManagerData['assigned_at'] = now();
        $branchManagerData['status'] = 'active';
        $branchManagerData['is_primary_manager'] = $branchManagerData['is_primary_manager'] ?? false;
        $branchManagerData['can_access_reports'] = $branchManagerData['can_access_reports'] ?? true;
        $branchManagerData['can_manage_staff'] = $branchManagerData['can_manage_staff'] ?? false;
        $branchManagerData['can_modify_menu'] = $branchManagerData['can_modify_menu'] ?? false;
        $branchManagerData['max_discount_percentage'] = $branchManagerData['max_discount_percentage'] ?? 10.00;

        $branchManager = BranchManager::create($branchManagerData);
        $branchManager->load(['branch', 'user', 'assignedBy']);

        // Send email notification to the assigned manager
        try {
            StaffEmailService::sendBranchAssignmentNotification(
                $managerUser,
                $branch,
                [
                    'permissions' => $branchManagerData['permissions'] ?? [],
                    'can_access_reports' => $branchManagerData['can_access_reports'],
                    'can_manage_staff' => $branchManagerData['can_manage_staff'],
                    'can_modify_menu' => $branchManagerData['can_modify_menu'],
                    'max_discount_percentage' => $branchManagerData['max_discount_percentage']
                ]
            );
        } catch (\Exception $emailException) {
            // Log email error but don't fail the manager assignment
            \Log::warning('Failed to send branch manager assignment email: ' . $emailException->getMessage(), [
                'manager_id' => $managerUser->id,
                'manager_email' => $managerUser->email,
                'branch_id' => $branch->id
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Manager assegnato con successo',
            'data' => $branchManager
        ], 201);
    }

    /**
     * Mostra dettagli assegnazione manager
     * GET /api/v1/branch-managers/{id}
     */
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();
        
        $branchManager = BranchManager::with(['branch', 'user', 'assignedBy'])->find($id);
        
        if (!$branchManager) {
            return response()->json([
                'success' => false,
                'message' => 'Assegnazione manager non trovata'
            ], 404);
        }

        // Controllo autorizzazioni
        $authorized = false;
        
        if ($user->role === 'admin') {
            $authorized = true;
        } elseif ($user->role === 'chain_owner') {
            $authorized = $user->ownedChains->contains($branchManager->branch->chain_id);
        } elseif ($user->role === 'branch_manager') {
            $authorized = $branchManager->user_id === $user->id;
        }

        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a visualizzare questa assegnazione'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $branchManager
        ]);
    }

    /**
     * Aggiorna permessi e configurazione manager
     * PUT/PATCH /api/v1/branch-managers/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();
        
        $branchManager = BranchManager::find($id);
        
        if (!$branchManager) {
            return response()->json([
                'success' => false,
                'message' => 'Assegnazione manager non trovata'
            ], 404);
        }

        // Solo chain_owner e admin possono modificare i manager
        if ($user->role === 'chain_owner') {
            if (!$user->ownedChains->contains($branchManager->branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato a modificare questo manager'
                ], 403);
            }
        } elseif ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare manager'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'is_primary_manager' => 'boolean',
            'permissions' => 'array',
            'max_discount_percentage' => 'nullable|numeric|min:0|max:100',
            'can_access_reports' => 'boolean',
            'can_manage_staff' => 'boolean',
            'can_modify_menu' => 'boolean',
            'hourly_rate' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string|max:1000',
            'work_schedule' => 'nullable|array'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $branchManager->update($validator->validated());
        $branchManager->load(['branch', 'user', 'assignedBy']);

        return response()->json([
            'success' => true,
            'message' => 'Configurazione manager aggiornata',
            'data' => $branchManager
        ]);
    }

    /**
     * Rimuove un manager da una filiale
     * DELETE /api/v1/branch-managers/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $user = Auth::user();
        
        $branchManager = BranchManager::find($id);
        
        if (!$branchManager) {
            return response()->json([
                'success' => false,
                'message' => 'Assegnazione manager non trovata'
            ], 404);
        }

        // Solo chain_owner e admin possono rimuovere manager
        if ($user->role === 'chain_owner') {
            if (!$user->ownedChains->contains($branchManager->branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato a rimuovere questo manager'
                ], 403);
            }
        } elseif ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a rimuovere manager'
            ], 403);
        }

        $managerName = $branchManager->user->name;
        $branchName = $branchManager->branch->name;
        
        $branchManager->delete();

        return response()->json([
            'success' => true,
            'message' => "Manager '{$managerName}' rimosso dalla filiale '{$branchName}'"
        ]);
    }

    /**
     * Cambia status del manager
     * PATCH /api/v1/branch-managers/{id}/status
     */
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['chain_owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare lo status'
            ], 403);
        }

        $branchManager = BranchManager::find($id);
        
        if (!$branchManager) {
            return response()->json([
                'success' => false,
                'message' => 'Assegnazione manager non trovata'
            ], 404);
        }

        if ($user->role === 'chain_owner' && !$user->ownedChains->contains($branchManager->branch->chain_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare questo manager'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,suspended,terminated'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Status non valido',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $branchManager->status;
        $branchManager->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "Status manager cambiato da '{$oldStatus}' a '{$request->status}'",
            'data' => $branchManager
        ]);
    }

    /**
     * Lista manager disponibili per assegnazione
     * GET /api/v1/available-managers
     */
    public function availableManagers(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['chain_owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        $availableUsers = User::whereIn('role', ['branch_manager', 'staff'])
            ->when($request->search, function ($query, $search) {
                return $query->where(function ($q) use ($search) {
                    $q->where('name', 'ILIKE', "%{$search}%")
                      ->orWhere('email', 'ILIKE', "%{$search}%");
                });
            })
            ->select('id', 'name', 'email', 'role')
            ->limit(20)
            ->get();

        return response()->json([
            'success' => true,
            'data' => $availableUsers
        ]);
    }
}