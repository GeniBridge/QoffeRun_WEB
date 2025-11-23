<?php

namespace App\Http\Controllers\Bar;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Chain;
use App\Models\Branch;
use App\Services\BarEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class BarAuthController extends Controller
{
    /**
     * Autenticazione per bar.qofferun.com
     * Solo utenti con ruolo 'barista' possono accedere
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Verifica credenziali e ruolo barista
        if (!$user || !Hash::check($request->password, $user->password) || !$user->isBarista()) {
            throw ValidationException::withMessages([
                'email' => ['Credenziali non valide o accesso non autorizzato per il pannello bar.'],
            ]);
        }

        // Revoca token precedenti per sicurezza
        $user->tokens()->delete();

        // Crea nuovo token
        $token = $user->createToken('bar_panel_token')->plainTextToken;

        // Invia notifica di login
        try {
            $barData = [
                'nome' => $user->bar?->name ?? 'Bar Non Configurato',
            ];

            $loginData = BarEmailService::prepareLoginData(
                $user->email,
                $request->ip(),
                $request->userAgent()
            );

            BarEmailService::sendLoginNotification($barData, $loginData, $user->email);
        } catch (\Exception $e) {
            \Log::warning('Failed to send login notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Login effettuato con successo.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'bar' => $user->bar ? [
                    'id' => $user->bar->id,
                    'name' => $user->bar->name,
                    'status' => $user->bar->status,
                ] : null,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Richiesta reset password per pannello bar
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Verifica che l'utente esista e sia un barista
        if (!$user || !$user->isBarista()) {
            return response()->json([
                'message' => 'Se l\'email è registrata per un account bar, riceverai le istruzioni per il reset.',
            ]);
        }

        // Genera token di reset
        $token = Str::random(64);
        
        // Salva token nel database
        DB::table('password_reset_tokens')->updateOrInsert(
            ['email' => $user->email],
            [
                'token' => Hash::make($token),
                'created_at' => now(),
            ]
        );

        // Invia email di reset
        try {
            $barData = [
                'nome' => $user->bar?->name ?? 'Bar Non Configurato',
            ];

            $resetData = BarEmailService::prepareResetData(
                $user->email,
                $user->name,
                $token,
                60 // 60 minuti di validità
            );

            BarEmailService::sendPasswordReset($barData, $resetData, $user->email);

            return response()->json([
                'message' => 'Se l\'email è registrata, riceverai le istruzioni per il reset della password.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send password reset email: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Errore nell\'invio dell\'email. Riprova più tardi.',
            ], 500);
        }
    }

    /**
     * Reset della password con token
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->isBarista()) {
            throw ValidationException::withMessages([
                'email' => ['Utente non trovato o non autorizzato.'],
            ]);
        }

        // Verifica token
        $resetRecord = DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->first();

        if (!$resetRecord || !Hash::check($request->token, $resetRecord->token)) {
            throw ValidationException::withMessages([
                'token' => ['Token non valido o scaduto.'],
            ]);
        }

        // Verifica che il token non sia scaduto (1 ora)
        if (now()->diffInMinutes($resetRecord->created_at) > 60) {
            throw ValidationException::withMessages([
                'token' => ['Il token è scaduto. Richiedi un nuovo reset.'],
            ]);
        }

        // Aggiorna password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Elimina token utilizzato
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Revoca tutti i token di accesso esistenti
        $user->tokens()->delete();

        // Invia notifica di cambio password
        try {
            $barData = [
                'nome' => $user->bar?->name ?? 'Bar Non Configurato',
            ];

            $changeData = BarEmailService::prepareChangeData(
                $user->email,
                $user->name,
                $request->ip()
            );

            BarEmailService::sendPasswordChanged($barData, $changeData, $user->email);
        } catch (\Exception $e) {
            \Log::warning('Failed to send password changed notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Password aggiornata con successo. Effettua nuovamente il login.',
        ]);
    }

    /**
     * Logout dal pannello bar
     */
    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logout effettuato con successo.',
        ]);
    }

    /**
     * Informazioni utente autenticato (solo baristi)
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user->isBarista()) {
            return response()->json([
                'error' => 'Accesso non autorizzato per il pannello bar.',
            ], 403);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'bar' => $user->bar ? [
                    'id' => $user->bar->id,
                    'name' => $user->bar->name,
                    'status' => $user->bar->status,
                    'address' => $user->bar->address,
                ] : null,
            ],
        ]);
    }

    /**
     * Get branches available to the authenticated user based on their role
     */
    public function getUserBranches(Request $request)
    {
        $user = $request->user();

        if (!$user->isBarista() && !$user->isChainOwner()) {
            return response()->json([
                'error' => 'Accesso non autorizzato per il pannello bar.',
            ], 403);
        }

        $branches = [];

        if ($user->isChainOwner()) {
            // Chain owners can access all branches of their chains
            $branches = collect();
            foreach ($user->ownedChains as $chain) {
                $chainBranches = $chain->branches()->with('chain')->get()->map(function ($branch) {
                    return [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'address' => $branch->address,
                        'status' => $branch->status,
                        'chain' => [
                            'id' => $branch->chain->id,
                            'name' => $branch->chain->name,
                            'logo' => $branch->chain->logo,
                        ],
                    ];
                });
                $branches = $branches->concat($chainBranches);
            }
        } else {
            // Staff, baristas, and branch managers can only access their assigned branches
            $branches = $user->assignedBranches()->with('chain')->get()->map(function ($branch) {
                return [
                    'id' => $branch->id,
                    'name' => $branch->name,
                    'address' => $branch->address,
                    'status' => $branch->status,
                    'chain' => [
                        'id' => $branch->chain->id,
                        'name' => $branch->chain->name,
                        'logo' => $branch->chain->logo,
                    ],
                ];
            });
        }

        return response()->json([
            'branches' => $branches->toArray(),
        ]);
    }

    /**
     * Update user profile information
     */
    public function updateProfile(Request $request)
    {
        $user = $request->user();

        if (!$user->isBarista()) {
            return response()->json([
                'error' => 'Accesso non autorizzato per il pannello bar.',
            ], 403);
        }

        $request->validate([
            'name' => 'sometimes|string|max:255',
            'email' => 'sometimes|email|unique:users,email,' . $user->id,
            'phone' => 'sometimes|nullable|string|max:20',
        ]);

        $user->update($request->only(['name', 'email', 'phone']));

        return response()->json([
            'message' => 'Profilo aggiornato con successo.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'phone' => $user->phone,
                'role' => $user->role,
                'created_at' => $user->created_at,
            ],
        ]);
    }

    /**
     * Change user password
     */
    public function changePassword(Request $request)
    {
        $user = $request->user();

        if (!$user->isBarista()) {
            return response()->json([
                'error' => 'Accesso non autorizzato per il pannello bar.',
            ], 403);
        }

        $request->validate([
            'current_password' => 'required|string',
            'new_password' => 'required|string|min:8|confirmed',
        ]);

        // Verify current password
        if (!Hash::check($request->current_password, $user->password)) {
            throw ValidationException::withMessages([
                'current_password' => ['La password corrente non è corretta.'],
            ]);
        }

        // Update password
        $user->update([
            'password' => Hash::make($request->new_password),
        ]);

        // Revoke all existing tokens except the current one
        $currentToken = $request->user()->currentAccessToken();
        $user->tokens()->where('id', '!=', $currentToken->id)->delete();

        // Send notification email
        try {
            $barData = [
                'nome' => $user->bar?->name ?? 'Bar Non Configurato',
            ];

            $changeData = BarEmailService::prepareChangeData(
                $user->email,
                $user->name,
                $request->ip()
            );

            BarEmailService::sendPasswordChanged($barData, $changeData, $user->email);
        } catch (\Exception $e) {
            \Log::warning('Failed to send password changed notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Password cambiata con successo.',
        ]);
    }
}