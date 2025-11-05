<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\Attribute;
use Illuminate\Support\Facades\Crypt;

class SystemSetting extends Model
{
    protected $fillable = [
        'key',
        'value', 
        'type',
        'category',
        'name',
        'description',
        'is_encrypted',
        'is_public'
    ];

    protected $casts = [
        'is_encrypted' => 'boolean',
        'is_public' => 'boolean',
    ];

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
     * Scope per categoria
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('category', $category);
    }

    /**
     * Scope per impostazioni pubbliche
     */
    public function scopePublic($query)
    {
        return $query->where('is_public', true);
    }

    /**
     * Metodo statico per ottenere un'impostazione
     */
    public static function get($key, $default = null)
    {
        $setting = static::where('key', $key)->first();
        return $setting ? $setting->value : $default;
    }

    /**
     * Metodo statico per impostare un valore
     */
    public static function set($key, $value, $category = 'general', $type = 'string')
    {
        return static::updateOrCreate(
            ['key' => $key],
            [
                'value' => $value,
                'category' => $category,
                'type' => $type
            ]
        );
    }

    /**
     * Ottieni tutte le impostazioni di una categoria come array
     */
    public static function getByCategory($category)
    {
        return static::byCategory($category)
            ->pluck('value', 'key')
            ->toArray();
    }
}