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
            // Stripe Connect fields for automatic payment distribution
            $table->string('stripe_connect_account_id')->nullable()->after('email');
            $table->enum('stripe_connect_status', ['pending', 'active', 'inactive', 'rejected'])->default('pending')->after('stripe_connect_account_id');
            $table->json('stripe_connect_capabilities')->nullable()->after('stripe_connect_status');
            $table->timestamp('stripe_connect_verified_at')->nullable()->after('stripe_connect_capabilities');
            
            // Commission settings
            $table->decimal('commission_rate', 5, 2)->default(5.00)->after('stripe_connect_verified_at');
            $table->boolean('accepts_online_orders')->default(true)->after('commission_rate');
            
            // Order management settings
            $table->integer('max_orders_per_hour')->default(20)->after('accepts_online_orders');
            $table->time('online_ordering_start')->nullable()->after('max_orders_per_hour');
            $table->time('online_ordering_end')->nullable()->after('online_ordering_start');
        });
        
        Schema::table('chains', function (Blueprint $table) {
            // Chain-level Stripe and commission settings
            $table->decimal('default_commission_rate', 5, 2)->default(5.00)->after('description');
            $table->string('stripe_connect_platform_account')->nullable()->after('default_commission_rate');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('branches', function (Blueprint $table) {
            $table->dropColumn([
                'stripe_connect_account_id',
                'stripe_connect_status', 
                'stripe_connect_capabilities',
                'stripe_connect_verified_at',
                'commission_rate',
                'accepts_online_orders',
                'max_orders_per_hour',
                'online_ordering_start',
                'online_ordering_end'
            ]);
        });
        
        Schema::table('chains', function (Blueprint $table) {
            $table->dropColumn([
                'default_commission_rate',
                'stripe_connect_platform_account'
            ]);
        });
    }
};