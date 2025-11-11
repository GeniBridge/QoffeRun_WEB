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
        Schema::create('chains', function (Blueprint $table) {
            $table->id();
            
            // Proprietario della catena
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            
            // Informazioni base catena
            $table->string('name')->comment('Nome catena (es. "Caffè Centrale")');
            $table->string('business_name')->nullable()->comment('Ragione sociale');
            $table->string('vat_number', 50)->unique()->nullable()->comment('Partita IVA');
            $table->string('tax_code', 50)->nullable()->comment('Codice fiscale');
            
            // Indirizzi
            $table->text('legal_address')->nullable()->comment('Sede legale');
            $table->text('billing_address')->nullable()->comment('Indirizzo fatturazione');
            
            // Contatti
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            $table->string('pec_email')->nullable()->comment('Email PEC per fatturazione elettronica');
            $table->string('website')->nullable();
            $table->string('logo_path', 500)->nullable();
            
            // Configurazione Pagamenti
            $table->string('stripe_account_id')->nullable()->comment('Account Stripe Connect della catena');
            $table->enum('payment_mode', ['unified', 'separate'])->default('unified');
            $table->decimal('commission_rate', 5, 2)->default(15.00);
            
            // Status e Metadata
            $table->enum('status', ['active', 'suspended', 'closed'])->default('active');
            $table->boolean('onboarding_completed')->default(false);
            $table->integer('total_branches')->default(0);
            
            $table->timestamps();
            
            // Indici
            $table->index(['owner_id']);
            $table->index(['status']);
            $table->index(['vat_number']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('chains');
    }
};
