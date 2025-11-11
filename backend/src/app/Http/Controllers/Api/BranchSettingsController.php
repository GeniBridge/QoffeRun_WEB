<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Branch;
use App\Models\BranchSettings;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;

class BranchSettingsController extends Controller
{
    /**
     * Get all settings for a branch
     */
    public function index(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        // Check authorization
        if (!$this->canAccessBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato ad accedere alle impostazioni di questa filiale'
            ], 403);
        }

        $settings = $branch->settings()->get();
        
        // Convert to key-value pairs
        $settingsData = [];
        foreach ($settings as $setting) {
            $settingsData[$setting->key] = [
                'value' => $setting->value,
                'type' => $setting->type,
                'updated_at' => $setting->updated_at
            ];
        }

        return response()->json([
            'success' => true,
            'data' => $settingsData,
            'branch' => [
                'id' => $branch->id,
                'name' => $branch->name,
                'code' => $branch->code
            ]
        ]);
    }

    /**
     * Update or create a specific setting
     */
    public function updateSetting(Request $request, $branchId, $key): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        if (!$this->canManageBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare le impostazioni di questa filiale'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'value' => 'required',
            'type' => 'nullable|in:string,number,boolean,json,encrypted'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $setting = $branch->settings()->updateOrCreate(
            ['key' => $key],
            [
                'value' => $request->value,
                'type' => $request->type ?? 'string'
            ]
        );

        return response()->json([
            'success' => true,
            'message' => 'Impostazione aggiornata con successo',
            'data' => [
                'key' => $setting->key,
                'value' => $setting->value,
                'type' => $setting->type
            ]
        ]);
    }

    /**
     * Update multiple settings at once
     */
    public function batchUpdate(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        if (!$this->canManageBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare le impostazioni di questa filiale'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'settings' => 'required|array',
            'settings.*.key' => 'required|string|max:255',
            'settings.*.value' => 'required',
            'settings.*.type' => 'nullable|in:string,number,boolean,json,encrypted'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $updatedSettings = [];
        
        foreach ($request->settings as $settingData) {
            $setting = $branch->settings()->updateOrCreate(
                ['key' => $settingData['key']],
                [
                    'value' => $settingData['value'],
                    'type' => $settingData['type'] ?? 'string'
                ]
            );
            
            $updatedSettings[] = [
                'key' => $setting->key,
                'value' => $setting->value,
                'type' => $setting->type
            ];
        }

        return response()->json([
            'success' => true,
            'message' => 'Impostazioni aggiornate con successo',
            'data' => $updatedSettings
        ]);
    }

    /**
     * Get Stripe Connect configuration
     */
    public function getStripeConfig(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        if (!$this->canAccessBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        $stripeSettings = $branch->settings()
            ->where('key', 'like', 'stripe_%')
            ->get()
            ->keyBy('key')
            ->mapWithKeys(function ($setting) {
                return [str_replace('stripe_', '', $setting->key) => $setting->typed_value];
            });

        // Default values if not set
        $defaultStripeConfig = [
            'account_id' => '',
            'onboarding_completed' => false,
            'charges_enabled' => false,
            'payouts_enabled' => false,
            'commission_rate' => 3.5
        ];

        $stripeConfig = array_merge($defaultStripeConfig, $stripeSettings->toArray());

        return response()->json([
            'success' => true,
            'data' => $stripeConfig
        ]);
    }

    /**
     * Get opening hours configuration
     */
    public function getOpeningHours(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        if (!$this->canAccessBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        $hoursSettings = $branch->settings()
            ->where('key', 'like', 'hours_%')
            ->get()
            ->keyBy('key')
            ->mapWithKeys(function ($setting) {
                return [str_replace('hours_', '', $setting->key) => $setting->typed_value];
            });

        $defaultHours = [
            'monday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
            'tuesday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
            'wednesday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
            'thursday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
            'friday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
            'saturday' => ['open' => '08:00', 'close' => '20:00', 'closed' => false],
            'sunday' => ['open' => '09:00', 'close' => '19:00', 'closed' => false]
        ];

        $hours = array_merge($defaultHours, $hoursSettings->toArray());

        return response()->json([
            'success' => true,
            'data' => $hours
        ]);
    }

    /**
     * Get fiscal data configuration
     */
    public function getFiscalData(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        if (!$this->canAccessBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        $fiscalSettings = $branch->settings()
            ->whereIn('key', [
                'fiscal_business_name',
                'fiscal_vat_number', 
                'fiscal_tax_code',
                'fiscal_sdi_code',
                'fiscal_pec_email',
                'fiscal_legal_address',
                'fiscal_billing_address',
                'fiscal_use_chain_defaults'
            ])
            ->get()
            ->keyBy('key');

        // Get chain defaults for comparison
        $chainDefaults = [
            'business_name' => $branch->chain->business_name,
            'vat_number' => $branch->chain->vat_number,
            'tax_code' => $branch->chain->tax_code,
            'pec_email' => $branch->chain->pec_email,
            'legal_address' => $branch->chain->legal_address,
            'billing_address' => $branch->chain->billing_address
        ];

        return response()->json([
            'success' => true,
            'data' => [
                'business_name' => $fiscalSettings['fiscal_business_name']->value ?? null,
                'vat_number' => $fiscalSettings['fiscal_vat_number']->value ?? null,
                'tax_code' => $fiscalSettings['fiscal_tax_code']->value ?? null,
                'sdi_code' => $fiscalSettings['fiscal_sdi_code']->value ?? null,
                'pec_email' => $fiscalSettings['fiscal_pec_email']->value ?? null,
                'legal_address' => $fiscalSettings['fiscal_legal_address']->value ?? null,
                'billing_address' => $fiscalSettings['fiscal_billing_address']->value ?? null,
                'use_chain_defaults' => $fiscalSettings['fiscal_use_chain_defaults']->value ?? true
            ],
            'chain_defaults' => $chainDefaults
        ]);
    }

    /**
     * Get fiscal data from other branches for copying
     */
    public function getChainBranchesFiscalData(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        if (!$this->canAccessBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        // Get all branches in the same chain
        $chainBranches = Branch::where('chain_id', $branch->chain_id)
            ->where('id', '!=', $branchId)
            ->with(['settings' => function($query) {
                $query->whereIn('key', [
                    'fiscal_business_name',
                    'fiscal_vat_number', 
                    'fiscal_tax_code',
                    'fiscal_sdi_code',
                    'fiscal_pec_email',
                    'fiscal_legal_address',
                    'fiscal_billing_address'
                ]);
            }])
            ->get();

        $branchesData = [];
        foreach ($chainBranches as $chainBranch) {
            $settings = $chainBranch->settings->keyBy('key');
            
            // Only include branches that have custom fiscal data
            if ($settings->count() > 0) {
                $branchesData[] = [
                    'id' => $chainBranch->id,
                    'name' => $chainBranch->name,
                    'code' => $chainBranch->code,
                    'fiscal_data' => [
                        'business_name' => $settings['fiscal_business_name']->value ?? null,
                        'vat_number' => $settings['fiscal_vat_number']->value ?? null,
                        'tax_code' => $settings['fiscal_tax_code']->value ?? null,
                        'sdi_code' => $settings['fiscal_sdi_code']->value ?? null,
                        'pec_email' => $settings['fiscal_pec_email']->value ?? null,
                        'legal_address' => $settings['fiscal_legal_address']->value ?? null,
                        'billing_address' => $settings['fiscal_billing_address']->value ?? null
                    ]
                ];
            }
        }

        return response()->json([
            'success' => true,
            'data' => $branchesData
        ]);
    }

    /**
     * Copy fiscal data from another branch
     */
    public function copyFiscalData(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        $branch = Branch::findOrFail($branchId);
        
        if (!$this->canManageBranch($user, $branch)) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato a modificare le impostazioni di questa filiale'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'source_branch_id' => 'required|exists:branches,id',
            'copy_fields' => 'required|array',
            'copy_fields.*' => 'in:business_name,vat_number,tax_code,sdi_code,pec_email,legal_address,billing_address'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $sourceBranch = Branch::findOrFail($request->source_branch_id);
        
        // Check that source branch is in the same chain
        if ($sourceBranch->chain_id !== $branch->chain_id) {
            return response()->json([
                'success' => false,
                'message' => 'Puoi copiare dati solo da filiali della stessa catena'
            ], 422);
        }

        // Get source fiscal data
        $sourceSettings = $sourceBranch->settings()
            ->whereIn('key', array_map(fn($field) => 'fiscal_' . $field, $request->copy_fields))
            ->get()
            ->keyBy('key');

        // Copy selected fields
        $copiedSettings = [];
        foreach ($request->copy_fields as $field) {
            $sourceKey = 'fiscal_' . $field;
            $targetKey = 'fiscal_' . $field;
            
            if (isset($sourceSettings[$sourceKey])) {
                $setting = $branch->settings()->updateOrCreate(
                    ['key' => $targetKey],
                    [
                        'value' => $sourceSettings[$sourceKey]->value,
                        'type' => $sourceSettings[$sourceKey]->type
                    ]
                );
                
                $copiedSettings[] = [
                    'key' => $field,
                    'value' => $setting->value
                ];
            }
        }

        return response()->json([
            'success' => true,
            'message' => 'Dati fiscali copiati con successo',
            'data' => $copiedSettings
        ]);
    }

    /**
     * Check if user can access branch settings
     */
    private function canAccessBranch($user, $branch): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        
        if ($user->role === 'chain_owner') {
            return $branch->chain->owner_id === $user->id;
        }
        
        if ($user->role === 'branch_manager') {
            return $branch->managers()->where('user_id', $user->id)->exists();
        }
        
        return false;
    }

    /**
     * Check if user can manage branch settings
     */
    private function canManageBranch($user, $branch): bool
    {
        if ($user->role === 'admin') {
            return true;
        }
        
        if ($user->role === 'chain_owner') {
            return $branch->chain->owner_id === $user->id;
        }
        
        if ($user->role === 'branch_manager') {
            $manager = $branch->managers()
                ->where('user_id', $user->id)
                ->first();
            return $manager && $manager->can_manage_settings;
        }
        
        return false;
    }
}