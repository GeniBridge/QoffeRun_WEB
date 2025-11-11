<?php

namespace App\Http\Controllers;

use App\Models\SystemSetting;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;

class SystemLogoController extends Controller
{
    /**
     * Upload system logo
     */
    public function uploadLogo(Request $request): JsonResponse
    {
        // TODO: Add admin authorization check
        // $this->authorize('admin');

        $validator = Validator::make($request->all(), [
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Errore di validazione',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $file = $request->file('logo');
            $filename = 'qofferun-logo.' . $file->getClientOriginalExtension();
            
            // Save the file to Laravel storage (so we keep an original copy)
            $path = $file->storeAs('public/system/logos', $filename);

            // Ensure storage directory exists (storeAs should create it, but be defensive)
            if (!Storage::exists('public/system/logos')) {
                Storage::makeDirectory('public/system/logos');
            }

            // Public-facing URL that frontends will use. Store the file in
            // storage/app/public/system/logos and expose it via the
            // storage symlink (public/storage). Build a fully-qualified URL
            // so frontends (served from other hosts) can load the image.
            $appUrl = config('app.url') ?: $request->getSchemeAndHttpHost();
            $appUrl = rtrim($appUrl, '/');
            $logoPath = $appUrl . '/storage/system/logos/' . $filename;
            
            SystemSetting::updateOrCreate(
                ['key' => 'system_logo_path'],
                [
                    'value' => $logoPath,
                    'description' => 'Percorso del logo di sistema'
                ]
            );

            // Optionally also copy into the backend's public assets folder to
            // support any local static-serving fallback. This is not relied
            // upon by frontends; they will use the storage URL above.
            $publicPath = public_path('assets/logos/' . $filename);
            $publicDir = dirname($publicPath);
            if (!is_dir($publicDir)) {
                mkdir($publicDir, 0755, true);
            }
            try {
                $file->move($publicDir, basename($publicPath));
            } catch (\Exception $e) {
                // Non-fatal: log and continue. The primary public URL is the
                // storage-based URL saved in settings.
                \Log::warning('Could not copy logo to backend public assets: ' . $e->getMessage());
            }

            return response()->json([
                'message' => 'Logo caricato con successo',
                'logo_path' => $logoPath,
                'public_path' => '/assets/logos/' . $filename
            ]);

        } catch (\Exception $e) {
            \Log::error('Logo upload error: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Errore durante il caricamento del logo',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get current logo path
     */
    public function getCurrentLogo(): JsonResponse
    {
        $setting = SystemSetting::where('key', 'system_logo_path')->first();
        
        return response()->json([
            'logo_path' => $setting ? $setting->value : '/assets/logos/qofferun-logo.png'
        ]);
    }
}