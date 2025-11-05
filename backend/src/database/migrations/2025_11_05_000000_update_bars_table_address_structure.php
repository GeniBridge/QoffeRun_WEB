<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bars', function (Blueprint $table) {
            // Rinomina e aggiorna i campi indirizzo esistenti per essere più specifici
            $table->renameColumn('address_street', 'via');
            $table->renameColumn('address_number', 'numero_civico');
            $table->renameColumn('address_city', 'citta');
            $table->renameColumn('address_province', 'provincia');
            $table->renameColumn('address_region', 'regione');
            $table->renameColumn('address_postal_code', 'cap');
            
            // Aggiungi nuovi campi per l'indirizzo completo
            $table->text('indirizzo_completo')->nullable()->after('address');
            $table->string('paese', 100)->default('Italia')->after('cap');
            $table->string('place_name')->nullable()->after('paese'); // Nome del luogo da Google Maps
            
            // Aggiungi campi per i dati del gestore/proprietario
            $table->string('gestore_nome')->nullable()->after('user_id');
            $table->string('gestore_cognome')->nullable()->after('gestore_nome');
            $table->string('gestore_email')->nullable()->after('gestore_cognome');
            $table->string('gestore_telefono', 20)->nullable()->after('gestore_email');
            
            // Stato della registrazione
            $table->enum('registration_status', ['pending', 'approved', 'rejected'])
                  ->default('pending')->after('status');
            $table->timestamp('registration_date')->nullable()->after('registration_status');
            $table->text('registration_notes')->nullable()->after('registration_date');
        });
    }

    public function down()
    {
        Schema::table('bars', function (Blueprint $table) {
            // Ripristina i nomi originali
            $table->renameColumn('via', 'address_street');
            $table->renameColumn('numero_civico', 'address_number');
            $table->renameColumn('citta', 'address_city');
            $table->renameColumn('provincia', 'address_province');
            $table->renameColumn('regione', 'address_region');
            $table->renameColumn('cap', 'address_postal_code');
            
            // Rimuovi i campi aggiunti
            $table->dropColumn([
                'indirizzo_completo',
                'paese',
                'place_name',
                'gestore_nome',
                'gestore_cognome',
                'gestore_email',
                'gestore_telefono',
                'registration_status',
                'registration_date',
                'registration_notes'
            ]);
        });
    }
};