<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\Chain;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;

class BranchController extends Controller
{
    /**
     * Lista filiali della catena dell'utente autenticato
     * GET /api/v1/branches
     */
    public function index(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Chain Owner: vede tutte le filiali delle sue catene
        if ($user->role === 'chain_owner') {
            $chainIds = $user->ownedChains->pluck('id');
            $branches = Branch::with(['chain', 'managers.user'])
                ->whereIn('chain_id', $chainIds)
                ->when($request->chain_id, function ($query, $chainId) {
                    return $query->where('chain_id', $chainId);
                })
                ->when($request->status, function ($query, $status) {
                    return $query->where('status', $status);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }
        // Branch Manager: vede solo le sue filiali
        elseif ($user->role === 'branch_manager') {
            $branchIds = $user->managedBranches->pluck('id');
            $branches = Branch::with(['chain', 'managers.user'])
                ->whereIn('id', $branchIds)
                ->orderBy('created_at', 'desc')
                ->get();
        }
        // Admin: vede tutte
        elseif ($user->role === 'admin') {
            $branches = Branch::with(['chain', 'managers.user'])
                ->when($request->chain_id, function ($query, $chainId) {
                    return $query->where('chain_id', $chainId);
                })
                ->orderBy('created_at', 'desc')
                ->get();
        }
        else {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato ad accedere alle filiali'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $branches
        ]);
    }

    /**
     * Crea una nuova filiale
     * POST /api/v1/branches
     */
    public function store(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Solo chain_owner e admin possono creare filiali
        if (!in_array($user->role, ['chain_owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a creare filiali'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'chain_id' => 'required|exists:chains,id',
            'code' => 'required|string|max:50|unique:branches',
            'name' => 'required|string|max:255',
            // Legacy address fields (for backward compatibility)
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:5',
            'cap' => 'nullable|string|max:10',
            'region' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            // New standardized address fields
            'via' => 'required|string|max:255',
            'numero_civico' => 'nullable|string|max:20',
            'citta' => 'required|string|max:100',
            'provincia' => 'required|string|max:5',
            'regione' => 'nullable|string|max:100',
            'paese' => 'nullable|string|max:100',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            // Other fields
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:branches',
            'opening_hours' => 'nullable|array',
            'delivery_enabled' => 'boolean',
            'takeaway_enabled' => 'boolean',
            'table_service_enabled' => 'boolean',
            'seating_capacity' => 'nullable|integer|min:0',
            'status' => 'in:active,inactive,suspended',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        // Verifica che l'utente possa creare filiali per questa catena
        if ($user->role === 'chain_owner') {
            $chain = Chain::where('id', $request->chain_id)
                ->where('owner_id', $user->id)
                ->first();
                
            if (!$chain) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non puoi creare filiali per questa catena'
                ], 403);
            }
        }

        $branchData = $validator->validated();
        
        // Map new standardized fields to legacy fields for backward compatibility
        if (isset($branchData['via'])) {
            $branchData['address'] = $branchData['via'] . ' ' . ($branchData['numero_civico'] ?? '');
        }
        if (isset($branchData['citta'])) {
            $branchData['city'] = $branchData['citta'];
        }
        if (isset($branchData['provincia'])) {
            $branchData['province'] = $branchData['provincia'];
        }
        if (isset($branchData['regione'])) {
            $branchData['region'] = $branchData['regione'];
        }
        if (isset($branchData['paese'])) {
            $branchData['country'] = $branchData['paese'];
        }
        if (isset($branchData['lat'])) {
            $branchData['latitude'] = $branchData['lat'];
        }
        if (isset($branchData['lng'])) {
            $branchData['longitude'] = $branchData['lng'];
        }
        
        $branchData['country'] = $branchData['country'] ?? 'Italia';
        $branchData['status'] = $branchData['status'] ?? 'active';

        $branch = Branch::create($branchData);
        $branch->load(['chain', 'managers.user']);

        return response()->json([
            'success' => true,
            'message' => 'Filiale creata con successo',
            'data' => $branch
        ], 201);
    }

    /**
     * Mostra dettagli filiale specifica
     * GET /api/v1/branches/{id}
     */
    public function show(int $id): JsonResponse
    {
        $user = Auth::user();
        
        $branch = Branch::with(['chain', 'managers.user'])->find($id);
        
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale non trovata'
            ], 404);
        }

        // Controllo autorizzazioni
        $authorized = false;
        
        if ($user->role === 'admin') {
            $authorized = true;
        } elseif ($user->role === 'chain_owner') {
            $authorized = $user->ownedChains->contains($branch->chain_id);
        } elseif ($user->role === 'branch_manager') {
            $authorized = $user->managedBranches->contains($branch->id);
        }

        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a visualizzare questa filiale'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $branch
        ]);
    }

    /**
     * Aggiorna filiale
     * PUT/PATCH /api/v1/branches/{id}
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();
        
        $branch = Branch::find($id);
        
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale non trovata'
            ], 404);
        }

        // Controllo autorizzazioni
        $authorized = false;
        
        if ($user->role === 'admin') {
            $authorized = true;
        } elseif ($user->role === 'chain_owner') {
            $authorized = $user->ownedChains->contains($branch->chain_id);
        } elseif ($user->role === 'branch_manager') {
            // I branch manager possono aggiornare solo alcuni campi
            $authorized = $user->managedBranches->contains($branch->id);
        }

        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare questa filiale'
            ], 403);
        }

        $rules = [
            'name' => 'string|max:255',
            'code' => 'nullable|string|max:50|unique:branches,code,' . $branch->id . ',id',
            // Legacy address fields (for backward compatibility)
            'address' => 'nullable|string',
            'city' => 'nullable|string|max:100',
            'province' => 'nullable|string|max:5',
            'cap' => 'nullable|string|max:10',
            'region' => 'nullable|string|max:100',
            'country' => 'nullable|string|max:100',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            // New standardized address fields
            'via' => 'nullable|string|max:255',
            'numero_civico' => 'nullable|string|max:20',
            'citta' => 'nullable|string|max:100',
            'provincia' => 'nullable|string|max:5',
            'regione' => 'nullable|string|max:100',
            'paese' => 'nullable|string|max:100',
            'lat' => 'nullable|numeric|between:-90,90',
            'lng' => 'nullable|numeric|between:-180,180',
            // Other fields
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email|unique:branches,email,' . $branch->id,
            'opening_hours' => 'nullable|array',
            'delivery_enabled' => 'boolean',
            'takeaway_enabled' => 'boolean',
            'table_service_enabled' => 'boolean',
            'seating_capacity' => 'nullable|integer|min:0',
        ];

        // Solo chain_owner e admin possono modificare campi critici
        if (in_array($user->role, ['chain_owner', 'admin'])) {
            $rules['status'] = 'in:active,inactive,suspended';
            $rules['chain_id'] = 'exists:chains,id';
        }

        $validator = Validator::make($request->all(), $rules);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $updateData = $validator->validated();
        
        // Map new standardized fields to legacy fields for backward compatibility
        if (isset($updateData['via'])) {
            $updateData['address'] = $updateData['via'] . ' ' . ($updateData['numero_civico'] ?? '');
        }
        if (isset($updateData['citta'])) {
            $updateData['city'] = $updateData['citta'];
        }
        if (isset($updateData['provincia'])) {
            $updateData['province'] = $updateData['provincia'];
        }
        if (isset($updateData['regione'])) {
            $updateData['region'] = $updateData['regione'];
        }
        if (isset($updateData['paese'])) {
            $updateData['country'] = $updateData['paese'];
        }
        if (isset($updateData['lat'])) {
            $updateData['latitude'] = $updateData['lat'];
        }
        if (isset($updateData['lng'])) {
            $updateData['longitude'] = $updateData['lng'];
        }
        
        $branch->update($updateData);
        $branch->load(['chain', 'managers.user']);

        return response()->json([
            'success' => true,
            'message' => 'Filiale aggiornata con successo',
            'data' => $branch
        ]);
    }

    /**
     * Elimina filiale
     * DELETE /api/v1/branches/{id}
     */
    public function destroy(int $id): JsonResponse
    {
        $user = Auth::user();
        
        $branch = Branch::find($id);
        
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale non trovata'
            ], 404);
        }

        // Solo chain_owner e admin possono eliminare filiali
        if ($user->role === 'chain_owner') {
            if (!$user->ownedChains->contains($branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato a eliminare questa filiale'
                ], 403);
            }
        } elseif ($user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a eliminare filiali'
            ], 403);
        }

        $branchName = $branch->name;
        $branch->delete();

        return response()->json([
            'success' => true,
            'message' => "Filiale '{$branchName}' eliminata con successo"
        ]);
    }

    /**
     * Clona configurazione di una filiale
     * POST /api/v1/branches/{id}/clone
     */
    public function clone(Request $request, int $id): JsonResponse
    {
        $user = Auth::user();
        
        if (!in_array($user->role, ['chain_owner', 'admin'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a clonare filiali'
            ], 403);
        }

        $originalBranch = Branch::find($id);
        
        if (!$originalBranch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale originale non trovata'
            ], 404);
        }

        // Controllo autorizzazioni sulla filiale originale
        if ($user->role === 'chain_owner' && !$user->ownedChains->contains($originalBranch->chain_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a clonare questa filiale'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'code' => 'required|string|max:50|unique:branches',
            'name' => 'required|string|max:255',
            'address' => 'required|string',
            'city' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        // Clona la filiale con i nuovi dati base
        $newBranchData = $originalBranch->toArray();
        unset($newBranchData['id'], $newBranchData['created_at'], $newBranchData['updated_at']);
        
        $newBranchData = array_merge($newBranchData, $validator->validated());

        $newBranch = Branch::create($newBranchData);
        $newBranch->load(['chain', 'managers.user']);

        return response()->json([
            'success' => true,
            'message' => 'Filiale clonata con successo',
            'data' => $newBranch
        ], 201);
    }

    /**
     * Statistics per filiale
     * GET /api/v1/branches/{id}/stats
     */
    public function stats(int $id): JsonResponse
    {
        $user = Auth::user();
        
        $branch = Branch::find($id);
        
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale non trovata'
            ], 404);
        }

        // Controllo autorizzazioni
        $authorized = false;
        
        if ($user->role === 'admin') {
            $authorized = true;
        } elseif ($user->role === 'chain_owner') {
            $authorized = $user->ownedChains->contains($branch->chain_id);
        } elseif ($user->role === 'branch_manager') {
            $authorized = $user->managedBranches->contains($branch->id);
        }

        if (!$authorized) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a visualizzare le statistiche'
            ], 403);
        }

        // Qui andremo a implementare le statistiche reali
        // Per ora restituiamo dati mock
        $stats = [
            'orders_today' => rand(10, 50),
            'revenue_today' => number_format(rand(500, 2000), 2),
            'orders_this_month' => rand(300, 1000),
            'revenue_this_month' => number_format(rand(15000, 50000), 2),
            'active_staff' => $branch->staff_count,
            'customer_rating' => number_format(rand(40, 50) / 10, 1),
            'most_ordered_item' => 'Cappuccino',
            'peak_hours' => ['09:00-10:00', '14:00-15:00']
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'branch' => $branch,
                'statistics' => $stats
            ]
        ]);
    }

    /**
     * Cambia status filiale
     * PATCH /api/v1/branches/{id}/status
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

        $branch = Branch::find($id);
        
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale non trovata'
            ], 404);
        }

        if ($user->role === 'chain_owner' && !$user->ownedChains->contains($branch->chain_id)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare questa filiale'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'status' => 'required|in:active,inactive,suspended'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Status non valido',
                'errors' => $validator->errors()
            ], 422);
        }

        $oldStatus = $branch->status;
        $branch->update(['status' => $request->status]);

        return response()->json([
            'success' => true,
            'message' => "Status filiale cambiato da '{$oldStatus}' a '{$request->status}'",
            'data' => $branch
        ]);
    }
}