<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    protected $fillable = [
        'menu_id',
        'name',
        'price',
        'category',
        'is_available',
        'image'
    ];

    // Accessor for image URL
    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }
}