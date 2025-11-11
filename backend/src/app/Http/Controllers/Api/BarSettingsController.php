<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BarSetting;
use App\Models\Bar;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Validation\Rule;

class BarSettingsController extends Controller
{
    /**
     * Ottieni tutti i bar (solo per admin)
     */
    public function getAllBars(Request $request): JsonResponse
    {
        // Solo gli admin possono vedere tutti i bar
        $user = $request->user();
        if (!$user || $user->role !== 'admin') {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        $bars = Bar::with(['user:id,name,email,phone'])
                   ->orderBy('name')
                   ->get();

        return response()->json([
            'success' => true,
            'data' => $bars
        ]);
    }

    /**
     * Ottieni tutte le impostazioni di un bar
     */
    public function index(Request $request, int $barId): JsonResponse
    {
        $request->validate([
            'category' => 'sometimes|string'
        ]);

        // Verifica che il bar esista
        $bar = Bar::findOrFail($barId);

        // Verifica i permessi (proprietario del bar o admin)
        $user = $request->user();
        if (!$user || ($user->role !== 'admin' && $bar->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        $query = BarSetting::forBar($barId);

        // Filtra per categoria se specificata
        if ($request->has('category')) {
            $query->byCategory($request->category);
        }

        $settings = $query->get()->groupBy('category');

        return response()->json([
            'success' => true,
            'data' => $settings
        ]);
    }

    /**
     * Ottieni un'impostazione specifica di un bar
     */
    public function show(Request $request, int $barId, string $key): JsonResponse
    {
        $bar = Bar::findOrFail($barId);

        // Verifica i permessi
        $user = $request->user();
        if (!$user || ($user->role !== 'admin' && $bar->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        $setting = BarSetting::where('bar_id', $barId)->where('key', $key)->first();

        if (!$setting) {
            return response()->json([
                'success' => false,
                'message' => 'Impostazione non trovata'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => $setting
        ]);
    }

    /**
     * Aggiorna un'impostazione di un bar
     */
    public function update(Request $request, int $barId, string $key): JsonResponse
    {
        $bar = Bar::findOrFail($barId);

        // Verifica i permessi
        $user = $request->user();
        if (!$user || ($user->role !== 'admin' && $bar->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        $request->validate([
            'value' => 'required',
            'name' => 'sometimes|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => ['sometimes', Rule::in(['string', 'json', 'boolean', 'number'])],
            'category' => 'sometimes|string|max:100',
            'is_encrypted' => 'sometimes|boolean'
        ]);

        $setting = BarSetting::updateOrCreate(
            ['bar_id' => $barId, 'key' => $key],
            $request->only(['value', 'name', 'description', 'type', 'category', 'is_encrypted'])
        );

        return response()->json([
            'success' => true,
            'message' => 'Impostazione aggiornata con successo',
            'data' => $setting
        ]);
    }

    /**
     * Crea una nuova impostazione per un bar
     */
    public function store(Request $request, int $barId): JsonResponse
    {
        $bar = Bar::findOrFail($barId);

        // Verifica i permessi
        $user = $request->user();
        if (!$user || ($user->role !== 'admin' && $bar->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        $request->validate([
            'key' => [
                'required',
                'string',
                'max:255',
                Rule::unique('bar_settings')->where('bar_id', $barId)
            ],
            'value' => 'required',
            'name' => 'required|string|max:255',
            'description' => 'sometimes|string|max:1000',
            'type' => ['required', Rule::in(['string', 'json', 'boolean', 'number'])],
            'category' => 'required|string|max:100',
            'is_encrypted' => 'sometimes|boolean'
        ]);

        $setting = BarSetting::create(array_merge(
            $request->all(),
            ['bar_id' => $barId]
        ));

        return response()->json([
            'success' => true,
            'message' => 'Impostazione creata con successo',
            'data' => $setting
        ], 201);
    }

    /**
     * Elimina un'impostazione di un bar
     */
    public function destroy(Request $request, int $barId, string $key): JsonResponse
    {
        $bar = Bar::findOrFail($barId);

        // Verifica i permessi
        $user = $request->user();
        if (!$user || ($user->role !== 'admin' && $bar->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        $setting = BarSetting::where('bar_id', $barId)->where('key', $key)->first();

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
     * Aggiorna multiple impostazioni di un bar
     */
    public function batchUpdate(Request $request, int $barId): JsonResponse
    {
        $bar = Bar::findOrFail($barId);

        // Verifica i permessi
        $user = $request->user();
        if (!$user || ($user->role !== 'admin' && $bar->user_id !== $user->id)) {
            return response()->json([
                'success' => false,
                'message' => 'Accesso negato'
            ], 403);
        }

        $request->validate([
            'settings' => 'required|array',
            'settings.*.key' => 'required|string',
            'settings.*.value' => 'required'
        ]);

        $updatedSettings = [];

        foreach ($request->settings as $settingData) {
            $setting = BarSetting::updateOrCreate(
                ['bar_id' => $barId, 'key' => $settingData['key']],
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
     * Inizializza impostazioni predefinite per un nuovo bar
     */
    public function initializeDefaults(int $barId): JsonResponse
    {
        $bar = Bar::findOrFail($barId);

        $defaultSettings = [
            // Stripe Settings for Bar
            [
                'key' => 'stripe_account_id',
                'value' => '',
                'type' => 'string',
                'category' => 'stripe',
                'name' => 'Stripe Account ID',
                'description' => 'ID account Stripe Connect del bar',
                'is_encrypted' => false
            ],
            [
                'key' => 'stripe_onboarding_completed',
                'value' => false,
                'type' => 'boolean',
                'category' => 'stripe',
                'name' => 'Onboarding Stripe Completato',
                'description' => 'Indica se il bar ha completato l\'onboarding Stripe',
                'is_encrypted' => false
            ],

            // Social Settings for Bar
            [
                'key' => 'facebook_page_url',
                'value' => '',
                'type' => 'string',
                'category' => 'social',
                'name' => 'Pagina Facebook',
                'description' => 'URL della pagina Facebook del bar',
                'is_encrypted' => false
            ],
            [
                'key' => 'instagram_profile',
                'value' => '',
                'type' => 'string',
                'category' => 'social',
                'name' => 'Profilo Instagram',
                'description' => 'Username Instagram del bar',
                'is_encrypted' => false
            ],

            // Notification Settings
            [
                'key' => 'push_notifications_enabled',
                'value' => true,
                'type' => 'boolean',
                'category' => 'notifications',
                'name' => 'Notifiche Push Abilitate',
                'description' => 'Abilita notifiche push per il bar',
                'is_encrypted' => false
            ],
            [
                'key' => 'email_notifications_enabled',
                'value' => true,
                'type' => 'boolean',
                'category' => 'notifications',
                'name' => 'Notifiche Email Abilitate',
                'description' => 'Abilita notifiche email per il bar',
                'is_encrypted' => false
            ],

            // Custom Commission (overrides system default)
            [
                'key' => 'custom_commission_rate',
                'value' => '',
                'type' => 'number',
                'category' => 'commissions',
                'name' => 'Commissione Personalizzata',
                'description' => 'Commissione specifica per questo bar (se diversa dal default)',
                'is_encrypted' => false
            ]
        ];

        $createdSettings = [];
        foreach ($defaultSettings as $settingData) {
            $setting = BarSetting::firstOrCreate(
                ['bar_id' => $barId, 'key' => $settingData['key']],
                $settingData
            );
            $createdSettings[] = $setting;
        }

        return response()->json([
            'success' => true,
            'message' => 'Impostazioni predefinite inizializzate con successo',
            'data' => $createdSettings
        ]);
    }
}