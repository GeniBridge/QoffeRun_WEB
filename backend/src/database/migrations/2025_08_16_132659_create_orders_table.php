<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('bar_id')->constrained()->onDelete('cascade');
            $table->decimal('total', 10, 2);
            $table->string('code_4digit', 4)->unique(); // Unique pickup code
            $table->enum('status', ['pending', 'confirmed', 'ready', 'completed', 'cancelled'])
                  ->default('pending');
            $table->enum('payment_status', ['paid', 'failed'])->default('paid');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('orders');
    }
};