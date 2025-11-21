<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Branch;

class StripeConnectTestSeeder extends Seeder
{
    public function run(): void
    {
        // Get all Caffè Roma branches
        $branches = Branch::where('chain_id', 16)->get();

        if ($branches->isEmpty()) {
            $this->command->error('No Caffè Roma branches found. Run PublicBranchSeeder first.');
            return;
        }

        $this->command->info('Setting up Stripe Connect for Caffè Roma branches...');

        // Test Stripe Connect accounts for each branch
        $stripeAccounts = [
            'Caffè Roma - Via del Corso' => [
                'account_id' => 'acct_1QDdLxRqFxYzKoFN',
                'status' => 'active',
                'capabilities' => [
                    'card_payments' => 'active',
                    'transfers' => 'active'
                ],
                'verified_at' => now()->subDays(5),
            ],
            'Caffè Roma - Trastevere' => [
                'account_id' => 'acct_1QDdM2RqFxYzKoGP',
                'status' => 'active',
                'capabilities' => [
                    'card_payments' => 'active',
                    'transfers' => 'active'
                ],
                'verified_at' => now()->subDays(3),
            ],
            'Caffè Roma - Termini' => [
                'account_id' => 'acct_1QDdM8RqFxYzKoHQ',
                'status' => 'active',
                'capabilities' => [
                    'card_payments' => 'active',
                    'transfers' => 'active'
                ],
                'verified_at' => now()->subDays(1),
            ],
        ];

        foreach ($branches as $branch) {
            $stripeData = $stripeAccounts[$branch->name] ?? null;
            
            if ($stripeData) {
                $branch->update([
                    'stripe_connect_account_id' => $stripeData['account_id'],
                    'stripe_connect_status' => $stripeData['status'],
                    'stripe_connect_capabilities' => $stripeData['capabilities'],
                    'stripe_connect_verified_at' => $stripeData['verified_at'],
                    'accepts_online_orders' => true,
                    'commission_rate' => 2.5, // 2.5% commission
                    'branch_commission_rate' => 0.5, // 0.5% branch fee
                    'payout_schedule' => 'daily',
                ]);

                $this->command->info("✅ {$branch->name} - Stripe Connect configured");
                $this->command->info("   Account ID: {$stripeData['account_id']}");
                $this->command->info("   Status: {$stripeData['status']}");
                $this->command->info("   Capabilities: " . implode(', ', array_keys($stripeData['capabilities'])));
                $this->command->info("   Verified: {$stripeData['verified_at']->format('Y-m-d H:i')}");
            }
        }

        $this->command->info("\n=== STRIPE CONNECT SETUP COMPLETE ===");
        $this->command->info("All Caffè Roma branches now have active Stripe Connect accounts");
        $this->command->info("Commission: 2.5% + 0.5% branch fee = 3.0% total");
        $this->command->info("Payout Schedule: Daily");
        $this->command->info("\nTest with public API:");
        $this->command->info("curl https://api.qofferun.com/api/v1/public/branches");
    }
}