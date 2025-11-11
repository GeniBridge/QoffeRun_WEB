<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Bar;
use App\Models\User;
use App\Services\EmailService;
use App\Mail\BarRegistrationWelcome;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class BarRegistrationController extends Controller
{
    /**
     * Register a new bar with complete address and manager information
     */
    public function register(Request $request): JsonResponse
    {
        try {
            // Validation rules
            $validator = Validator::make($request->all(), [
                // Bar basic info
                'nome' => 'required|string|max:255',
                'descrizione' => 'required|string|max:1000',
                
                // Address fields from Google Maps
                'indirizzo_completo' => 'required|string|max:500',
                'via' => 'nullable|string|max:255',
                'numero_civico' => 'nullable|string|max:20',
                'citta' => 'required|string|max:100',
                'provincia' => 'required|string|max:10',
                'regione' => 'required|string|max:100',
                'cap' => 'required|string|max:10',
                'paese' => 'nullable|string|max:100',
                'latitudine' => 'required|numeric|between:-90,90',
                'longitudine' => 'required|numeric|between:-180,180',
                
                // Manager/Owner information
                'gestore_nome' => 'required|string|max:100',
                'gestore_cognome' => 'required|string|max:100',
                'gestore_email' => 'required|email|max:255|unique:users,email',
                'gestore_telefono' => 'nullable|string|max:20',
                'gestore_password' => 'required|string|min:8',
                
                // Media files
                'logo' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'cover' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:5120',
            ]);

            if ($validator->fails()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Errori di validazione',
                    'errors' => $validator->errors()
                ], 422);
            }

            // Start database transaction
            DB::beginTransaction();

            // Create user account for the manager
            $user = User::create([
                'name' => $request->gestore_nome . ' ' . $request->gestore_cognome,
                'email' => $request->gestore_email,
                'password' => Hash::make($request->gestore_password),
                'role' => 'bar_owner', // Assuming this role exists
            ]);

            // Generate unique QR code for the bar
            $qrCode = $this->generateUniqueQrCode();

            // Handle file uploads
            $logoPath = null;
            $coverPath = null;

            if ($request->hasFile('logo')) {
                $logoPath = $request->file('logo')->store('bars/logos', 'public');
            }

            if ($request->hasFile('cover')) {
                $coverPath = $request->file('cover')->store('bars/covers', 'public');
            }

            // Create bar record
            $bar = Bar::create([
                'user_id' => $user->id,
                'name' => $request->nome,
                'description' => $request->descrizione,
                
                // Address information
                'address' => $request->indirizzo_completo, // Legacy field
                'indirizzo_completo' => $request->indirizzo_completo,
                'via' => $request->via,
                'numero_civico' => $request->numero_civico,
                'citta' => $request->citta,
                'provincia' => $request->provincia,
                'regione' => $request->regione,
                'cap' => $request->cap,
                'paese' => $request->paese ?? 'Italia',
                
                // Coordinates
                'latitude' => $request->latitudine,
                'longitude' => $request->longitudine,
                
                // Manager information
                'gestore_nome' => $request->gestore_nome,
                'gestore_cognome' => $request->gestore_cognome,
                'gestore_email' => $request->gestore_email,
                'gestore_telefono' => $request->gestore_telefono,
                
                // Media
                'logo' => $logoPath,
                'cover_image' => $coverPath,
                
                // System fields
                'qr_code' => $qrCode,
                'status' => 'paused', // Start as paused until approved
                'registration_status' => 'pending',
                'registration_date' => now(),
            ]);

            DB::commit();

            // Send welcome email
            try {
                $barData = [
                    'nome' => $bar->name,
                    'citta' => $request->citta,
                ];
                
                $userData = [
                    'nome' => $request->gestore_nome . ' ' . $request->gestore_cognome,
                ];
                
                $welcomeEmail = new BarRegistrationWelcome($barData, $userData);
                EmailService::sendFromNoReply($welcomeEmail, [$request->gestore_email]);
                
                Log::info("Welcome email sent to: {$request->gestore_email} for bar: {$bar->name}");
            } catch (\Exception $emailError) {
                // Log error but don't fail registration
                Log::warning("Failed to send welcome email: " . $emailError->getMessage());
            }

            // Return success response with bar data
            return response()->json([
                'success' => true,
                'message' => 'Registrazione completata con successo! Il tuo bar è in attesa di approvazione. Controlla la tua email per i dettagli.',
                'data' => [
                    'bar_id' => $bar->id,
                    'bar_name' => $bar->name,
                    'qr_code' => $bar->qr_code,
                    'registration_status' => $bar->registration_status,
                    'user_id' => $user->id,
                    'address' => $bar->address_structured,
                    'coordinates' => [
                        'lat' => $bar->latitude,
                        'lng' => $bar->longitude
                    ]
                ]
            ], 201);

        } catch (\Exception $e) {
            DB::rollback();
            
            // Clean up uploaded files if they exist
            if (isset($logoPath) && $logoPath) {
                Storage::disk('public')->delete($logoPath);
            }
            if (isset($coverPath) && $coverPath) {
                Storage::disk('public')->delete($coverPath);
            }

            return response()->json([
                'success' => false,
                'message' => 'Errore durante la registrazione: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get registration status for a bar
     */
    public function getRegistrationStatus(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = User::where('email', $request->email)->first();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Utente non trovato'
            ], 404);
        }

        $bar = Bar::where('user_id', $user->id)->first();

        if (!$bar) {
            return response()->json([
                'success' => false,
                'message' => 'Nessuna registrazione bar trovata per questo utente'
            ], 404);
        }

        return response()->json([
            'success' => true,
            'data' => [
                'bar_name' => $bar->name,
                'registration_status' => $bar->registration_status,
                'registration_date' => $bar->registration_date,
                'registration_notes' => $bar->registration_notes,
                'qr_code' => $bar->qr_code,
            ]
        ]);
    }

    /**
     * Generate a unique QR code for the bar
     */
    private function generateUniqueQrCode(): string
    {
        do {
            // Generate format: QRAB1234 (QR + AB + 4 digits)
            $code = 'QR' . strtoupper(Str::random(2)) . str_pad(rand(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (Bar::where('qr_code', $code)->exists());

        return $code;
    }
}