<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class SystemSettingsController extends Controller
{
    /**
     * Ottieni tutte le impostazioni di sistema (solo quelle pubbliche per utenti normali)
     */
    public function index(Request $request): JsonResponse
    {
        $request->validate([
            'category' => 'sometimes|string',
            'public_only' => 'sometimes|boolean'
        ]);

        $query = SystemSetting::query();

        // Filtra per categoria se specificata
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        // Se non è admin, mostra solo le impostazioni pubbliche
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            $query->public();
        }

        $settings = $query->get();

        return response()->json([
            'success' => true,
            'data' => $settings->groupBy('category')
        ]);
    }

    /**
     * Ottieni un'impostazione specifica per chiave
     */
    public function show(Request $request, string $key): JsonResponse
    {
        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Impostazione non trovata'
            ], 404);
        }

        // Controlla i permessi per impostazioni private
        $user = $request->user();
        if (!$setting->is_public && (!$user || $user->role !== 'admin')) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => $setting
        ]);
    }

    /**
     * Aggiorna un'impostazione (solo admin)
     */
    public function update(Request $request, string $key): JsonResponse
    {
        // Solo admin possono modificare le impostazioni
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato. Solo gli amministratori possono modificare le impostazioni.'
            ], 403);
        }

        $request->validate([
            'value' => 'required',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => ['sometimes', Rule::in(['string', 'json', 'boolean', 'number'])],
            'category' => 'sometimes|string|max:100',
            'is_encrypted' => 'sometimes|boolean',
            'is_public' => 'sometimes|boolean'
        ]);

        $setting = SystemSetting::updateOrCreate(
            ['key' => $key],
            $request->only(['value', 'name', 'description', 'type', 'category', 'is_encrypted', 'is_public'])
        );

        return response()->json([
            'success' => true,
            'message' => 'Impostazione aggiornata con successo',
            'data' => $setting
        ]);
    }

    /**
     * Crea una nuova impostazione (solo admin)
     */
    public function store(Request $request): JsonResponse
    {
        // Solo admin possono creare impostazioni
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato. Solo gli amministratori possono creare impostazioni.'
            ], 403);
        }

        $request->validate([
            'key' => 'required|string|max:255|unique:system_settings,key',
            'value' => 'required',
            'name' => 'required|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => ['required', Rule::in(['string', 'json', 'boolean', 'number'])],
            'category' => 'required|string|max:100',
            'is_encrypted' => 'sometimes|boolean',
            'is_public' => 'sometimes|boolean'
        ]);

        $setting = SystemSetting::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Impostazione creata con successo',
            'data' => $setting
        ], 201);
    }

    /**
     * Elimina un'impostazione (solo admin)
     */
    public function destroy(Request $request, string $key): JsonResponse
    {
        // Solo admin possono eliminare impostazioni
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato. Solo gli amministratori possono eliminare impostazioni.'
            ], 403);
        }

        $setting = SystemSetting::where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Impostazione non trovata'
            ], 404);
        }

        $setting->delete();

        return response()->json([
            'success' => true,
            'message' => 'Impostazione eliminata con successo'
        ]);
    }

    /**
     * Aggiorna multiple impostazioni in batch (solo admin)
     */
    public function batchUpdate(Request $request): JsonResponse
    {
        // Solo admin possono modificare le impostazioni
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato. Solo gli amministratori possono modificare le impostazioni.'
            ], 403);
        }

        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required'
        ]);

        $updatedSettings = [];

        foreach ($request->settings as $settingData) {
            $setting = SystemSetting::updateOrCreate(
                ['key' => $settingData['key']],
                ['value' => $settingData['value']]
            );
            $updatedSettings[] = $setting;
        }

        return response()->json([
            'success' => true,
            'message' => 'Impostazioni aggiornate con successo',
            'data' => $updatedSettings
        ]);
    }

    /**
     * Ottieni impostazioni pubbliche per il frontend
     */
    public function publicSettings(): JsonResponse
    {
        $settings = SystemSetting::public()->get()->groupBy('category');

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Ottieni configurazione Google Maps pubblica per il frontend
     */
    public function googleMapsConfig(): JsonResponse
    {
        $apiKey = SystemSetting::where('category', 'google_maps')
            ->where('key', 'google_maps_api_key')
            ->where('is_public', true)
            ->first();

        return response()->json([
            'api_key' => $apiKey ? $apiKey->value : null
        ]);
    }

    /**
     * Ottieni configurazione Stripe pubblica per il frontend
     */
    public function stripeConfig(): JsonResponse
    {
        $publishableKey = SystemSetting::where('key', 'stripe_publishable_key')
            ->first();

        return response()->json([
            'publishable_key' => $publishableKey ? $publishableKey->value : null
        ]);
    }
}