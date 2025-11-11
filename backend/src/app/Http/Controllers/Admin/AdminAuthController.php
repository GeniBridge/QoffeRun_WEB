<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\BarEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class AdminAuthController extends Controller
{
    /**
     * Autenticazione per controllo.qofferun.com
     * Solo utenti con ruolo 'admin' possono accedere
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        // Verifica credenziali e ruolo admin
        if (!$user || !Hash::check($request->password, $user->password) || !$user->isAdmin()) {
            throw ValidationException::withMessages([
                'email' => ['Credenziali non valide o accesso non autorizzato per il pannello amministrativo.'],
            ]);
        }

        // Revoca token precedenti per sicurezza
        $user->tokens()->delete();

        // Crea nuovo token
        $token = $user->createToken('admin_panel_token')->plainTextToken;

        // Log dell'accesso admin (più dettagliato per sicurezza)
        \Log::info('Admin login', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
            'user_agent' => $request->userAgent(),
            'timestamp' => now(),
        ]);

        // Invia notifica di login (usando lo stesso sistema ma per admin)
        try {
            $barData = [
                'nome' => 'Pannello Amministrativo QoffeRun',
            ];

            $loginData = [
                'email' => $user->email,
                'time' => now()->format('d/m/Y H:i:s'),
                'ip' => $request->ip(),
                'user_agent' => $request->userAgent() ?? 'Non disponibile',
            ];

            // Qui potresti creare email specifiche per admin o riutilizzare quelle del bar
            // Per ora uso quelle del bar ma con dati admin
            BarEmailService::sendLoginNotification($barData, $loginData, $user->email);
        } catch (\Exception $e) {
            \Log::warning('Failed to send admin login notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Accesso amministrativo effettuato con successo.',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'access_token' => $token,
            'token_type' => 'Bearer',
        ]);
    }

    /**
     * Richiesta reset password per pannello admin
     */
    public function forgotPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
        ]);

        $user = User::where('email', $request->email)->first();

        // Verifica che l'utente esista e sia un admin
        if (!$user || !$user->isAdmin()) {
            return response()->json([
                'message' => 'Se l\'email è registrata per un account amministrativo, riceverai le istruzioni per il reset.',
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

        // Log richiesta reset admin
        \Log::info('Admin password reset requested', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        // Invia email di reset
        try {
            $barData = [
                'nome' => 'Pannello Amministrativo QoffeRun',
            ];

            $resetData = [
                'email' => $user->email,
                'name' => $user->name,
                'token' => $token,
                'url' => "https://controllo.qofferun.com/reset-password?token={$token}&email=" . urlencode($user->email),
                'expires_at' => now()->addMinutes(60)->format('d/m/Y H:i'),
            ];

            BarEmailService::sendPasswordReset($barData, $resetData, $user->email);

            return response()->json([
                'message' => 'Se l\'email è registrata, riceverai le istruzioni per il reset della password.',
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to send admin password reset email: ' . $e->getMessage());
            
            return response()->json([
                'message' => 'Errore nell\'invio dell\'email. Riprova più tardi.',
            ], 500);
        }
    }

    /**
     * Reset della password con token (admin)
     */
    public function resetPassword(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'token' => 'required|string',
            'password' => 'required|string|min:8|confirmed',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !$user->isAdmin()) {
            throw ValidationException::withMessages([
                'email' => ['Utente amministrativo non trovato.'],
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

        // Log cambio password admin
        \Log::info('Admin password changed', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        // Aggiorna password
        $user->update([
            'password' => Hash::make($request->password),
        ]);

        // Elimina token utilizzato
        DB::table('password_reset_tokens')
            ->where('email', $request->email)
            ->delete();

        // Revoca tutti i token di accesso esistenti per sicurezza
        $user->tokens()->delete();

        // Invia notifica di cambio password
        try {
            $barData = [
                'nome' => 'Pannello Amministrativo QoffeRun',
            ];

            $changeData = [
                'email' => $user->email,
                'name' => $user->name,
                'time' => now()->format('d/m/Y H:i:s'),
                'ip' => $request->ip(),
            ];

            BarEmailService::sendPasswordChanged($barData, $changeData, $user->email);
        } catch (\Exception $e) {
            \Log::warning('Failed to send admin password changed notification: ' . $e->getMessage());
        }

        return response()->json([
            'message' => 'Password amministrativa aggiornata con successo. Effettua nuovamente il login.',
        ]);
    }

    /**
     * Logout dal pannello admin
     */
    public function logout(Request $request)
    {
        $user = $request->user();
        
        // Log logout admin
        \Log::info('Admin logout', [
            'user_id' => $user->id,
            'email' => $user->email,
            'ip' => $request->ip(),
        ]);

        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logout amministrativo effettuato con successo.',
        ]);
    }

    /**
     * Informazioni utente autenticato (solo admin)
     */
    public function me(Request $request)
    {
        $user = $request->user();

        if (!$user->isAdmin()) {
            return response()->json([
                'error' => 'Accesso non autorizzato per il pannello amministrativo.',
            ], 403);
        }

        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
        ]);
    }
}