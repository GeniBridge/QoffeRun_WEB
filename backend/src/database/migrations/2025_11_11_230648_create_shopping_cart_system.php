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
        // Cart table - for persistent cart storage
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->string('session_id')->nullable(); // For guest users
            $table->unsignedBigInteger('user_id')->nullable(); // For logged-in users
            $table->unsignedBigInteger('branch_id'); // Cart is tied to a specific branch
            $table->decimal('subtotal', 10, 2)->default(0);
            $table->decimal('tax_amount', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2)->default(0);
            $table->string('status')->default('active'); // active, abandoned, converted
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->foreign('user_id')->references('id')->on('users')->onDelete('cascade');
            $table->foreign('branch_id')->references('id')->on('branches')->onDelete('cascade');
            
            $table->index(['session_id', 'status']);
            $table->index(['user_id', 'status']);
        });

        // Cart items table
        Schema::create('cart_items', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('cart_id');
            $table->unsignedBigInteger('menu_item_id');
            $table->integer('quantity');
            $table->decimal('unit_price', 8, 2); // Store price at time of adding
            $table->decimal('total_price', 8, 2); // quantity * unit_price + customizations
            $table->json('customizations')->nullable(); // Store selected options
            $table->text('special_instructions')->nullable();
            $table->timestamps();

            $table->foreign('cart_id')->references('id')->on('carts')->onDelete('cascade');
            $table->foreign('menu_item_id')->references('id')->on('menu_items')->onDelete('cascade');
        });

        // Order items customizations - for tracking customizations in orders
        Schema::create('order_item_customizations', function (Blueprint $table) {
            $table->id();
            $table->unsignedBigInteger('order_item_id');
            $table->string('customization_type'); // size, milk_type, extra, etc.
            $table->string('option_name');
            $table->decimal('price_modifier', 6, 2)->default(0); // Additional cost
            $table->timestamps();

            // We'll add the foreign key after updating order_items table
            $table->index('order_item_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('order_item_customizations');
        Schema::dropIfExists('cart_items');
        Schema::dropIfExists('carts');
    }
};
