<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Carbon\Carbon;

class Cart extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'branch_id',
        'subtotal',
        'tax_amount',
        'total_amount',
        'status',
        'expires_at'
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'tax_amount' => 'decimal:2',
        'total_amount' => 'decimal:2',
        'expires_at' => 'datetime'
    ];

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(CartItem::class);
    }

    // Helper methods
    public function addItem(MenuItem $menuItem, int $quantity, array $customizations = [], ?string $specialInstructions = null): CartItem
    {
        // Calculate customization price
        $customizationPrice = $this->calculateCustomizationPrice($customizations, $menuItem);
        $unitPrice = $menuItem->price + $customizationPrice;
        $totalPrice = $unitPrice * $quantity;

        // Check if item with same customizations already exists
        $existingItem = $this->items()
            ->where('menu_item_id', $menuItem->id)
            ->where('special_instructions', $specialInstructions)
            ->get()
            ->first(function ($item) use ($customizations) {
                return $item->customizations == $customizations;
            });

        if ($existingItem) {
            // Update existing item
            $existingItem->quantity += $quantity;
            $existingItem->total_price = $existingItem->unit_price * $existingItem->quantity;
            $existingItem->save();
            $cartItem = $existingItem;
        } else {
            // Create new item
            $cartItem = $this->items()->create([
                'menu_item_id' => $menuItem->id,
                'quantity' => $quantity,
                'unit_price' => $unitPrice,
                'total_price' => $totalPrice,
                'customizations' => $customizations,
                'special_instructions' => $specialInstructions
            ]);
        }

        $this->recalculateTotal();
        return $cartItem;
    }

    public function removeItem(int $cartItemId): bool
    {
        $item = $this->items()->find($cartItemId);
        if ($item) {
            $item->delete();
            $this->recalculateTotal();
            return true;
        }
        return false;
    }

    public function updateItemQuantity(int $cartItemId, int $quantity): bool
    {
        $item = $this->items()->find($cartItemId);
        if ($item) {
            if ($quantity <= 0) {
                return $this->removeItem($cartItemId);
            }
            
            $item->quantity = $quantity;
            $item->total_price = $item->unit_price * $quantity;
            $item->save();
            $this->recalculateTotal();
            return true;
        }
        return false;
    }

    public function recalculateTotal(): void
    {
        $subtotal = $this->calculateSubtotal();
        $taxAmount = $this->calculateTax();
        
        $this->update([
            'subtotal' => $subtotal,
            'tax_amount' => $taxAmount,
            'total_amount' => $subtotal + $taxAmount
        ]);
    }

    public function calculateSubtotal(): float
    {
        return (float) $this->items()->sum('total_price');
    }

    public function calculateTax(): float
    {
        $subtotal = $this->calculateSubtotal();
        $taxRate = 0.22; // 22% IVA in Italy
        return round($subtotal * $taxRate, 2);
    }

    public function calculateTotal(): float
    {
        return $this->calculateSubtotal() + $this->calculateTax();
    }

    public function clear(): void
    {
        $this->items()->delete();
        $this->update([
            'subtotal' => 0,
            'tax_amount' => 0,
            'total_amount' => 0
        ]);
    }

    public function getItemCount(): int
    {
        return $this->items()->sum('quantity');
    }

    public function isExpired(): bool
    {
        return $this->expires_at && $this->expires_at->isPast();
    }

    public function extendExpiry(): void
    {
        $this->expires_at = Carbon::now()->addDays(7); // Cart expires in 7 days
        $this->save();
    }

    protected function calculateCustomizationPrice(array $customizations, MenuItem $menuItem): float
    {
        $price = 0;
        
        if (!empty($customizations) && $menuItem->customization_options) {
            $options = is_string($menuItem->customization_options) 
                ? json_decode($menuItem->customization_options, true) 
                : $menuItem->customization_options;

            foreach ($customizations as $type => $selectedOption) {
                if (isset($options[$type]['options'][$selectedOption]['price'])) {
                    $price += $options[$type]['options'][$selectedOption]['price'];
                }
            }
        }

        return $price;
    }

    // Static methods for cart management
    public static function getOrCreateCart(?int $userId, ?string $sessionId, int $branchId): Cart
    {
        $query = self::where('branch_id', $branchId)->where('status', 'active');
        
        if ($userId) {
            $query->where('user_id', $userId);
        } else {
            $query->where('session_id', $sessionId);
        }

        $cart = $query->first();

        if (!$cart) {
            $cart = self::create([
                'user_id' => $userId,
                'session_id' => $sessionId,
                'branch_id' => $branchId,
                'expires_at' => Carbon::now()->addDays(7)
            ]);
        } else {
            $cart->extendExpiry();
        }

        return $cart;
    }

    public static function cleanExpiredCarts(): int
    {
        return self::where('expires_at', '<', Carbon::now())
            ->where('status', 'active')
            ->update(['status' => 'expired']);
    }
}
