<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CartItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'cart_id',
        'menu_item_id',
        'quantity',
        'unit_price',
        'total_price',
        'customizations',
        'special_instructions'
    ];

    protected $casts = [
        'unit_price' => 'decimal:2',
        'total_price' => 'decimal:2',
        'customizations' => 'array'
    ];

    // Relationships
    public function cart(): BelongsTo
    {
        return $this->belongsTo(Cart::class);
    }

    public function menuItem(): BelongsTo
    {
        return $this->belongsTo(MenuItem::class);
    }

    // Helper methods
    public function getFormattedCustomizations(): array
    {
        if (!$this->customizations) {
            return [];
        }

        $formatted = [];
        foreach ($this->customizations as $type => $option) {
            $formatted[] = [
                'type' => $type,
                'option' => $option,
                'display' => ucfirst(str_replace('_', ' ', $type)) . ': ' . ucfirst(str_replace('_', ' ', $option))
            ];
        }

        return $formatted;
    }

    public function getCustomizationPrice(): float
    {
        if (!$this->customizations || !$this->menuItem->customization_options) {
            return 0;
        }

        $price = 0;
        $options = is_string($this->menuItem->customization_options) 
            ? json_decode($this->menuItem->customization_options, true) 
            : $this->menuItem->customization_options;

        foreach ($this->customizations as $type => $selectedOption) {
            if (isset($options[$type]['options'][$selectedOption]['price'])) {
                $price += $options[$type]['options'][$selectedOption]['price'];
            }
        }

        return $price;
    }

    public function getBasePrice(): float
    {
        return $this->unit_price - $this->getCustomizationPrice();
    }
}
