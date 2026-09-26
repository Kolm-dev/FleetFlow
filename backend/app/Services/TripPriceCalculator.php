<?php

namespace App\Services;

use App\Models\PricingSetting;

class TripPriceCalculator
{
    public function calculate(float $distance): float
    {
        $priceSetting = PricingSetting::firstOrFail();

        $recommendedPrice = $priceSetting->base_price
            + ($distance * $priceSetting->price_per_km);

        $finalPrice = max(
            $recommendedPrice,
            $priceSetting->minimum_price,
        );

        return round((float) $finalPrice, 2);
    }
}
