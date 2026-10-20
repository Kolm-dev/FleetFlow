<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Pricing\PricingSetting;
use Illuminate\Http\Request;

class PricingSettingController extends Controller
{
    public function show()
    {
        $setting = PricingSetting::current();

        return response()->json([
            'configured' => $setting->isConfigured(),
            'fuel' => [
                'diesel_price' => (float) $setting->diesel_price,
                'gasoline_price' => (float) $setting->gasoline_price,
                'updated_at' => $setting->fuel_pricing_updated_at,
            ],
            'trips' => [
                'price_per_km' => (float) $setting->price_per_km,
                'base_price' => (float) $setting->base_price,
                'minimum_price' => (float) $setting->minimum_price,
                'updated_at' => $setting->trip_pricing_updated_at,
            ],
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'price_per_km' => ['sometimes', 'numeric', 'min:0'],
            'base_price' => ['sometimes', 'numeric', 'min:0'],
            'minimum_price' => ['sometimes', 'numeric', 'min:0'],

            'diesel_price' => ['sometimes', 'numeric', 'gt:0'],
            'gasoline_price' => ['sometimes', 'numeric', 'gt:0'],


        ]);

        $setting = PricingSetting::current();
        $setting->fill($data);

        $tripPricingFields = ['price_per_km', 'base_price', 'minimum_price'];
        $fuelPricingFields = ['diesel_price', 'gasoline_price'];

        $tripPricingChanged = $setting->isDirty($tripPricingFields)
            || ($setting->trip_pricing_updated_at === null && $request->hasAny($tripPricingFields));
        $fuelPricingChanged = $setting->isDirty($fuelPricingFields)
            || ($setting->fuel_pricing_updated_at === null && $request->hasAny($fuelPricingFields));

        if ($tripPricingChanged) {
            $setting->trip_pricing_updated_at = now();
        }

        if ($fuelPricingChanged) {
            $setting->fuel_pricing_updated_at = now();
        }


        $setting->save();
        $setting->refresh();

        return response()->json([
            'message' => 'Pricing settings updated successfully.',
            'configured' => $setting->isConfigured(),

            'fuel' => [
                'diesel_price' => (float) $setting->diesel_price,
                'gasoline_price' => (float) $setting->gasoline_price,
                'updated_at' => $setting->fuel_pricing_updated_at,
            ],
            'trips' => [
                'price_per_km' => (float) $setting->price_per_km,
                'base_price' => (float) $setting->base_price,
                'minimum_price' => (float) $setting->minimum_price,
                'updated_at' => $setting->trip_pricing_updated_at,
            ],
        ]);
    }
}
