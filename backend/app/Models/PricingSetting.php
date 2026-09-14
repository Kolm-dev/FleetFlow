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
    ];
}
