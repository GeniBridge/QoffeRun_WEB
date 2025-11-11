<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use App\Models\Chain;

class ChainImageGenericController extends Controller
{
    /**
     * Upload generico per immagini catena
     * POST /api/v1/chains/upload-image
     */
    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:5120', // 5MB max
            'type' => 'required|string|in:logo,cover,brand_logo',
            'chain_id' => 'required|exists:chains,id'
        ]);

        $user = Auth::user();
        $chainId = $request->chain_id;
        $imageType = $request->type;
        
        $chain = Chain::findOrFail($chainId);

        // Verifica che l'utente sia il proprietario della catena
        if ($user->role !== 'chain_owner' || $chain->owner_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        try {
            // Determina quale campo aggiornare nel database
            $dbField = match($imageType) {
                'logo', 'brand_logo' => 'brand_logo_path',
                'cover' => 'cover_image_path',
                default => throw new \InvalidArgumentException('Tipo immagine non supportato')
            };
            
            // Elimina l'immagine precedente se esiste
            $currentImagePath = $chain->{$dbField};
            if ($currentImagePath) {
                Storage::disk('public')->delete(str_replace('/storage/', '', $currentImagePath));
            }

            // Upload della nuova immagine
            $file = $request->file('image');
            $filename = 'chain_' . $chainId . '_' . $imageType . '_' . time() . '.' . $file->getClientOriginalExtension();
            $folder = $imageType === 'cover' ? 'chains/covers' : 'chains/logos';
            $path = $file->storeAs($folder, $filename, 'public');

            // Aggiorna il database
            $chain->update([
                $dbField => '/storage/' . $path
            ]);

            return response()->json([
                'success' => true,
                'message' => ucfirst($imageType) . ' caricato con successo',
                'data' => [
                    'image_url' => '/storage/' . $path,
                    'type' => $imageType
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Errore nel caricamento: ' . $e->getMessage()
            ], 500);
        }
    }
}