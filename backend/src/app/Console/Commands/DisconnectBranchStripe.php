<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Branch;
use App\Models\SystemSetting;
use Stripe\Stripe;
use Stripe\Account;

class DisconnectBranchStripe extends Command
{
    protected $signature = 'branch:disconnect-stripe {id}';
    protected $description = 'Disconnect Stripe Connect account from a branch (and clear DB fields)';

    public function handle(): int
    {
        $id = (int) $this->argument('id');
        $branch = Branch::find($id);
        if (!$branch) {
            $this->error("Branch {$id} not found");
            return self::FAILURE;
        }

        $acct = $branch->stripe_connect_account_id;
        if (!$acct) {
            $this->line(json_encode([
                'success' => true,
                'branch_id' => $branch->id,
                'message' => 'Already disconnected',
                'account_id' => null,
            ], JSON_PRETTY_PRINT));
            return self::SUCCESS;
        }

        // Initialize Stripe if possible
        $stripeSecretKey = SystemSetting::get('stripe_secret_key');
        if ($stripeSecretKey) {
            Stripe::setApiKey($stripeSecretKey);
        }

        // Try to delete account in Stripe (if not a known test acct)
        $deletedAtStripe = null;
        try {
            if ($stripeSecretKey && !str_starts_with($acct, 'acct_1QDd')) {
                $account = Account::retrieve($acct);
                $del = $account->delete();
                $deletedAtStripe = $del->deleted ?? true;
            } else {
                $deletedAtStripe = 'skipped';
            }
        } catch (\Throwable $e) {
            $deletedAtStripe = 'error:' . $e->getMessage();
        }

        // Clear DB fields
        $branch->stripe_connect_account_id = null;
        $branch->stripe_connect_status = 'pending';
        $branch->stripe_connect_capabilities = null;
        $branch->stripe_connect_verified_at = null;
        $branch->save();

        $this->line(json_encode([
            'success' => true,
            'branch_id' => $branch->id,
            'message' => 'Disconnected successfully',
            'account_id' => $acct,
            'stripe_delete' => $deletedAtStripe,
        ], JSON_PRETTY_PRINT));
        return self::SUCCESS;
    }
}
