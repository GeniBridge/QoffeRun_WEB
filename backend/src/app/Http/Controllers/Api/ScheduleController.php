<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Models\User;
use App\Models\Branch;
use App\Services\StaffEmailService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class ScheduleController extends Controller
{
    /**
     * Lista schedules per una filiale
     * GET /api/v1/branches/{branchId}/schedules
     */
    public function index(Request $request, $branchId): JsonResponse
    {
        $user = Auth::user();
        
        // Verifica autorizzazioni
        if (!in_array($user->role, ['admin', 'chain_owner', 'branch_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        // Verifica accesso alla filiale
        $branch = Branch::find($branchId);
        if (!$branch) {
            return response()->json([
                'success' => false,
                'message' => 'Filiale non trovata'
            ], 404);
        }

        // Controllo permessi specifici per chain owner e branch manager
        if ($user->role === 'chain_owner') {
            $userChainIds = $user->ownedChains->pluck('id');
            if (!$userChainIds->contains($branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato ad accedere a questa filiale'
                ], 403);
            }
        } elseif ($user->role === 'branch_manager') {
            $managedBranchIds = $user->managedBranches->pluck('id');
            if (!$managedBranchIds->contains($branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato ad accedere a questa filiale'
                ], 403);
            }
        }

        // Parametri per il filtro date
        $startDate = $request->input('start_date', now()->startOfWeek()->toDateString());
        $endDate = $request->input('end_date', now()->endOfWeek()->toDateString());

        $schedules = Schedule::forBranch($branchId)
            ->forDateRange($startDate, $endDate)
            ->with(['staff', 'branch'])
            ->orderBy('date')
            ->orderBy('start_time')
            ->get();

        // Raggruppa per data e shift
        $groupedSchedules = $schedules->groupBy(function($schedule) {
            return $schedule->date->toDateString();
        })->map(function($daySchedules) {
            return $daySchedules->groupBy('shift_type');
        });

        return response()->json([
            'success' => true,
            'data' => $groupedSchedules,
            'meta' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
                'total_schedules' => $schedules->count()
            ]
        ]);
    }

    /**
     * Assegna staff a un turno
     * POST /api/v1/schedules/assign
     */
    public function assign(Request $request): JsonResponse
    {
        $user = Auth::user();
        
        // Verifica autorizzazioni
        if (!in_array($user->role, ['admin', 'chain_owner', 'branch_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        $validator = Validator::make($request->all(), [
            'staff_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id',
            'shift_id' => 'required|string|in:morning,afternoon,evening,night',
            'date' => 'required|date|after_or_equal:today'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Dati non validi',
                'errors' => $validator->errors()
            ], 422);
        }

        $staffId = $request->staff_id;
        $branchId = $request->branch_id;
        $shiftType = $request->shift_id;
        $date = $request->date;

        // Verifica che lo staff appartenga alla catena corretta
        $staff = User::find($staffId);
        $branch = Branch::find($branchId);

        if ($staff->chain_id !== $branch->chain_id) {
            return response()->json([
                'success' => false,
                'message' => 'Lo staff non appartiene alla stessa catena della filiale'
            ], 422);
        }

        // Verifica permessi del chain owner/branch manager
        if ($user->role === 'chain_owner') {
            $userChainIds = $user->ownedChains->pluck('id');
            if (!$userChainIds->contains($branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato ad assegnare turni per questa filiale'
                ], 403);
            }
        } elseif ($user->role === 'branch_manager') {
            $managedBranchIds = $user->managedBranches->pluck('id');
            if (!$managedBranchIds->contains($branchId)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato ad assegnare turni per questa filiale'
                ], 403);
            }
        }

        // Verifica che lo staff non abbia già un turno in quella data
        $existingSchedule = Schedule::where('staff_id', $staffId)
            ->where('date', $date)
            ->where('shift_type', $shiftType)
            ->first();

        if ($existingSchedule) {
            return response()->json([
                'success' => false,
                'message' => 'Lo staff è già assegnato a questo turno'
            ], 422);
        }

        // Definisci gli orari per ogni turno
        $shiftTimes = [
            'morning' => ['06:00', '14:00'],
            'afternoon' => ['14:00', '22:00'],
            'evening' => ['18:00', '02:00'],
            'night' => ['22:00', '06:00']
        ];

        $times = $shiftTimes[$shiftType] ?? $shiftTimes['morning'];

        // Crea lo schedule
        $schedule = Schedule::create([
            'staff_id' => $staffId,
            'branch_id' => $branchId,
            'shift_type' => $shiftType,
            'date' => $date,
            'start_time' => $times[0],
            'end_time' => $times[1],
            'status' => 'scheduled',
            'notes' => $request->input('notes', '')
        ]);

        $schedule->load(['staff', 'branch']);

        // Send shift assignment notification
        try {
            $shiftData = [
                'shift_type' => $shiftType,
                'date' => $date,
                'start_time' => $times[0],
                'end_time' => $times[1],
                'branch_name' => $branch->name,
                'notes' => $request->input('notes', '')
            ];
            
            StaffEmailService::sendShiftAssignmentNotification($staff, $branch, $shiftData);
        } catch (\Exception $emailException) {
            // Log email error but don't fail the shift assignment
            \Log::warning('Failed to send shift assignment email: ' . $emailException->getMessage(), [
                'staff_id' => $staffId,
                'branch_id' => $branchId,
                'shift_date' => $date
            ]);
        }

        return response()->json([
            'success' => true,
            'message' => 'Turno assegnato con successo',
            'data' => $schedule
        ]);
    }

    /**
     * Rimuovi assegnazione turno
     * DELETE /api/v1/schedules/assignments/{id}
     */
    public function removeAssignment(Request $request, $scheduleId): JsonResponse
    {
        $user = Auth::user();
        
        // Verifica autorizzazioni
        if (!in_array($user->role, ['admin', 'chain_owner', 'branch_manager'])) {
            return response()->json([
                'success' => false,
                'message' => 'Non autorizzato'
            ], 403);
        }

        $schedule = Schedule::find($scheduleId);
        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Assegnazione non trovata'
            ], 404);
        }

        // Verifica permessi
        $branch = $schedule->branch;
        if ($user->role === 'chain_owner') {
            $userChainIds = $user->ownedChains->pluck('id');
            if (!$userChainIds->contains($branch->chain_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato a rimuovere questo turno'
                ], 403);
            }
        } elseif ($user->role === 'branch_manager') {
            $managedBranchIds = $user->managedBranches->pluck('id');
            if (!$managedBranchIds->contains($schedule->branch_id)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Non autorizzato a rimuovere questo turno'
                ], 403);
            }
        }

        $schedule->delete();

        return response()->json([
            'success' => true,
            'message' => 'Assegnazione rimossa con successo'
        ]);
    }

    /**
     * Aggiorna stato di uno schedule
     * PUT /api/v1/schedules/{id}/status
     */
    public function updateStatus(Request $request, $scheduleId): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'status' => 'required|string|in:scheduled,confirmed,completed,cancelled'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Stato non valido',
                'errors' => $validator->errors()
            ], 422);
        }

        $schedule = Schedule::find($scheduleId);
        if (!$schedule) {
            return response()->json([
                'success' => false,
                'message' => 'Schedule non trovato'
            ], 404);
        }

        $schedule->update(['status' => $request->status]);
        $schedule->load(['staff', 'branch']);

        return response()->json([
            'success' => true,
            'message' => 'Stato aggiornato con successo',
            'data' => $schedule
        ]);
    }
}
