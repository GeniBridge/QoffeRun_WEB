<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;


class AuthController extends Controller
{
    /**
    * @OA\Post(
    *     path="/api/v1/register",
    *     summary="Register a new user",
    *     tags={"Authentication"},
    *     @OA\RequestBody(
    *         required=true,
    *         @OA\JsonContent(
    *             required={"email","password","password_confirmation"},
    *             @OA\Property(property="name", type="string", example="John Doe"),
    *             @OA\Property(property="first_name", type="string", example="John"),
    *             @OA\Property(property="last_name", type="string", example="Doe"),
    *             @OA\Property(property="email", type="string", format="email", example="user@example.com"),
    *             @OA\Property(property="password", type="string", format="password", example="password123"),
    *             @OA\Property(property="password_confirmation", type="string", format="password", example="password123"),
    *             @OA\Property(property="phone", type="string", example="+393331234567"),
    *             @OA\Property(property="role", type="string", enum={"customer","barista","admin","chain_owner","branch_manager","staff"}, example="customer")
    *         )
    *     ),
    *     @OA\Response(
    *         response=201,
    *         description="User registered successfully",
    *         @OA\JsonContent(
    *             @OA\Property(property="success", type="boolean", example=true),
    *             @OA\Property(property="message", type="string", example="User registered successfully"),
    *             @OA\Property(property="access_token", type="string", example="1|abc123..."),
    *             @OA\Property(property="token_type", type="string", example="Bearer")
    *         )
    *     ),
    *     @OA\Response(
    *         response=422,
    *         description="Validation error"
    *     )
    * )
    *
     * Register a new user.
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'sometimes|nullable|string|max:255',
            'first_name' => 'sometimes|nullable|string|max:255',
            'last_name' => 'sometimes|nullable|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|confirmed',
            'role' => 'sometimes|nullable|in:customer,barista,admin,chain_owner,branch_manager,staff',
            'phone' => 'sometimes|nullable|string|max:15',
        ]);

        // Build display name from provided fields
        $name = $request->name;
        if (!$name) {
            if ($request->filled('first_name') || $request->filled('last_name')) {
                $name = trim(($request->first_name ?? '') . ' ' . ($request->last_name ?? ''));
            }
        }
        if (!$name) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => [ 'name' => ['Il campo nome è obbligatorio (name o first_name + last_name).'] ]
            ], 422);
        }

        $user = User::create([
            'name' => $name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'phone' => $request->phone,
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        $payloadUser = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
        ];

        return response()->json([
            // Backwards-compatible fields
            'message' => 'User registered successfully.',
            'user' => $payloadUser,
            'access_token' => $token,
            'token_type' => 'Bearer',
            // New fields matching mobile docs
            'success' => true,
            'data' => [
                'user' => $payloadUser,
                'token' => $token,
            ],
        ], 201);
    }

    /**
     * Log in an existing user.
     */
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required',
        ]);

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['The provided credentials are incorrect.'],
            ]);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        $payloadUser = [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
            'phone' => $user->phone,
        ];

        return response()->json([
            // Backwards-compatible fields
            'message' => 'Login successful.',
            'user' => $payloadUser,
            'access_token' => $token,
            'token_type' => 'Bearer',
            // New fields matching mobile docs
            'success' => true,
            'data' => [
                'user' => $payloadUser,
                'token' => $token,
            ],
        ]);
    }

    /**
     * Log out (revoke token).
     */
    public function logout(Request $request)
    {
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        return response()->json([
            'message' => 'Logged out successfully.'
        ]);
    }

    /**
     * Get authenticated user.
     */
    public function me(Request $request)
    {
        $user = $request->user();
        $user->load(['ownedChains', 'managedBranches']);
        
        return response()->json([
            'success' => true,
            'data' => $user
        ]);
    }

    /**
     * Registrazione nuovo Chain Owner con prima filiale
     * POST /api/v1/auth/register-chain-owner
     */
    public function registerChainOwner(Request $request)
    {
        $request->validate([
            // Dati proprietario (supporta entrambi i formati frontend)
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'phone' => 'nullable|string|max:50',
            
            // Dati catena
            'chain_name' => 'required|string|max:255',
            'chain_description' => 'nullable|string|max:1000',
            
            // Dati prima filiale - Formato standardizzato
            'branch_name' => 'required|string|max:255',
            'branch_via' => 'required|string|max:255',
            'branch_numero_civico' => 'nullable|string|max:20',
            'branch_citta' => 'required|string|max:100',
            'branch_provincia' => 'required|string|max:5',
            'branch_regione' => 'nullable|string|max:100',
            'branch_cap' => 'required|string|max:10',
            'branch_paese' => 'nullable|string|max:100',
            'branch_lat' => 'nullable|numeric|between:-90,90',
            'branch_lng' => 'nullable|numeric|between:-180,180',
            'branch_phone' => 'nullable|string|max:50',
            'branch_email' => 'nullable|email',
            // Supporta anche formati legacy per compatibilità
            'branch_address' => 'nullable|string',
            'branch_city' => 'nullable|string|max:100',
            'branch_province' => 'nullable|string|max:5',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
        ]);

        try {
            \DB::beginTransaction();

            // 1. Crea l'utente proprietario
            $owner = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'chain_owner',
                'phone' => $request->phone,
            ]);

            // 2. Crea la catena
            $chain = \App\Models\Chain::create([
                'owner_id' => $owner->id,
                'name' => $request->chain_name,
                'status' => 'active',
                'payment_mode' => 'unified',
            ]);

            // 3. Crea la prima filiale
            $branchCode = strtoupper(substr($request->chain_name, 0, 3)) . '001';
            
            // Costruisce indirizzo completo dal formato standardizzato
            $fullAddress = $request->branch_via;
            if ($request->branch_numero_civico) {
                $fullAddress .= ' ' . $request->branch_numero_civico;
            }
            
            $branch = \App\Models\Branch::create([
                'chain_id' => $chain->id,
                'code' => $branchCode,
                'name' => $request->branch_name,
                // Campi standardizzati
                'via' => $request->branch_via,
                'numero_civico' => $request->branch_numero_civico,
                'citta' => $request->branch_citta,
                'provincia' => $request->branch_provincia,
                'regione' => $request->branch_regione,
                'cap' => $request->branch_cap,
                'paese' => $request->branch_paese ?? 'Italia',
                'lat' => $request->branch_lat,
                'lng' => $request->branch_lng,
                // Campi legacy per compatibilità
                'address' => $request->branch_address ?? $fullAddress,
                'city' => $request->branch_city ?? $request->branch_citta,
                'province' => $request->branch_province ?? $request->branch_provincia,
                'country' => 'Italia',
                'latitude' => $request->latitude ?? $request->branch_lat,
                'longitude' => $request->longitude ?? $request->branch_lng,
                'phone' => $request->branch_phone,
                'email' => $request->branch_email,
                'delivery_enabled' => true,
                'takeaway_enabled' => true,
                'table_service_enabled' => false,
                'status' => 'active',
            ]);

            // 4. Crea token di accesso
            $token = $owner->createToken('chain-owner-token')->plainTextToken;

            \DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'Registrazione completata con successo!',
                'data' => [
                    'user' => $owner,
                    'chain' => $chain,
                    'branch' => $branch,
                    'token' => $token,
                ]
            ], 201);

        } catch (\Exception $e) {
            \DB::rollback();
            
            return response()->json([
                'success' => false,
                'message' => 'Errore durante la registrazione: ' . $e->getMessage()
            ], 500);
        }
    }
}