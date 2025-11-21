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
        Schema::table('orders', function (Blueprint $table) {
            // Add timestamp fields for payment processing
            if (!Schema::hasColumn('orders', 'commission_transferred_at')) {
                $table->timestamp('commission_transferred_at')->nullable()->after('commission_status');
            }
            if (!Schema::hasColumn('orders', 'payment_confirmed_at')) {
                $table->timestamp('payment_confirmed_at')->nullable()->after('payment_status');
            }
            if (!Schema::hasColumn('orders', 'status_updated_at')) {
                $table->timestamp('status_updated_at')->nullable()->after('status');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'commission_transferred_at',
                'payment_confirmed_at', 
                'status_updated_at'
            ]);
        });
    }
};
