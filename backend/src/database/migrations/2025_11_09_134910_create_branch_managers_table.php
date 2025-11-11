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
        Schema::create('branch_managers', function (Blueprint $table) {
            $table->id();
            
            // Riferimenti
            $table->foreignId('branch_id')->constrained('branches')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade')->comment('Riferimento al gestore');
            $table->foreignId('assigned_by')->constrained('users')->onDelete('set null')->comment('Chi ha assegnato');
            
            // Assegnazione e Status
            $table->timestamp('assigned_at')->useCurrent();
            $table->enum('status', ['active', 'suspended', 'removed'])->default('active');
            $table->boolean('is_primary_manager')->default(false)->comment('Gestore principale della filiale');
            
            // Permessi e Configurazione
            $table->json('permissions')->nullable()->comment('Permessi specifici per questa filiale');
            $table->decimal('max_discount_percentage', 5, 2)->default(10.00);
            $table->boolean('can_access_reports')->default(true);
            $table->boolean('can_manage_staff')->default(false);
            $table->boolean('can_modify_menu')->default(false);
            
            // Orari di Lavoro
            $table->json('work_schedule')->nullable()->comment('Programma turni del gestore');
            $table->decimal('hourly_rate', 8, 2)->nullable()->comment('Tariffa oraria (opzionale)');
            
            // Note e Metadata
            $table->text('notes')->nullable()->comment('Note private del titolare');
            $table->timestamp('last_activity_at')->nullable();
            
            $table->timestamps();
            
            // Indici e constraints
            $table->unique(['branch_id', 'user_id', 'status'], 'unique_active_assignment');
            $table->index(['user_id']);
            $table->index(['assigned_by']);
            $table->index(['status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('branch_managers');
    }
};
