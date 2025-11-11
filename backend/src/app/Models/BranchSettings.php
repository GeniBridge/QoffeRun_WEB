<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BranchSettings extends Model
{
    use HasFactory;

    protected $table = 'branch_settings';

    protected $fillable = [
        'branch_id',
        'key',
        'value',
        'type'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    /**
     * Get the branch that owns this setting
     */
    public function branch(): BelongsTo
    {
        return $this->belongsTo(Branch::class);
    }

    /**
     * Get the typed value
     */
    public function getTypedValueAttribute()
    {
        switch ($this->type) {
            case 'boolean':
                return (bool) $this->value;
            case 'number':
                return is_numeric($this->value) ? (float) $this->value : $this->value;
            case 'json':
                return json_decode($this->value, true);
            default:
                return $this->value;
        }
    }
}