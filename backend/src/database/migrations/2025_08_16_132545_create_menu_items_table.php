<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('menu_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('menu_id')->constrained()->onDelete('cascade');
            $table->string('name'); // Cappuccino, Cornetto
            $table->decimal('price', 8, 2);
            $table->string('category')->nullable(); // coffee, pastry, drink
            $table->boolean('is_available')->default(true);
            $table->string('image')->nullable(); // /storage/menu-items/...
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('menu_items');
    }
};