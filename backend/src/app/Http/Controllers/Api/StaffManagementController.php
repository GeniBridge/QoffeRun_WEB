<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Branch;
use App\Models\Chain;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class StaffManagementController extends Controller
{
    /**
     * Get all staff for chain owner's branches
     */
    public function getChainStaff(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || !$user->isChainOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Chain owner required.'
            ], 403);
        }

        try {
            // Get chain owner's chains
            $chains = $user->ownedChains()->get();
            $chainIds = $chains->pluck('id');
            
            // Get all branches for these chains
            $branches = Branch::whereIn('chain_id', $chainIds)
                ->with(['assignedUsers' => function($query) {
                    $query->whereNull('user_branches.unassigned_at')
                          ->withPivot([
                              'role_at_branch', 
                              'is_primary_branch', 
                              'assigned_at',
                              'permissions',
                              'work_schedule'
                          ])
                          ->orderBy('user_branches.role_at_branch', 'desc')
                          ->orderBy('users.name');
                }])
                ->orderBy('name')
                ->get();

            // Get all unique assigned staff across all branches
            $allAssignedStaff = collect();
            $staffByBranch = [];
            $managersByBranch = [];
            
            foreach ($branches as $branch) {
                $branchStaff = $branch->assignedUsers->map(function($user) use ($branch) {
                    $staffData = [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'role' => $user->role,
                        'role_at_branch' => $user->pivot->role_at_branch,
                        'is_primary_branch' => $user->pivot->is_primary_branch,
                        'assigned_at' => $user->pivot->assigned_at,
                        'permissions' => json_decode($user->pivot->permissions, true) ?: [],
                        'work_schedule' => json_decode($user->pivot->work_schedule, true) ?: [],
                        'phone' => $user->phone,
                        'employee_code' => $user->employee_code,
                        'branch_info' => [
                            'id' => $branch->id,
                            'name' => $branch->name,
                            'address' => $branch->address
                        ]
                    ];
                    
                    // Add to all staff collection with unique key
                    $allAssignedStaff->put($user->id . '_' . $branch->id, $staffData);
                    
                    return $staffData;
                });
                
                // Separate managers from regular staff
                $branchManagers = $branchStaff->filter(function($staff) {
                    return in_array($staff['role_at_branch'], ['branch_manager', 'manager']);
                });
                
                $regularStaff = $branchStaff->filter(function($staff) {
                    return !in_array($staff['role_at_branch'], ['branch_manager', 'manager']);
                });
                
                $staffByBranch[$branch->id] = [
                    'branch' => [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'address' => $branch->address,
                        'chain_id' => $branch->chain_id
                    ],
                    'managers' => $branchManagers->values(),
                    'staff' => $regularStaff->values(),
                    'total_assigned' => $branchStaff->count()
                ];
                
                $managersByBranch[$branch->id] = $branchManagers->values();
            }

            // Group all staff by user ID to show their multiple assignments
            $staffWithAssignments = $allAssignedStaff->groupBy(function($staff) {
                return $staff['id'];
            })->map(function($assignments, $userId) {
                $firstAssignment = $assignments->first();
                return [
                    'id' => $firstAssignment['id'],
                    'name' => $firstAssignment['name'],
                    'email' => $firstAssignment['email'],
                    'role' => $firstAssignment['role'],
                    'phone' => $firstAssignment['phone'],
                    'employee_code' => $firstAssignment['employee_code'],
                    'assignments' => $assignments->map(function($assignment) {
                        return [
                            'branch' => $assignment['branch_info'],
                            'role_at_branch' => $assignment['role_at_branch'],
                            'is_primary_branch' => $assignment['is_primary_branch'],
                            'assigned_at' => $assignment['assigned_at'],
                            'permissions' => $assignment['permissions'],
                            'work_schedule' => $assignment['work_schedule']
                        ];
                    })->values()
                ];
            })->values();

            return response()->json([
                'success' => true,
                'data' => [
                    'chains' => $chains,
                    'staff_by_branch' => $staffByBranch,
                    'managers_by_branch' => $managersByBranch,
                    'all_assigned_staff' => $staffWithAssignments,
                    'summary' => [
                        'total_branches' => count($staffByBranch),
                        'total_unique_staff' => $staffWithAssignments->count(),
                        'total_assignments' => $allAssignedStaff->count(),
                        'total_managers' => collect($managersByBranch)->flatten(1)->count()
                    ]
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get staff: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get all assigned staff across the chain (alternative view)
     */
    public function getAllAssignedStaff(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || !$user->isChainOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Chain owner required.'
            ], 403);
        }

        try {
            $chains = $user->ownedChains()->get();
            $chainIds = $chains->pluck('id');
            
            // Get all users with branch assignments in this chain
            $assignedUsers = User::whereHas('assignedBranches', function($query) use ($chainIds) {
                $query->whereIn('branches.chain_id', $chainIds)
                      ->whereNull('user_branches.unassigned_at');
            })
            ->with(['assignedBranches' => function($query) use ($chainIds) {
                $query->whereIn('branches.chain_id', $chainIds)
                      ->whereNull('user_branches.unassigned_at')
                      ->withPivot([
                          'role_at_branch', 
                          'is_primary_branch', 
                          'assigned_at',
                          'permissions',
                          'work_schedule'
                      ]);
            }])
            ->orderBy('name')
            ->get();

            $staffData = $assignedUsers->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'phone' => $user->phone,
                    'employee_code' => $user->employee_code,
                    'branch_assignments' => $user->assignedBranches->map(function($branch) {
                        return [
                            'branch_id' => $branch->id,
                            'branch_name' => $branch->name,
                            'branch_address' => $branch->address,
                            'role_at_branch' => $branch->pivot->role_at_branch,
                            'is_primary_branch' => $branch->pivot->is_primary_branch,
                            'assigned_at' => $branch->pivot->assigned_at,
                            'permissions' => json_decode($branch->pivot->permissions, true) ?: [],
                            'work_schedule' => json_decode($branch->pivot->work_schedule, true) ?: []
                        ];
                    }),
                    'total_assignments' => $user->assignedBranches->count(),
                    'is_manager' => $user->assignedBranches->contains(function($branch) {
                        return in_array($branch->pivot->role_at_branch, ['branch_manager', 'manager']);
                    }),
                    'primary_branch' => $user->assignedBranches->where('pivot.is_primary_branch', true)->first()
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'assigned_staff' => $staffData,
                    'total_staff' => $staffData->count(),
                    'managers_count' => $staffData->where('is_manager', true)->count(),
                    'staff_count' => $staffData->where('is_manager', false)->count()
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get assigned staff: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get staff for a specific branch
     */
    public function getBranchStaff(Request $request, int $branchId): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || !$user->canAccessBranch($branchId)) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied to this branch.'
            ], 403);
        }

        try {
            $branch = Branch::with(['assignedUsers' => function($query) {
                $query->whereNull('user_branches.unassigned_at')
                      ->withPivot([
                          'role_at_branch', 
                          'is_primary_branch', 
                          'assigned_at',
                          'permissions',
                          'work_schedule'
                      ]);
            }])->findOrFail($branchId);

            $staff = $branch->assignedUsers->map(function($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'role_at_branch' => $user->pivot->role_at_branch,
                    'is_primary_branch' => $user->pivot->is_primary_branch,
                    'assigned_at' => $user->pivot->assigned_at,
                    'permissions' => json_decode($user->pivot->permissions, true),
                    'work_schedule' => json_decode($user->pivot->work_schedule, true),
                    'phone' => $user->phone,
                    'employee_code' => $user->employee_code
                ];
            });

            return response()->json([
                'success' => true,
                'data' => [
                    'branch' => [
                        'id' => $branch->id,
                        'name' => $branch->name,
                        'address' => $branch->address
                    ],
                    'staff' => $staff
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to get branch staff: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Assign user to branch(es)
     */
    public function assignUserToBranch(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || !$user->isChainOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Chain owner required.'
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'branch_ids' => 'required|array|min:1',
            'branch_ids.*' => 'exists:branches,id',
            'role_at_branch' => 'required|in:staff,manager,supervisor',
            'primary_branch_id' => 'nullable|exists:branches,id',
            'permissions' => 'nullable|array',
            'work_schedule' => 'nullable|array'
        ]);

        try {
            $targetUser = User::findOrFail($request->user_id);
            $primaryBranchId = $request->primary_branch_id ?: $request->branch_ids[0];

            // Verify all branches belong to chain owner's chains
            $chainIds = $user->ownedChains()->pluck('id');
            $branches = Branch::whereIn('id', $request->branch_ids)
                ->whereIn('chain_id', $chainIds)
                ->get();
                
            if ($branches->count() !== count($request->branch_ids)) {
                return response()->json([
                    'success' => false,
                    'message' => 'Some branches do not belong to your chains.'
                ], 403);
            }

            DB::beginTransaction();

            foreach ($request->branch_ids as $branchId) {
                $isPrimary = ($branchId == $primaryBranchId);
                
                // Remove existing assignment if exists
                DB::table('user_branches')
                    ->where('user_id', $targetUser->id)
                    ->where('branch_id', $branchId)
                    ->delete();

                // Create new assignment
                DB::table('user_branches')->insert([
                    'user_id' => $targetUser->id,
                    'branch_id' => $branchId,
                    'role_at_branch' => $request->role_at_branch,
                    'is_primary_branch' => $isPrimary,
                    'assigned_at' => now(),
                    'permissions' => json_encode($request->permissions ?? $this->getDefaultPermissions($request->role_at_branch)),
                    'work_schedule' => json_encode($request->work_schedule ?? $this->getDefaultSchedule()),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
            }

            DB::commit();

            return response()->json([
                'success' => true,
                'message' => 'User assigned to branch(es) successfully',
                'data' => [
                    'user' => $targetUser->name,
                    'branches' => $branches->pluck('name'),
                    'role' => $request->role_at_branch,
                    'primary_branch' => $branches->where('id', $primaryBranchId)->first()->name
                ]
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'success' => false,
                'message' => 'Failed to assign user: ' . $e->getMessage()
            ], 500);
        }
    }

    /**
     * Remove user from branch
     */
    public function removeUserFromBranch(Request $request): JsonResponse
    {
        $user = $request->user();
        
        if (!$user || !$user->isChainOwner()) {
            return response()->json([
                'success' => false,
                'message' => 'Access denied. Chain owner required.'
            ], 403);
        }

        $request->validate([
            'user_id' => 'required|exists:users,id',
            'branch_id' => 'required|exists:branches,id'
        ]);

        try {
            // Verify branch belongs to chain owner
            $branch = Branch::whereIn('chain_id', $user->ownedChains()->pluck('id'))
                ->where('id', $request->branch_id)
                ->firstOrFail();

            // Mark as unassigned
            $updated = DB::table('user_branches')
                ->where('user_id', $request->user_id)
                ->where('branch_id', $request->branch_id)
                ->whereNull('unassigned_at')
                ->update([
                    'unassigned_at' => now(),
                    'updated_at' => now()
                ]);

            if ($updated) {
                $targetUser = User::find($request->user_id);
                return response()->json([
                    'success' => true,
                    'message' => 'User removed from branch successfully',
                    'data' => [
                        'user' => $targetUser->name,
                        'branch' => $branch->name
                    ]
                ]);
            } else {
                return response()->json([
                    'success' => false,
                    'message' => 'Assignment not found or already removed'
                ], 404);
            }

        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Failed to remove user: ' . $e->getMessage()
            ], 500);
        }
    }

    private function getDefaultPermissions($role)
    {
        $permissions = [
            'manager' => [
                'view_orders' => true,
                'manage_orders' => true,
                'view_staff' => true,
                'manage_staff' => false,
                'view_reports' => true,
                'manage_menu' => false,
            ],
            'supervisor' => [
                'view_orders' => true,
                'manage_orders' => true,
                'view_staff' => true,
                'manage_staff' => false,
                'view_reports' => false,
                'manage_menu' => false,
            ],
            'staff' => [
                'view_orders' => true,
                'manage_orders' => true,
                'view_staff' => false,
                'manage_staff' => false,
                'view_reports' => false,
                'manage_menu' => false,
            ]
        ];
        
        return $permissions[$role] ?? $permissions['staff'];
    }

    private function getDefaultSchedule()
    {
        return [
            'monday' => ['start' => '07:00', 'end' => '15:00'],
            'tuesday' => ['start' => '07:00', 'end' => '15:00'],
            'wednesday' => ['start' => '07:00', 'end' => '15:00'],
            'thursday' => ['start' => '07:00', 'end' => '15:00'],
            'friday' => ['start' => '07:00', 'end' => '15:00'],
            'saturday' => null,
            'sunday' => null
        ];
    }
}
