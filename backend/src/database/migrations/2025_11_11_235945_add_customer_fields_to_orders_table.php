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
            // Customer information for guest orders
            $table->string('customer_name')->nullable()->after('user_id');
            $table->string('customer_email')->nullable()->after('customer_name');
            $table->string('customer_phone', 50)->nullable()->after('customer_email');
            
            // Order identification
            $table->string('order_number', 50)->unique()->nullable()->after('customer_phone');
            
            // Pricing breakdown
            $table->decimal('subtotal_amount', 10, 2)->nullable()->after('total');
            $table->decimal('tax_amount', 10, 2)->default(0.00)->after('subtotal_amount');
            $table->decimal('total_amount', 10, 2)->nullable()->after('tax_amount');
            $table->string('currency', 3)->default('eur')->after('total_amount');
            
            // Additional notes
            $table->text('notes')->nullable()->after('special_instructions');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn([
                'customer_name',
                'customer_email', 
                'customer_phone',
                'order_number',
                'subtotal_amount',
                'tax_amount',
                'total_amount',
                'currency',
                'notes'
            ]);
        });
    }
};
