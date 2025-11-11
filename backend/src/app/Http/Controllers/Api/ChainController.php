<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Chain;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class ChainController extends Controller
{
    /**
     * Lista catene del titolare
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        
        // Solo chain_owner può vedere le proprie catene
        if (!$user->isChainOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato: solo i proprietari di catena possono accedere'
            ], 403);
        }

        $chains = Chain::where('owner_id', $user->id)
                      ->with(['branches'])
                      ->orderBy('name')
                      ->get();

        return response()->json([
            'success' => true,
            'data' => $chains
        ]);
    }

    /**
     * Crea nuova catena
     */
    public function store(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user->isChainOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato: solo i proprietari di catena possono creare nuove catene'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'vat_number' => 'nullable|string|max:50|unique:chains,vat_number',
            'tax_code' => 'nullable|string|max:50',
            'legal_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'pec_email' => 'nullable|email',
            'website' => 'nullable|url',
            'payment_mode' => ['nullable', Rule::in(['unified', 'separate'])],
            'commission_rate' => 'nullable|numeric|between:0,50',
        ]);

        $validated['owner_id'] = $user->id;

        $chain = Chain::create($validated);

        return response()->json([
            'success' => true,
            'data' => $chain,
            'message' => 'Catena creata con successo'
        ], 201);
    }

    /**
     * Mostra dettagli catena specifica
     */
    public function show(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $chain = Chain::with(['owner', 'branches.activeManagers.user'])
                     ->findOrFail($id);

        // Controllo accesso: solo il proprietario o admin
        if (!$user->isAdmin() && $chain->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato: non puoi accedere a questa catena'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $chain
        ]);
    }

    /**
     * Aggiorna catena
     */
    public function update(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $chain = Chain::findOrFail($id);

        // Controllo accesso
        if (!$user->isAdmin() && $chain->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato: non puoi modificare questa catena'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|string|max:255',
            'business_name' => 'nullable|string|max:255',
            'vat_number' => ['nullable', 'string', 'max:50', Rule::unique('chains')->ignore($chain->id)],
            'tax_code' => 'nullable|string|max:50',
            'legal_address' => 'nullable|string',
            'billing_address' => 'nullable|string',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'pec_email' => 'nullable|email',
            'website' => 'nullable|url',
            'payment_mode' => ['nullable', Rule::in(['unified', 'separate'])],
            'commission_rate' => 'nullable|numeric|between:0,50',
            'status' => ['nullable', Rule::in(['active', 'suspended', 'closed'])],
        ]);

        $chain->update($validated);

        return response()->json([
            'success' => true,
            'data' => $chain->fresh(),
            'message' => 'Catena aggiornata con successo'
        ]);
    }

    /**
     * Elimina catena
     */
    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = $request->user();
        
        $chain = Chain::findOrFail($id);

        // Controllo accesso
        if (!$user->isAdmin() && $chain->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato: non puoi eliminare questa catena'
            ], 403);
        }

        // Verifica che non ci siano filiali attive
        if ($chain->branches()->where('status', 'active')->count() > 0) {
            return response()->json([
                'success' => false,
                'message' => 'Impossibile eliminare: la catena ha filiali attive'
            ], 400);
        }

        $chain->delete();

        return response()->json([
            'success' => true,
            'message' => 'Catena eliminata con successo'
        ]);
    }
}
