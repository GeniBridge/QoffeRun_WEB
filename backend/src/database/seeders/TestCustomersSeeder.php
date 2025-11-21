<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\Chain;
use App\Models\Branch;

class TestCustomersSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Creating test customer users...');

        // Test customers with different profiles
        $customers = [
            [
                'name' => 'Anna Bianchi',
                'email' => 'anna.bianchi@gmail.com',
                'phone' => '+39 347 1111111',
                'profile' => 'Regular coffee lover - prefers cappuccino and cornetto'
            ],
            [
                'name' => 'Marco Rossi',
                'email' => 'marco.customer@gmail.com',
                'phone' => '+39 348 2222222',
                'profile' => 'Business customer - quick espresso orders during work breaks'
            ],
            [
                'name' => 'Giulia Verdi',
                'email' => 'giulia.verdi@outlook.it',
                'phone' => '+39 349 3333333',
                'profile' => 'Student - likes customized drinks and pastries'
            ],
            [
                'name' => 'Alessandro Romano',
                'email' => 'alex.romano@yahoo.it',
                'phone' => '+39 340 4444444',
                'profile' => 'Tourist - tries different locations and local specialties'
            ],
            [
                'name' => 'Sofia Ferretti',
                'email' => 'sofia.ferretti@libero.it',
                'phone' => '+39 351 5555555',
                'profile' => 'Food blogger - detailed reviews and custom orders'
            ],
            [
                'name' => 'Matteo Costa',
                'email' => 'matteo.costa@gmail.com',
                'phone' => '+39 352 6666666',
                'profile' => 'Local resident - frequent orders from nearby branches'
            ]
        ];

        foreach ($customers as $customerData) {
            $customer = User::create([
                'name' => $customerData['name'],
                'email' => $customerData['email'],
                'phone' => $customerData['phone'],
                'password' => Hash::make('customer123'),
                'email_verified_at' => now(),
                'role' => 'customer',
                'chain_id' => null, // Customers don't belong to specific chains
                'work_preferences' => json_encode([
                    'profile_type' => $customerData['profile'],
                    'preferred_branches' => [],
                    'dietary_restrictions' => [],
                    'favorite_customizations' => []
                ]),
            ]);

            $this->command->info("✅ Customer created: {$customer->name} ({$customer->email})");
        }

        $this->command->info("\n=== TEST CUSTOMERS CREATED ===");
        $this->command->info("Total customers: " . count($customers));
        $this->command->info("Default password for all customers: customer123");
        $this->command->info("\n=== TESTING WORKFLOW ===");
        $this->command->info("1. Branch Discovery: https://qofferun.com/branch-discovery.html");
        $this->command->info("2. Select branch and browse menu");
        $this->command->info("3. Customize products and add to cart");
        $this->command->info("4. Proceed to checkout");
        $this->command->info("\n=== SAMPLE CUSTOMER CREDENTIALS ===");
        $this->command->info("Email: anna.bianchi@gmail.com");
        $this->command->info("Password: customer123");
        $this->command->info("\nEmail: giulia.verdi@outlook.it");
        $this->command->info("Password: customer123");
    }
}