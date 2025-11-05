<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Crypt;

class BarSetting extends Model
{
    protected $fillable = [
        'bar_id',
        'key',
        'value',
        'type',
        'category',
        'name',
        'description',
        'is_encrypted'
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
    ];

    /**
     * Relazione con Bar
     */
    public function bar(): BelongsTo
    {
        return $this->belongsTo(Bar::class);
    }

    /**
     * Accessor per il valore - decripta se necessario e converte il tipo
     */
    protected function value(): Attribute
    {
        return Attribute::make(
            get: function ($value) {
                // Decripta se necessario
                if ($this->is_encrypted) {
                    try {
                        $value = Crypt::decryptString($value);
                    } catch (\Exception $e) {
                        return null;
                    }
                }

                // Converte in base al tipo
                return $this->castValue($value, $this->type);
            },
            set: function ($value) {
                // Converte in stringa per il database
                $stringValue = $this->valueToString($value, $this->type);
                
                // Cripta se necessario
                if ($this->is_encrypted) {
                    return Crypt::encryptString($stringValue);
                }

                return $stringValue;
            }
        );
    }

    /**
     * Converte il valore dal database nel tipo corretto
     */
    private function castValue($value, $type)
    {
        switch ($type) {
            case 'json':
                return json_decode($value, true);
            case 'boolean':
                return filter_var($value, FILTER_VALIDATE_BOOLEAN);
            case 'number':
                return is_numeric($value) ? (float) $value : $value;
            case 'string':
            default:
                return $value;
        }
    }

    /**
     * Converte il valore in stringa per il database
     */
    private function valueToString($value, $type)
    {
        switch ($type) {
            case 'json':
                return json_encode($value);
            case 'boolean':
                return $value ? '1' : '0';
            case 'number':
                return (string) $value;
            case 'string':
            default:
                return (string) $value;
        }
    }

    /**
     * Scope per bar specifico
     */
    public function scopeForBar($query, $barId)
    {
        return $query->where('bar_id', $barId);
    }

    /**
     * Scope per categoria
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Metodo statico per ottenere un'impostazione del bar
     */
    public static function getForBar($barId, $key, $default = null)
    {
        $setting = static::where('bar_id', $barId)->where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Metodo statico per impostare un valore per un bar
     */
    public static function setForBar($barId, $key, $value, $category = 'general', $type = 'string')
    {
        return static::updateOrCreate(
            ['bar_id' => $barId, 'key' => $key],
            [
                'value' => $value,
                'category' => $category,
                'type' => $type
            ]
        );
    }

    /**
     * Ottieni tutte le impostazioni di un bar per categoria
     */
    public static function getByBarAndCategory($barId, $category)
    {
        return static::forBar($barId)
            ->byCategory($category)
            ->pluck('value', 'key')
            ->toArray();
    }
}