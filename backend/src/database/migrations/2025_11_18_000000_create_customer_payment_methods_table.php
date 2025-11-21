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
        // Add stripe_customer_id to users table
        Schema::table('users', function (Blueprint $table) {
            $table->string('stripe_customer_id')->nullable()->after('remember_token');
        });

        // Create customer_payment_methods table
        Schema::create('customer_payment_methods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('stripe_payment_method_id'); // Stripe PM ID
            $table->string('card_brand'); // visa, mastercard, amex, etc.
            $table->string('card_last4'); // Last 4 digits
            $table->integer('card_exp_month');
            $table->integer('card_exp_year');
            $table->string('card_fingerprint')->nullable(); // Unique card identifier
            $table->boolean('is_default')->default(false);
            $table->json('billing_details')->nullable(); // Name, address, etc.
            $table->timestamps();
            
            // Indexes
            $table->index('user_id');
            $table->index(['user_id', 'is_default']);
            $table->unique('stripe_payment_method_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customer_payment_methods');
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('stripe_customer_id');
        });
    }
};
