<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PricingSetting;
use Illuminate\Http\Request;

class PricingSettingController extends Controller
{
    public function show()
    {
        $setting = PricingSetting::firstOrFail();

        return response()->json([
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

        $setting = PricingSetting::firstOrFail();
        $setting->fill($data);

        $tripPricingChanged = $setting->isDirty(['price_per_km', 'base_price', 'minimum_price']);
        $fuelPricingChanged = $setting->isDirty(['diesel_price', 'gasoline_price']);

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
