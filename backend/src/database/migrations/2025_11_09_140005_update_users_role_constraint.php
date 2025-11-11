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
        // Rimuovi il constraint esistente
        DB::statement('ALTER TABLE users DROP CONSTRAINT users_role_check');
        
        // Aggiungi il nuovo constraint con i nuovi ruoli
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'barista', 'admin', 'chain_owner', 'branch_manager', 'staff'))");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Ripristina il constraint originale
        DB::statement('ALTER TABLE users DROP CONSTRAINT users_role_check');
        DB::statement("ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('customer', 'barista', 'admin'))");
    }
};
