<?php

namespace App\Models\Pricing;

use Illuminate\Database\Eloquent\Model;

class PricingSetting extends Model
{
    const CREATED_AT = null;

    protected $fillable = [
        'price_per_km',
        'base_price',
        'minimum_price',
        'diesel_price',
        'gasoline_price'

    ];

    public static function current(): self
    {
        return static::firstOrCreate([], [
            'price_per_km' => 1,
            'base_price' => 1,
            'minimum_price' => 1,
            'diesel_price' => 1,
            'gasoline_price' => 1,
        ]);
    }

    public function isConfigured(): bool
    {
        return $this->trip_pricing_updated_at !== null && $this->fuel_pricing_updated_at !== null;
    }

    protected function casts(): array
    {
        return [
            'price_per_km' => 'decimal:2',
            'base_price' => 'decimal:2',
            'minimum_price' => 'decimal:2',
            'diesel_price' => 'decimal:2',
            'gasoline_price' => 'decimal:2',

            'fuel_pricing_updated_at' => 'datetime',
            'trip_pricing_updated_at' => 'datetime'
        ];
    }
}
