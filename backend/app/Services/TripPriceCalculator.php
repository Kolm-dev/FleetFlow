<?php

namespace App\Services;

use App\Models\PricingSetting;

class TripPriceCalculator
{
    public function calculate(float $distance)
    {
        $priceSetting = PricingSetting::firstOrFail();
        $pricePerKm = $priceSetting->price_per_km;
        $basePrice = $priceSetting->base_price;
        $minimumPrice = $priceSetting->minimum_price;
        $recomendedPrice = $basePrice + ($distance * $pricePerKm);
        if ($recomendedPrice >= $minimumPrice) {
            return $recomendedPrice;
        }

        return $minimumPrice;

    }
}
