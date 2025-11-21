<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Chain;
use App\Models\Branch;

class CaffeRomaUsersSeeder extends Seeder
{
    public function run(): void
    {
        // Get the Caffè Roma chain
        $chain = Chain::where('name', 'Caffè Roma')->first();
        if (!$chain) {
            $this->command->error('Caffè Roma chain not found. Run PublicBranchSeeder first.');
            return;
        }

        $branches = Branch::where('chain_id', $chain->id)->get();

        // 1. Create Chain Owner (if not exists)
        $chainOwner = User::find($chain->owner_id);
        if (!$chainOwner) {
            $chainOwner = User::create([
                'name' => 'Marco Rossi',
                'email' => 'marco.rossi@cafferoma.it',
                'phone' => '+39 347 1234567',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'role' => 'chain_owner',
                'chain_id' => $chain->id,
                'hire_date' => now()->subYears(3),
            ]);
            
            // Update chain owner_id
            $chain->update(['owner_id' => $chainOwner->id]);
        }

        $this->command->info("Chain Owner: {$chainOwner->name} ({$chainOwner->email})");

        // 2. Create Branch Managers for each branch
        $branchManagersData = [
            [
                'name' => 'Giulia Bianchi',
                'email' => 'giulia.bianchi@cafferoma.it',
                'phone' => '+39 348 2345678',
                'branch_name' => 'Caffè Roma - Via del Corso',
            ],
            [
                'name' => 'Alessandro Verdi',
                'email' => 'alessandro.verdi@cafferoma.it',
                'phone' => '+39 349 3456789',
                'branch_name' => 'Caffè Roma - Trastevere',
            ],
            [
                'name' => 'Francesca Neri',
                'email' => 'francesca.neri@cafferoma.it',
                'phone' => '+39 340 4567890',
                'branch_name' => 'Caffè Roma - Termini',
            ],
        ];

        foreach ($branchManagersData as $index => $managerData) {
            $branch = $branches->where('name', $managerData['branch_name'])->first();
            if (!$branch) continue;

            $branchManager = User::create([
                'name' => $managerData['name'],
                'email' => $managerData['email'],
                'phone' => $managerData['phone'],
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'role' => 'branch_manager',
                'chain_id' => $chain->id,
                'hire_date' => now()->subDays(rand(30, 365)),
            ]);

            // Add branch-specific data to user
            $branchManager->update([
                'employee_code' => 'MGR-' . str_pad($branch->id, 3, '0', STR_PAD_LEFT),
                'work_preferences' => json_encode([
                    'branch_id' => $branch->id,
                    'permissions' => [
                        'manage_staff',
                        'manage_orders',
                        'manage_menu',
                        'view_analytics',
                        'manage_schedules'
                    ]
                ]),
            ]);

            $this->command->info("Branch Manager: {$branchManager->name} ({$branchManager->email}) - {$branch->name}");
        }

        // 3. Create Baristas for each branch
        $baristasData = [
            // Via del Corso branch baristas
            [
                'name' => 'Luca Ferrari',
                'email' => 'luca.ferrari@cafferoma.it',
                'phone' => '+39 351 5678901',
                'branch_name' => 'Caffè Roma - Via del Corso',
            ],
            [
                'name' => 'Sofia Romano',
                'email' => 'sofia.romano@cafferoma.it',
                'phone' => '+39 352 6789012',
                'branch_name' => 'Caffè Roma - Via del Corso',
            ],
            // Trastevere branch baristas
            [
                'name' => 'Andrea Colombo',
                'email' => 'andrea.colombo@cafferoma.it',
                'phone' => '+39 353 7890123',
                'branch_name' => 'Caffè Roma - Trastevere',
            ],
            [
                'name' => 'Elena Ricci',
                'email' => 'elena.ricci@cafferoma.it',
                'phone' => '+39 354 8901234',
                'branch_name' => 'Caffè Roma - Trastevere',
            ],
            // Termini branch baristas
            [
                'name' => 'Matteo Conti',
                'email' => 'matteo.conti@cafferoma.it',
                'phone' => '+39 355 9012345',
                'branch_name' => 'Caffè Roma - Termini',
            ],
            [
                'name' => 'Chiara Marino',
                'email' => 'chiara.marino@cafferoma.it',
                'phone' => '+39 356 0123456',
                'branch_name' => 'Caffè Roma - Termini',
            ],
        ];

        foreach ($baristasData as $baristaData) {
            $branch = $branches->where('name', $baristaData['branch_name'])->first();
            if (!$branch) continue;

            $barista = User::create([
                'name' => $baristaData['name'],
                'email' => $baristaData['email'],
                'phone' => $baristaData['phone'],
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'role' => 'barista',
                'chain_id' => $chain->id,
                'hire_date' => now()->subDays(rand(10, 180)),
            ]);

            // Add branch-specific data to user
            $barista->update([
                'employee_code' => 'BAR-' . str_pad($branch->id, 3, '0', STR_PAD_LEFT) . '-' . substr($barista->name, 0, 2),
                'work_preferences' => json_encode([
                    'branch_id' => $branch->id,
                    'hourly_rate' => rand(12, 18) + (rand(0, 99) / 100),
                    'permissions' => [
                        'manage_orders',
                        'update_order_status',
                        'view_menu',
                        'process_payments'
                    ]
                ]),
            ]);

            $this->command->info("Barista: {$barista->name} ({$barista->email}) - {$branch->name}");
        }

        // Summary
        $this->command->info("\n=== CAFFÈ ROMA USERS CREATED ===");
        $this->command->info("Chain: {$chain->name}");
        $this->command->info("Chain Owner: 1 user");
        $this->command->info("Branch Managers: 3 users (1 per branch)");
        $this->command->info("Baristas: 6 users (2 per branch)");
        $this->command->info("Total Users Created: 10");
        $this->command->info("\nDefault Password for all users: password123");
        $this->command->info("\nLogin URLs:");
        $this->command->info("- Chain Owner: https://portal.qofferun.com");
        $this->command->info("- Branch Managers: https://bar.qofferun.com");
        $this->command->info("- Baristas: https://bar.qofferun.com");
    }
}