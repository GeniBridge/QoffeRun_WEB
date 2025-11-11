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
        Schema::create('branches', function (Blueprint $table) {
            $table->id();
            
            // Riferimento alla catena
            $table->foreignId('chain_id')->constrained('chains')->onDelete('cascade');
            
            // Informazioni base filiale
            $table->string('code', 50)->comment('Codice univoco filiale (es. "ROM001", "MIL001")');
            $table->string('name')->comment('Nome filiale');
            
            // Indirizzo e Localizzazione  
            $table->text('address')->comment('Indirizzo completo');
            $table->string('city', 100);
            $table->string('province', 5)->nullable();
            $table->string('cap', 10)->nullable();
            $table->string('region', 100)->nullable();
            $table->string('country', 100)->default('Italia');
            $table->decimal('latitude', 10, 8)->nullable();
            $table->decimal('longitude', 11, 8)->nullable();
            
            // Contatti
            $table->string('phone', 50)->nullable();
            $table->string('email')->nullable();
            
            // Configurazione Operativa
            $table->json('opening_hours')->nullable()->comment('Orari di apertura strutturati');
            $table->boolean('delivery_enabled')->default(true);
            $table->boolean('takeaway_enabled')->default(true);
            $table->boolean('table_service_enabled')->default(false);
            
            // Pagamenti e Fatturazione
            $table->boolean('has_separate_billing')->default(false);
            $table->string('stripe_account_id')->nullable()->comment('Account Stripe specifico (opzionale)');
            $table->string('pos_system', 100)->nullable()->comment('Sistema POS utilizzato');
            
            // Capacità e Limiti
            $table->integer('max_daily_orders')->default(1000);
            $table->integer('seating_capacity')->nullable();
            $table->integer('staff_count')->default(0);
            
            // Status
            $table->enum('status', ['active', 'inactive', 'maintenance', 'temporarily_closed'])->default('active');
            $table->date('opening_date')->nullable();
            
            $table->timestamps();
            
            // Indici e constraints
            $table->unique(['chain_id', 'code'], 'unique_chain_code');
            $table->index(['chain_id']);
            $table->index(['status', 'city']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branches');
    }
};
