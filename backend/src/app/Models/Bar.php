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

        // Legacy combined address (kept for compat)
        'address',

        // New structured address fields (updated names)
        'indirizzo_completo',
        'via',
        'numero_civico', 
        'citta',
        'provincia',
        'regione',
        'cap',
        'paese',
        'place_name',

        // Geo coordinates
        'latitude',
        'longitude',

        // Bar details
        'description',
        'weekdays_open',
        'weekdays_close',
        'weekend_open',
        'weekend_close',

        // Media files
        'logo',
        'photo',
        'cover_image',

        // Manager/Owner details
        'gestore_nome',
        'gestore_cognome',
        'gestore_email',
        'gestore_telefono',

        // System fields
        'qr_code',
        'status',
        'registration_status',
        'registration_date',
        'registration_notes',
    ];

    /**
     * Automatically include these computed attributes in JSON.
     */
    protected $appends = [
        'logo_url',
        'photo_url', 
        'cover_image_url',
        'address_structured',
        'full_address',
        'gestore_completo',
    ];

    /* ---------------------------
     | Accessors (URLs & Address)
     |--------------------------- */

    public function getLogoUrlAttribute(): ?string
    {
        return $this->logo ? url('storage/' . ltrim($this->logo, '/')) : null;
    }

    public function getPhotoUrlAttribute(): ?string
    {
        return $this->photo ? url('storage/' . ltrim($this->photo, '/')) : null;
    }

    public function getCoverImageUrlAttribute(): ?string
    {
        return $this->cover_image ? url('storage/' . ltrim($this->cover_image, '/')) : null;
    }

    /**
     * Structured address assembled from new Italian address fields.
     */
    public function getAddressStructuredAttribute(): array
    {
        return [
            'formatted_address' => $this->indirizzo_completo,
            'via'              => $this->via,
            'numero_civico'    => $this->numero_civico,
            'citta'            => $this->citta,
            'provincia'        => $this->provincia,
            'regione'          => $this->regione,
            'cap'              => $this->cap,
            'paese'            => $this->paese,
            'place_name'       => $this->place_name,
            'lat'              => $this->latitude,
            'lng'              => $this->longitude,
        ];
    }

    /**
     * Human-readable full address using Italian format.
     */
    public function getFullAddressAttribute(): ?string
    {
        // Use the complete Google Maps formatted address if available
        if ($this->indirizzo_completo) {
            return $this->indirizzo_completo;
        }

        // Otherwise construct from individual fields
        if ($this->via || $this->citta) {
            $parts = array_filter([
                trim(($this->via ?? '') . ' ' . ($this->numero_civico ?? '')),
                trim(($this->cap ?? '') . ' ' . ($this->citta ?? '') . ($this->provincia ? " ({$this->provincia})" : '')),
                $this->regione,
                $this->paese,
            ]);

            return count($parts) ? implode(', ', $parts) : null;
        }

        // Fallback to legacy combined text column
        return $this->address ?: null;
    }

    /**
     * Get complete manager/owner information.
     */
    public function getGestoreCompletoAttribute(): ?string
    {
        if ($this->gestore_nome || $this->gestore_cognome) {
            return trim($this->gestore_nome . ' ' . $this->gestore_cognome);
        }
        return null;
    }

    /* -------------
     | Relationships
     |------------- */

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

    public function settings(): HasMany
    {
        return $this->hasMany(BarSetting::class);
    }
}
