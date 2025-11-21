<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    protected $fillable = [
        'user_id',
        'branch_id',
        'chain_id',
        'served_by',
        'branch_code',
        'total',
        'commission_rate',
        'commission_amount',
        'branch_amount',
        'code_4digit',
        'status',
        'payment_status',
        'order_type',
        'delivery_address',
        'special_instructions',
        'scheduled_for',
        'prepared_at',
        'delivered_at',
        'stripe_payment_intent_id',
        'stripe_transfer_id',
        'commission_status',
        'commission_transferred_at',
        'payment_confirmed_at',
        'status_updated_at',
        // New fields for customer ordering system
        'customer_name',
        'customer_email', 
        'customer_phone',
        'order_number',
        'subtotal_amount',
        'tax_amount',
        'total_amount',
        'currency',
        'notes'
    ];

    protected $casts = [
        'total' => 'decimal:2',
        'commission_rate' => 'decimal:2',
        'commission_amount' => 'decimal:2',
        'branch_amount' => 'decimal:2',
        'scheduled_for' => 'datetime',
        'prepared_at' => 'datetime',
        'delivered_at' => 'datetime',
        // New fields
        'subtotal_amount' => 'decimal:2',
        'tax_amount' => 'decimal:2', 
        'total_amount' => 'decimal:2'
    ];

    // Status constants
    const STATUS_PENDING = 'pending';
    const STATUS_CONFIRMED = 'confirmed';
    const STATUS_PREPARING = 'preparing';
    const STATUS_READY = 'ready';
    const STATUS_COMPLETED = 'completed';
    const STATUS_CANCELLED = 'cancelled';

    const ORDER_TYPE_TAKEAWAY = 'takeaway';
    const ORDER_TYPE_DELIVERY = 'delivery';
    const ORDER_TYPE_TABLE_SERVICE = 'table_service';

    const COMMISSION_STATUS_PENDING = 'pending';
    const COMMISSION_STATUS_TRANSFERRED = 'transferred';
    const COMMISSION_STATUS_FAILED = 'failed';

    // Relationships
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    public function chain(): BelongsTo
    {
        return $this->belongsTo(Chain::class);
    }

    public function servedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'served_by');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    // Legacy relationship for backward compatibility
    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    /**
     * Calculate commission amounts when order total changes
     */
    public function calculateCommissions(): void
    {
        $this->commission_amount = ($this->total * $this->commission_rate) / 100;
        $this->branch_amount = $this->total - $this->commission_amount;
    }

    /**
     * Generate unique 4-digit pickup code
     */
    public static function generatePickupCode(): string
    {
        do {
            $code = str_pad(random_int(0, 9999), 4, '0', STR_PAD_LEFT);
        } while (self::where('code_4digit', $code)->exists());
        
        return $code;
    }

    /**
     * Check if order can be cancelled
     */
    public function canBeCancelled(): bool
    {
        return in_array($this->status, [self::STATUS_PENDING, self::STATUS_CONFIRMED]);
    }

    /**
     * Check if order is ready for payment transfer
     */
    public function canTransferPayment(): bool
    {
        return $this->status === self::STATUS_COMPLETED 
               && $this->payment_status === 'paid'
               && $this->commission_status === self::COMMISSION_STATUS_PENDING;
    }
}