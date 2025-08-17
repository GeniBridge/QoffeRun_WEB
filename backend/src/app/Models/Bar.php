<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Bar extends Model
{
    protected $fillable = [
        'user_id',
        'name',
        'address',
        'latitude',
        'longitude',
        'qr_code',
        'logo',
        'cover_image',
        'status'
    ];

    // Accessors for image URLs
    public function getLogoUrlAttribute()
    {
        return $this->logo ? url('storage/' . $this->logo) : null;
    }

    public function getCoverImageUrlAttribute()
    {
        return $this->cover_image ? url('storage/' . $this->cover_image) : null;
    }

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function menu(): HasMany
    {
        return $this->hasMany(Menu::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payouts(): HasMany
    {
        return $this->hasMany(Payout::class);
    }
}