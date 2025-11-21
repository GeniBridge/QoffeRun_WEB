<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Chain;
use App\Models\Branch;
use App\Models\BranchManager;

class BarPanelTestSeeder extends Seeder
{
    public function run()
    {
        echo "Creating Bar Panel test users...\n";
        
        // 1. Create Chain Owner
        $chainOwner = User::firstOrCreate(
            ['email' => 'owner@test.com'],
            [
                'name' => 'Test Chain Owner',
                'password' => bcrypt('password123'),
                'role' => 'chain_owner',
                'email_verified_at' => now()
            ]
        );

        // 2. Create Branch Manager
        $branchManager = User::firstOrCreate(
            ['email' => 'manager@test.com'],
            [
                'name' => 'Test Branch Manager',
                'password' => bcrypt('password123'),
                'role' => 'branch_manager',
                'email_verified_at' => now()
            ]
        );

        // 3. Create Barista (Staff)
        $barista = User::firstOrCreate(
            ['email' => 'barista@test.com'],
            [
                'name' => 'Test Barista',
                'password' => bcrypt('password123'),
                'role' => 'barista',
                'email_verified_at' => now()
            ]
        );

        // 4. Create a test chain
        $chain = Chain::firstOrCreate(
            ['owner_id' => $chainOwner->id, 'name' => 'Test Coffee Chain'],
            [
                'business_name' => 'Test Coffee Chain S.r.l.',
                'vat_number' => '12345678900',
                'phone' => '+39 02 1234567',
                'email' => 'info@testcoffee.it',
                'payment_mode' => 'unified',
                'commission_rate' => 5.0
            ]
        );

        // 5. Create test branches
        $branch1 = Branch::firstOrCreate(
            ['chain_id' => $chain->id, 'code' => 'TEST001'],
            [
                'name' => 'Test Branch Centro',
                'address' => 'Via Roma 1, Milano',
                'city' => 'Milano',
                'province' => 'MI',
                'cap' => '20121',
                'phone' => '+39 02 1111111',
                'email' => 'centro@testcoffee.it',
                'latitude' => 45.4642,
                'longitude' => 9.1900,
                'status' => 'active'
            ]
        );

        $branch2 = Branch::firstOrCreate(
            ['chain_id' => $chain->id, 'code' => 'TEST002'],
            [
                'name' => 'Test Branch Stazione',
                'address' => 'Piazza Garibaldi 5, Milano', 
                'city' => 'Milano',
                'province' => 'MI',
                'cap' => '20124',
                'phone' => '+39 02 2222222',
                'email' => 'stazione@testcoffee.it',
                'latitude' => 45.4848,
                'longitude' => 9.2076,
                'status' => 'active'
            ]
        );

        // 6. Assign branch manager to branches
        BranchManager::firstOrCreate(
            ['branch_id' => $branch1->id, 'user_id' => $branchManager->id],
            [
                'assigned_by' => $chainOwner->id,
                'status' => 'active',
                'is_primary_manager' => true,
                'permissions' => json_encode(['orders.manage', 'staff.view', 'payments.view'])
            ]
        );

        BranchManager::firstOrCreate(
            ['branch_id' => $branch2->id, 'user_id' => $branchManager->id],
            [
                'assigned_by' => $chainOwner->id,
                'status' => 'active',
                'is_primary_manager' => false,
                'permissions' => json_encode(['orders.manage', 'staff.view'])
            ]
        );

        // 7. Assign chain and branch to users
        $branchManager->update(['chain_id' => $chain->id]);
        $barista->update(['chain_id' => $chain->id]);

        echo "Bar Panel test users created successfully!\n";
        echo "Test Users Created:\n";
        echo "- Chain Owner: owner@test.com / password123\n";
        echo "- Branch Manager: manager@test.com / password123 (manages 2 branches)\n";
        echo "- Barista: barista@test.com / password123\n";
        echo "- Chain: Test Coffee Chain (2 branches)\n";
    }
}