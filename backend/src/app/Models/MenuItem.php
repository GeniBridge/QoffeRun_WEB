<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MenuItem extends Model
{
    protected $fillable = [
        'menu_id',
        'name',
        'description',
        'price',
        'category',
        'is_available',
        'image',
        'customizable',
        'customization_options',
        'nutritional_info',
        'allergens',
        'preparation_time'
    ];

    protected $casts = [
        'is_available' => 'boolean',
        'customizable' => 'boolean',
        'customization_options' => 'array',
        'nutritional_info' => 'array',
        'allergens' => 'array',
        'price' => 'decimal:2',
        'preparation_time' => 'integer'
    ];

    protected $appends = ['image_url'];

    // Accessor for image URL
    public function getImageUrlAttribute()
    {
        return $this->image ? url('storage/' . $this->image) : null;
    }

    public function menu(): BelongsTo
    {
        return $this->belongsTo(Menu::class);
    }

    /**
     * Get the branch through the menu relationship
     */
    public function branch()
    {
        return $this->hasOneThrough(
            \App\Models\Branch::class,
            Menu::class,
            'id',
            'id',
            'menu_id',
            'branch_id'
        );
    }
}