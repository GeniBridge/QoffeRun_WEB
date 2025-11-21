<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Branch;
use App\Models\Chain;
use App\Services\StaffEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class StaffController extends Controller
{
    /**
     * Lista staff per filiali/catene
     * GET /api/v1/staff
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Autorizzazione per ruoli
        if (!in_array($user->role, ['admin', 'chain_owner', 'branch_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato ad accedere al personale'
            ], 403);
        }

        $query = User::where('role', 'staff')->with(['chain', 'managedBranches']);

        // Filtro per Chain Owner: solo staff delle proprie catene
        if ($user->role === 'chain_owner') {
            $chainIds = $user->ownedChains->pluck('id');
            $query->whereIn('chain_id', $chainIds);
        }
        // Filtro per Branch Manager: solo staff delle filiali gestite
        elseif ($user->role === 'branch_manager') {
            $branchIds = $user->managedBranches->pluck('id');
            // Per ora gestiamo staff a livello catena, non filiale specifica
            $chainIds = Branch::whereIn('id', $branchIds)->pluck('chain_id');
            $query->whereIn('chain_id', $chainIds);
        }

        // Filtri aggiuntivi dalla richiesta
        if ($request->chain_id) {
            $query->where('chain_id', $request->chain_id);
        }

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%")
                  ->orWhere('employee_code', 'like', "%{$search}%");
            });
        }

        $staff = $query->orderBy('created_at', 'desc')
                      ->paginate($request->per_page ?? 15);

        return response()->json([
            'success' => true,
            'data' => $staff
        ]);
    }

    /**
     * Mostra dettagli staff specifico
     * GET /api/v1/staff/{id}
     */
    public function show($id): JsonResponse
    {
        $user = Auth::user();
        
        $staff = User::where('role', 'staff')
                    ->with(['chain', 'managedBranches'])
                    ->find($id);

        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Staff non trovato'
            ], 404);
        }

        // Verifica autorizzazioni
        if ($user->role === 'chain_owner' && !$user->ownedChains->contains($staff->chain_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato ad accedere a questo staff'
            ], 403);
        } elseif ($user->role === 'branch_manager') {
            $branchIds = $user->managedBranches->pluck('id');
            $chainIds = Branch::whereIn('id', $branchIds)->pluck('chain_id');
            
            if (!$chainIds->contains($staff->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato ad accedere a questo staff'
                ], 403);
            }
        }

        return response()->json([
            'success' => true,
            'data' => $staff
        ]);
    }

    /**
     * Crea nuovo membro dello staff
     * POST /api/v1/staff
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Autorizzazione: solo admin, chain_owner e branch_manager con permessi
        if (!in_array($user->role, ['admin', 'chain_owner', 'branch_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a creare staff'
            ], 403);
        }

        // Verifica permessi branch_manager
        if ($user->role === 'branch_manager') {
            $canManageStaff = $user->branchManagers()
                                  ->where('can_manage_staff', true)
                                  ->exists();
            
            if (!$canManageStaff) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non hai i permessi per gestire il personale'
                ], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'phone' => 'nullable|string|max:15',
            'chain_id' => 'required|exists:chains,id',
            'employee_code' => 'nullable|string|max:50|unique:users,employee_code',
            'hire_date' => 'required|date',
            'emergency_contact' => 'nullable|array',
            'emergency_contact.name' => 'required_with:emergency_contact|string|max:255',
            'emergency_contact.phone' => 'required_with:emergency_contact|string|max:15',
            'emergency_contact.relationship' => 'nullable|string|max:100',
            'work_preferences' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errori di validazione',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verifica che chain_id sia autorizzata per l'utente
        if ($user->role === 'chain_owner' && !$user->ownedChains->contains($request->chain_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a creare staff per questa catena'
            ], 403);
        } elseif ($user->role === 'branch_manager') {
            $branchIds = $user->managedBranches->pluck('id');
            $chainIds = Branch::whereIn('id', $branchIds)->pluck('chain_id');
            
            if (!$chainIds->contains($request->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato a creare staff per questa catena'
                ], 403);
            }
        }

        // Genera employee_code se non fornito
        if (!$request->employee_code) {
            $chain = Chain::find($request->chain_id);
            $chainCode = strtoupper(substr($chain->code ?? $chain->name, 0, 3));
            $lastEmployee = User::where('role', 'staff')
                               ->where('chain_id', $request->chain_id)
                               ->where('employee_code', 'like', $chainCode . '%')
                               ->orderBy('employee_code', 'desc')
                               ->first();
            
            if ($lastEmployee && preg_match('/(\d+)$/', $lastEmployee->employee_code, $matches)) {
                $nextNumber = intval($matches[1]) + 1;
            } else {
                $nextNumber = 1;
            }
            
            $employeeCode = $chainCode . str_pad($nextNumber, 4, '0', STR_PAD_LEFT);
        } else {
            $employeeCode = $request->employee_code;
        }

        try {
            // Store the plain password before hashing
            $plainPassword = $request->password;
            
            $staff = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'staff',
                'phone' => $request->phone,
                'chain_id' => $request->chain_id,
                'employee_code' => $employeeCode,
                'hire_date' => $request->hire_date,
                'emergency_contact' => $request->emergency_contact,
                'work_preferences' => $request->work_preferences,
            ]);

            // Aggiorna conteggio staff nelle filiali della catena
            $this->updateChainStaffCount($request->chain_id);

            // Send email notification with credentials
            // Try to find the specific branch from work_preferences, otherwise use first branch of the chain
            $branchId = $request->work_preferences['branch_id'] ?? null;
            $branch = null;
            
            if ($branchId) {
                $branch = Branch::find($branchId);
            }
            
            if (!$branch) {
                $branch = Branch::where('chain_id', $request->chain_id)->first();
            }
            
            if ($branch) {
                try {
                    StaffEmailService::sendCredentialsNotification(
                        $staff,
                        $branch,
                        $plainPassword
                    );
                } catch (\Exception $emailException) {
                    // Log email error but don't fail the staff creation
                    \Log::warning('Failed to send staff credentials email: ' . $emailException->getMessage(), [
                        'staff_id' => $staff->id,
                        'staff_email' => $staff->email,
                        'branch_id' => $branch->id ?? null
                    ]);
                }
            }

            return response()->json([
                'success' => true,
                'message' => 'Staff creato con successo',
                'data' => $staff->load('chain')
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante la creazione dello staff',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Aggiorna staff esistente
     * PUT /api/v1/staff/{id}
     */
    public function update(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        
        $staff = User::where('role', 'staff')->find($id);
        
        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Staff non trovato'
            ], 404);
        }

        // Verifica autorizzazioni
        if ($user->role === 'chain_owner' && !$user->ownedChains->contains($staff->chain_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare questo staff'
            ], 403);
        } elseif ($user->role === 'branch_manager') {
            $branchIds = $user->managedBranches->pluck('id');
            $chainIds = Branch::whereIn('id', $branchIds)->pluck('chain_id');
            
            if (!$chainIds->contains($staff->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato a modificare questo staff'
                ], 403);
            }
        }

        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|required|string|max:255',
            'email' => ['sometimes', 'required', 'email', Rule::unique('users')->ignore($staff->id)],
            'password' => 'nullable|string|min:8',
            'phone' => 'nullable|string|max:15',
            'employee_code' => ['nullable', 'string', 'max:50', Rule::unique('users')->ignore($staff->id)],
            'hire_date' => 'sometimes|required|date',
            'termination_date' => 'nullable|date|after:hire_date',
            'emergency_contact' => 'nullable|array',
            'work_preferences' => 'nullable|array',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errori di validazione',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $updateData = $request->only([
                'name', 'email', 'phone', 'employee_code', 'hire_date', 
                'termination_date', 'emergency_contact', 'work_preferences'
            ]);

            if ($request->password) {
                $updateData['password'] = Hash::make($request->password);
            }

            $staff->update($updateData);

            return response()->json([
                'success' => true,
                'message' => 'Staff aggiornato con successo',
                'data' => $staff->load('chain')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante l\'aggiornamento dello staff',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Elimina staff
     * DELETE /api/v1/staff/{id}
     */
    public function destroy($id): JsonResponse
    {
        $user = Auth::user();
        
        $staff = User::where('role', 'staff')->find($id);
        
        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Staff non trovato'
            ], 404);
        }

        // Solo admin può eliminare completamente lo staff
        if ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Solo gli amministratori possono eliminare completamente lo staff'
            ], 403);
        }

        try {
            $chainId = $staff->chain_id;
            $staff->delete();

            // Aggiorna conteggio staff
            $this->updateChainStaffCount($chainId);

            return response()->json([
                'success' => true,
                'message' => 'Staff eliminato con successo'
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante l\'eliminazione dello staff',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Termina rapporto di lavoro (soft delete)
     * POST /api/v1/staff/{id}/terminate
     */
    public function terminate(Request $request, $id): JsonResponse
    {
        $user = Auth::user();
        
        $staff = User::where('role', 'staff')->find($id);
        
        if (!$staff) {
            return response()->json([
                'success' => false,
                'message' => 'Staff non trovato'
            ], 404);
        }

        // Verifica autorizzazioni
        if (!in_array($user->role, ['admin', 'chain_owner', 'branch_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a terminare il rapporto di lavoro'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'termination_date' => 'required|date',
            'reason' => 'nullable|string|max:500',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Errori di validazione',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $staff->update([
                'termination_date' => $request->termination_date,
                // Salva la ragione nelle work_preferences per ora
                'work_preferences' => array_merge($staff->work_preferences ?? [], [
                    'termination_reason' => $request->reason
                ])
            ]);

            // Aggiorna conteggio staff
            $this->updateChainStaffCount($staff->chain_id);

            return response()->json([
                'success' => true,
                'message' => 'Rapporto di lavoro terminato con successo',
                'data' => $staff->load('chain')
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore durante la terminazione del rapporto',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Lista staff per una filiale specifica
     * GET /api/v1/branches/{id}/staff
     */
    public function getByBranch(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        
        // Autorizzazione per ruoli
        if (!in_array($user->role, ['admin', 'chain_owner', 'branch_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato ad accedere al personale'
            ], 403);
        }

        // Verifica che la branch esista
        $branch = Branch::find($branchId);
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale non trovata'
            ], 404);
        }

        // Verifica autorizzazioni specifiche
        if ($user->role === 'chain_owner') {
            // Chain owner può accedere solo alle branch delle proprie catene
            $userChainIds = $user->ownedChains->pluck('id');
            if (!$userChainIds->contains($branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato ad accedere a questa filiale'
                ], 403);
            }
        } elseif ($user->role === 'branch_manager') {
            // Branch manager può accedere solo alle branch che gestisce
            $managedBranchIds = $user->managedBranches->pluck('id');
            if (!$managedBranchIds->contains($branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato ad accedere a questa filiale'
                ], 403);
            }
        }

        // Recupera staff assegnato alla filiale tramite pivot user_branches
        $perPage = intval($request->per_page ?? 15);
        $perPage = $perPage > 0 ? min($perPage, 100) : 15;

        $query = \DB::table('user_branches')
            ->join('users', 'users.id', '=', 'user_branches.user_id')
            ->where('user_branches.branch_id', $branchId)
            ->select(
                'users.id',
                'users.name',
                'users.email',
                'users.phone',
                'users.employee_code',
                'users.created_at',
                'user_branches.role_at_branch',
                'user_branches.permissions'
            );

        if ($request->search) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('users.name', 'ILIKE', "%{$search}%")
                  ->orWhere('users.email', 'ILIKE', "%{$search}%")
                  ->orWhere('users.employee_code', 'ILIKE', "%{$search}%");
            });
        }

        $paginator = $query->orderBy('users.name')
            ->paginate($perPage);

        // Trasforma permissions da JSON (oggetto) a array di chiavi abilitate
        $collection = $paginator->getCollection()->transform(function ($row) {
            $perms = [];
            if (!empty($row->permissions)) {
                $decoded = is_string($row->permissions) ? json_decode($row->permissions, true) : $row->permissions;
                if (is_array($decoded)) {
                    foreach ($decoded as $key => $val) {
                        if ($val === true) {
                            $perms[] = $key;
                        }
                    }
                }
            }
            return [
                'id' => $row->id,
                'name' => $row->name,
                'email' => $row->email,
                'phone' => $row->phone,
                'employee_code' => $row->employee_code,
                'created_at' => $row->created_at,
                'role' => $row->role_at_branch,
                'permissions' => $perms,
            ];
        });

        // Sostituisci la collection trasformata nel paginator
        $paginator->setCollection($collection);

        return response()->json([
            'success' => true,
            'data' => $paginator,
            'branch' => $branch->load('chain')
        ]);
    }

    /**
     * Aggiorna conteggio staff per tutte le filiali di una catena
     */
    private function updateChainStaffCount($chainId): void
    {
        $activeStaffCount = User::where('role', 'staff')
                               ->where('chain_id', $chainId)
                               ->whereNull('termination_date')
                               ->count();

        // Aggiorna tutte le filiali della catena
        Branch::where('chain_id', $chainId)
              ->update(['staff_count' => $activeStaffCount]);
    }
}