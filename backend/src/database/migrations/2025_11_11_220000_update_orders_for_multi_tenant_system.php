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
        // Update orders table to work with the new multi-tenant system
        Schema::table('orders', function (Blueprint $table) {
            // Replace bar_id with branch_id for multi-tenant support
            $table->dropForeign(['bar_id']);
            $table->dropColumn('bar_id');
            
            // Add new multi-tenant fields
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade')->after('user_id');
            $table->foreignId('chain_id')->constrained('chains')->onDelete('cascade')->after('branch_id');
            
            // Add staff/manager tracking
            $table->foreignId('served_by')->nullable()->constrained('users')->onDelete('set null')->after('chain_id');
            $table->string('branch_code', 50)->nullable()->after('served_by');
            
            // Add order type and delivery info
            $table->enum('order_type', ['takeaway', 'delivery', 'table_service'])->default('takeaway')->after('status');
            $table->text('delivery_address')->nullable()->after('order_type');
            $table->text('special_instructions')->nullable()->after('delivery_address');
            
            // Add timing fields
            $table->timestamp('scheduled_for')->nullable()->after('special_instructions');
            $table->timestamp('prepared_at')->nullable()->after('scheduled_for');
            $table->timestamp('delivered_at')->nullable()->after('prepared_at');
            
            // Add commission tracking
            $table->decimal('commission_rate', 5, 2)->default(5.00)->after('total');
            $table->decimal('commission_amount', 10, 2)->default(0.00)->after('commission_rate');
            $table->decimal('branch_amount', 10, 2)->default(0.00)->after('commission_amount');
            
            // Add payment processing fields
            $table->string('stripe_payment_intent_id')->nullable()->after('payment_status');
            $table->string('stripe_transfer_id')->nullable()->after('stripe_payment_intent_id');
            $table->enum('commission_status', ['pending', 'transferred', 'failed'])->default('pending')->after('stripe_transfer_id');
        });
        
        // Update menus table to work with branches instead of bars
        Schema::table('menus', function (Blueprint $table) {
            $table->dropForeign(['bar_id']);
            $table->dropColumn('bar_id');
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade')->after('id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            // Remove new fields
            $table->dropForeign(['branch_id']);
            $table->dropForeign(['chain_id']);
            $table->dropForeign(['served_by']);
            $table->dropColumn([
                'branch_id', 'chain_id', 'served_by', 'branch_code',
                'order_type', 'delivery_address', 'special_instructions',
                'scheduled_for', 'prepared_at', 'delivered_at',
                'commission_rate', 'commission_amount', 'branch_amount',
                'stripe_payment_intent_id', 'stripe_transfer_id', 'commission_status'
            ]);
            
            // Restore bar_id
            $table->foreignId('bar_id')->constrained('bars')->onDelete('cascade')->after('user_id');
        });
        
        Schema::table('menus', function (Blueprint $table) {
            $table->dropForeign(['branch_id']);
            $table->dropColumn('branch_id');
            $table->foreignId('bar_id')->constrained('bars')->onDelete('cascade')->after('id');
        });
    }
};