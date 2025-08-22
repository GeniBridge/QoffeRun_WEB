<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::table('bars', function (Blueprint $table) {
            // Address (flat fields; keep legacy text 'address' for now)
            $table->string('address_street')->nullable()->after('name');
            $table->string('address_number', 20)->nullable()->after('address_street');
            $table->string('address_city')->nullable()->after('address_number');
            $table->string('address_province', 10)->nullable()->after('address_city');
            $table->string('address_region')->nullable()->after('address_province');
            $table->string('address_postal_code', 20)->nullable()->after('address_region');

            // Details
            $table->text('description')->nullable()->after('longitude');

            // Hours (flat, not JSON)
            $table->time('weekdays_open')->nullable()->after('description');
            $table->time('weekdays_close')->nullable()->after('weekdays_open');
            $table->time('weekend_open')->nullable()->after('weekdays_close');
            $table->time('weekend_close')->nullable()->after('weekend_open');

            // Photo (keep existing logo & cover_image)
            $table->string('photo')->nullable()->after('logo'); // /storage/bars/photos/...
        });
    }

    public function down()
    {
        Schema::table('bars', function (Blueprint $table) {
            $table->dropColumn([
                'address_street',
                'address_number',
                'address_city',
                'address_province',
                'address_region',
                'address_postal_code',
                'description',
                'weekdays_open',
                'weekdays_close',
                'weekend_open',
                'weekend_close',
                'photo',
            ]);
        });
    }
};
