<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use App\Models\Chain;

class ChainImageController extends Controller
{
    /**
     * Upload logo della catena
     */
    public function uploadLogo(Request $request, $chainId)
    {
        $request->validate([
            'logo' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        $user = Auth::user();
        $chain = Chain::findOrFail($chainId);

        // Verifica che l'utente sia il proprietario della catena
        if ($user->role !== 'chain_owner' || $chain->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        try {
            // Elimina il logo precedente se esiste
            if ($chain->brand_logo_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $chain->brand_logo_path));
            }

            // Upload del nuovo logo
            $file = $request->file('logo');
            $filename = 'chain_' . $chainId . '_logo_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('chains/logos', $filename, 'public');

            // Aggiorna il database
            $chain->update([
                'brand_logo_path' => '/storage/' . $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Logo caricato con successo',
                'data' => [
                    'logo_url' => '/storage/' . $path
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Upload cover image della catena
     */
    public function uploadCover(Request $request, $chainId)
    {
        $request->validate([
            'cover' => 'required|image|mimes:jpeg,png,jpg,gif|max:5120', // 5MB max
        ]);

        $user = Auth::user();
        $chain = Chain::findOrFail($chainId);

        // Verifica che l'utente sia il proprietario della catena
        if ($user->role !== 'chain_owner' || $chain->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        try {
            // Elimina la cover precedente se esiste
            if ($chain->cover_image_path) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $chain->cover_image_path));
            }

            // Upload della nuova cover
            $file = $request->file('cover');
            $filename = 'chain_' . $chainId . '_cover_' . time() . '.' . $file->getClientOriginalExtension();
            $path = $file->storeAs('chains/covers', $filename, 'public');

            // Aggiorna il database
            $chain->update([
                'cover_image_path' => '/storage/' . $path
            ]);

            return response()->json([
                'success' => true,
                'message' => 'Cover caricata con successo',
                'data' => [
                    'cover_url' => '/storage/' . $path
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Ottieni le immagini della catena
     */
    public function getImages($chainId)
    {
        $user = Auth::user();
        $chain = Chain::findOrFail($chainId);

        // Verifica che l'utente sia il proprietario della catena
        if ($user->role !== 'chain_owner' || $chain->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'logo_url' => $chain->brand_logo_path,
                'cover_url' => $chain->cover_image_path,
                'legacy_logo_url' => $chain->logo_path // logo vecchio se esiste
            ]
        ]);
    }
}
