<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class UserBranchAssignmentSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Assign Caffè Roma staff to specific branches
        $this->assignCaffeRomaStaff();
        
        $this->command->info('User branch assignments completed successfully!');
    }

    private function assignCaffeRomaStaff()
    {
        // Get Caffè Roma chain (ID: 16)
        $caffeRomaChain = 16;
        
        // Get branches for Caffè Roma
        $branches = \App\Models\Branch::where('chain_id', $caffeRomaChain)->get();
        
        if ($branches->count() < 3) {
            $this->command->warn('Not enough Caffè Roma branches found');
            return;
        }
        
        $corsoBranch = $branches->where('id', 16)->first(); // Via del Corso
        $trastevereBranch = $branches->where('id', 17)->first(); // Trastevere
        $terminiBranch = $branches->where('id', 18)->first(); // Termini
        
        if (!$corsoBranch || !$trastevereBranch || !$terminiBranch) {
            $this->command->warn('Some Caffè Roma branches not found');
            return;
        }
        
        // Get Caffè Roma users
        $users = \App\Models\User::where('chain_id', $caffeRomaChain)->get();
        
        foreach ($users as $user) {
            switch ($user->role) {
                case 'chain_owner':
                    // Chain owner has access to all branches
                    $this->assignUserToBranches($user, $branches->all(), 'owner');
                    break;
                    
                case 'branch_manager':
                    // Assign each manager to 1-2 branches
                    if ($user->email === 'alessandro.verdi@cafferoma.it') {
                        $this->assignUserToBranches($user, [$corsoBranch, $trastevereBranch], 'manager', $corsoBranch->id);
                    } elseif ($user->email === 'giulia.bianchi@cafferoma.it') {
                        $this->assignUserToBranches($user, [$trastevereBranch, $terminiBranch], 'manager', $trastevereBranch->id);
                    } elseif ($user->email === 'francesca.neri@cafferoma.it') {
                        $this->assignUserToBranches($user, [$terminiBranch, $corsoBranch], 'manager', $terminiBranch->id);
                    }
                    break;
                    
                case 'barista':
                    // Assign baristas to specific branches
                    $branchAssignments = [
                        'luca.ferrari@cafferoma.it' => [$corsoBranch],
                        'sofia.romano@cafferoma.it' => [$corsoBranch], 
                        'andrea.colombo@cafferoma.it' => [$trastevereBranch],
                        'elena.ricci@cafferoma.it' => [$trastevereBranch],
                        'matteo.conti@cafferoma.it' => [$terminiBranch],
                        'chiara.marino@cafferoma.it' => [$terminiBranch]
                    ];
                    
                    if (isset($branchAssignments[$user->email])) {
                        $this->assignUserToBranches(
                            $user, 
                            $branchAssignments[$user->email], 
                            'staff',
                            $branchAssignments[$user->email][0]->id
                        );
                    }
                    break;
            }
        }
    }
    
    private function assignUserToBranches($user, $branches, $roleAtBranch, $primaryBranchId = null)
    {
        foreach ($branches as $branch) {
            if (!$branch) continue;
            
            $isPrimary = ($primaryBranchId === $branch->id) || (count($branches) === 1);
            
            // Check if assignment already exists
            $existing = \DB::table('user_branches')
                ->where('user_id', $user->id)
                ->where('branch_id', $branch->id)
                ->first();
                
            if (!$existing) {
                \DB::table('user_branches')->insert([
                    'user_id' => $user->id,
                    'branch_id' => $branch->id,
                    'role_at_branch' => $roleAtBranch,
                    'is_primary_branch' => $isPrimary,
                    'assigned_at' => now(),
                    'permissions' => json_encode($this->getDefaultPermissions($roleAtBranch)),
                    'work_schedule' => json_encode($this->getDefaultSchedule($roleAtBranch)),
                    'created_at' => now(),
                    'updated_at' => now()
                ]);
                
                $this->command->info("Assigned {$user->name} to {$branch->name} as {$roleAtBranch}" . ($isPrimary ? ' (PRIMARY)' : ''));
            }
        }
    }
    
    private function getDefaultPermissions($role)
    {
        $permissions = [
            'owner' => [
                'view_orders' => true,
                'manage_orders' => true,
                'view_staff' => true,
                'manage_staff' => true,
                'view_reports' => true,
                'manage_menu' => true,
                'manage_settings' => true
            ],
            'manager' => [
                'view_orders' => true,
                'manage_orders' => true,
                'view_staff' => true,
                'manage_staff' => true,
                'view_reports' => true,
                'manage_menu' => false,
                'manage_settings' => false
            ],
            'staff' => [
                'view_orders' => true,
                'manage_orders' => true,
                'view_staff' => false,
                'manage_staff' => false,
                'view_reports' => false,
                'manage_menu' => false,
                'manage_settings' => false
            ]
        ];
        
        return $permissions[$role] ?? $permissions['staff'];
    }
    
    private function getDefaultSchedule($role)
    {
        return [
            'monday' => ['start' => '07:00', 'end' => '15:00'],
            'tuesday' => ['start' => '07:00', 'end' => '15:00'],
            'wednesday' => ['start' => '07:00', 'end' => '15:00'],
            'thursday' => ['start' => '07:00', 'end' => '15:00'],
            'friday' => ['start' => '07:00', 'end' => '15:00'],
            'saturday' => $role === 'owner' ? ['start' => '08:00', 'end' => '14:00'] : null,
            'sunday' => $role === 'owner' ? ['start' => '09:00', 'end' => '13:00'] : null
        ];
    }
}
