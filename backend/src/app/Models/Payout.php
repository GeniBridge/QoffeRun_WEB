<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payout extends Model
{
    protected $fillable = [
        'bar_id',
        'amount',
        'commission',
        'period_start',
        'period_end',
        'status',
        'transaction_ref'
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date'
    ];

    public function bar(): BelongsTo
    {
        return $this->belongsTo(Bar::class);
    }
}