<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('payouts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('bar_id')->constrained()->onDelete('cascade');
            $table->decimal('amount', 10, 2); // Net amount paid to bar
            $table->decimal('commission', 10, 2); // Platform cut (e.g., 10%)
            $table->date('period_start');
            $table->date('period_end');
            $table->enum('status', ['pending', 'processed', 'failed'])->default('pending');
            $table->string('transaction_ref')->nullable(); // Bank or Stripe payout ID
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('payouts');
    }
};