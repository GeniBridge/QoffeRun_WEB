<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Riferimento alla catena (per dipendenti)
            $table->foreignId('chain_id')->nullable()->after('role')->constrained('chains')->onDelete('set null');
            
            // Campi dipendente
            $table->string('employee_code', 50)->nullable()->after('chain_id');
            $table->date('hire_date')->nullable()->after('employee_code');
            $table->date('termination_date')->nullable()->after('hire_date');
            
            // Contatti emergenza e preferenze
            $table->json('emergency_contact')->nullable()->after('termination_date');
            $table->json('work_preferences')->nullable()->after('emergency_contact');
            
            // Indici
            $table->index(['chain_id']);
            $table->index(['employee_code']);
        });
        
        // I nuovi ruoli saranno validati a livello applicativo
        // Non serve modificare il campo role essendo già VARCHAR
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['chain_id']);
            $table->dropColumn([
                'chain_id',
                'employee_code', 
                'hire_date',
                'termination_date',
                'emergency_contact',
                'work_preferences'
            ]);
        });
        
        // Il campo role rimane VARCHAR, nessun cambio necessario
    }
};
