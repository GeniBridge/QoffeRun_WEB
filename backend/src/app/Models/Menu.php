<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Menu extends Model
{
    protected $fillable = ['branch_id', 'name', 'description', 'menu_type', 'is_active'];

    protected $casts = [
        'is_active' => 'boolean'
    ];

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(MenuItem::class, 'menu_id');
    }

    public function availableItems(): HasMany
    {
        return $this->items()->where('is_available', true);
    }

    // Legacy relationship for backward compatibility
    public function bar(): BelongsTo
    {
        return $this->belongsTo(\App\Models\Bar::class, 'branch_id');
    }
}