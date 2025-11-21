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
        Schema::table('menu_items', function (Blueprint $table) {
            // Add new fields for enhanced menu item functionality
            $table->text('description')->nullable()->after('name');
            $table->boolean('customizable')->default(false)->after('is_available');
            $table->json('customization_options')->nullable()->after('customizable');
            $table->json('nutritional_info')->nullable()->after('customization_options');
            $table->json('allergens')->nullable()->after('nutritional_info');
            $table->integer('preparation_time')->nullable()->comment('Preparation time in minutes')->after('allergens');
            
            // Add inventory tracking
            $table->integer('stock_quantity')->nullable()->after('preparation_time');
            $table->boolean('track_inventory')->default(false)->after('stock_quantity');
            
            // Add popularity and rating fields
            $table->integer('orders_count')->default(0)->after('track_inventory');
            $table->decimal('average_rating', 3, 2)->nullable()->after('orders_count');
            
            // Add timestamps for availability
            $table->timestamp('available_from')->nullable()->after('average_rating');
            $table->timestamp('available_until')->nullable()->after('available_from');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('menu_items', function (Blueprint $table) {
            $table->dropColumn([
                'description',
                'customizable',
                'customization_options',
                'nutritional_info',
                'allergens',
                'preparation_time',
                'stock_quantity',
                'track_inventory',
                'orders_count',
                'average_rating',
                'available_from',
                'available_until'
            ]);
        });
    }
};