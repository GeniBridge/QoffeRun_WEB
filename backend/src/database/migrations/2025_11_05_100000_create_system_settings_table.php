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
        Schema::create('system_settings', function (Blueprint $table) {
            $table->id();
            $table->string('key')->unique(); // Chiave univoca per l'impostazione
            $table->text('value'); // Valore dell'impostazione (JSON o testo)
            $table->string('type')->default('string'); // string, json, boolean, number
            $table->string('category'); // google_maps, emails, stripe, social, notifications, commissions
            $table->string('name'); // Nome leggibile dell'impostazione
            $table->text('description')->nullable(); // Descrizione dell'impostazione
            $table->boolean('is_encrypted')->default(false); // Se il valore deve essere crittografato
            $table->boolean('is_public')->default(false); // Se può essere letto dal frontend
            $table->timestamps();
            
            // Indici per performance
            $table->index(['category']);
            $table->index(['key', 'category']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('system_settings');
    }
};