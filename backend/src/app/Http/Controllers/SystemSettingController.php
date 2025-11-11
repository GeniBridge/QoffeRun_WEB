<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class SystemSettingController extends Controller
{
    /**
     * Get a specific system setting by key
     */
    public function show(string $key): JsonResponse
    {
        $setting = SystemSetting::where('key', $key)->first();
        
        if (!$setting) {
            return response()->json([
                'error' => 'Setting not found',
                'key' => $key
            ], 404);
        }

        return response()->json([
            'key' => $setting->key,
            'value' => $setting->value,
            'description' => $setting->description
        ]);
    }

    /**
     * Get all system settings
     */
    public function index(): JsonResponse
    {
        $settings = SystemSetting::all()->keyBy('key');
        
        return response()->json($settings);
    }

    /**
     * Update a system setting (admin only)
     */
    public function update(Request $request, string $key): JsonResponse
    {
        // TODO: Add admin authorization check
        // $this->authorize('admin');

        $request->validate([
            'value' => 'required|string',
            'description' => 'nullable|string'
        ]);

        $setting = SystemSetting::where('key', $key)->first();
        
        if (!$setting) {
            // Create new setting if it doesn't exist
            $setting = SystemSetting::create([
                'key' => $key,
                'value' => $request->value,
                'description' => $request->description
            ]);
        } else {
            $setting->update([
                'value' => $request->value,
                'description' => $request->description ?? $setting->description
            ]);
        }

        return response()->json([
            'message' => 'Setting updated successfully',
            'setting' => $setting
        ]);
    }
}