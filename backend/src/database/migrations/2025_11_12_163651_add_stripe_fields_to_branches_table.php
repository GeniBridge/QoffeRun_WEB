<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            // Add only missing Stripe Connect fields (stripe_account_id already exists)
            if (!Schema::hasColumn('branches', 'separate_payments')) {
                $table->boolean('separate_payments')->default(false)->after('stripe_account_id')->comment('If true, branch has its own Stripe account separate from chain');
            }
            if (!Schema::hasColumn('branches', 'branch_commission_rate')) {
                $table->decimal('branch_commission_rate', 5, 2)->nullable()->after('separate_payments')->comment('Override commission rate for this specific branch');
            }
            if (!Schema::hasColumn('branches', 'payout_schedule')) {
                $table->enum('payout_schedule', ['daily', 'weekly', 'monthly'])->default('daily')->after('branch_commission_rate')->comment('Payout schedule for this branch');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn(['separate_payments', 'branch_commission_rate', 'payout_schedule']);
            // Note: not dropping stripe_account_id as it existed before this migration
        });
    }
};
