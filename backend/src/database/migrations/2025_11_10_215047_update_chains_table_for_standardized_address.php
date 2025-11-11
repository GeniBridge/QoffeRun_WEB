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
        Schema::table('chains', function (Blueprint $table) {
            // Add standardized address fields for legal address
            $table->string('legal_via')->nullable()->after('legal_address')->comment('Legal address street name');
            $table->string('legal_numero_civico', 20)->nullable()->after('legal_via')->comment('Legal address street number');
            $table->string('legal_citta', 100)->nullable()->after('legal_numero_civico')->comment('Legal address city');
            $table->string('legal_provincia', 5)->nullable()->after('legal_citta')->comment('Legal address province code');
            $table->string('legal_regione', 100)->nullable()->after('legal_provincia')->comment('Legal address region');
            $table->string('legal_cap', 10)->nullable()->after('legal_regione')->comment('Legal address postal code');
            $table->string('legal_paese', 100)->default('Italia')->after('legal_cap')->comment('Legal address country');
            $table->decimal('legal_lat', 10, 8)->nullable()->after('legal_paese')->comment('Legal address latitude');
            $table->decimal('legal_lng', 11, 8)->nullable()->after('legal_lat')->comment('Legal address longitude');
            
            // Add standardized address fields for billing address
            $table->string('billing_via')->nullable()->after('billing_address')->comment('Billing address street name');
            $table->string('billing_numero_civico', 20)->nullable()->after('billing_via')->comment('Billing address street number');
            $table->string('billing_citta', 100)->nullable()->after('billing_numero_civico')->comment('Billing address city');
            $table->string('billing_provincia', 5)->nullable()->after('billing_citta')->comment('Billing address province code');
            $table->string('billing_regione', 100)->nullable()->after('billing_provincia')->comment('Billing address region');
            $table->string('billing_cap', 10)->nullable()->after('billing_regione')->comment('Billing address postal code');
            $table->string('billing_paese', 100)->default('Italia')->after('billing_cap')->comment('Billing address country');
            $table->decimal('billing_lat', 10, 8)->nullable()->after('billing_paese')->comment('Billing address latitude');
            $table->decimal('billing_lng', 11, 8)->nullable()->after('billing_lat')->comment('Billing address longitude');
            
            // Keep existing fields for backward compatibility initially
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('chains', function (Blueprint $table) {
            $table->dropColumn([
                'legal_via', 'legal_numero_civico', 'legal_citta', 'legal_provincia', 
                'legal_regione', 'legal_cap', 'legal_paese', 'legal_lat', 'legal_lng',
                'billing_via', 'billing_numero_civico', 'billing_citta', 'billing_provincia',
                'billing_regione', 'billing_cap', 'billing_paese', 'billing_lat', 'billing_lng'
            ]);
        });
    }
};
