<?php

namespace App\Models;

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

    protected function casts(): array
    {
        return [
            'price_per_km' => 'decimal:2',
            'base_price' => 'decimal:2',
            'minimum_price' => 'decimal:2',
            'diesel_price' => 'decimal:2',
            'gasoline_price' => 'decimal:2',
        ];
    }
}
