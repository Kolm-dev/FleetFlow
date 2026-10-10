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
                'diesel_price' => $setting->diesel_price,
                'gasoline_price' => $setting->gasoline_price,
            ],
            'trips' => [
                'price_per_km' => $setting->price_per_km,
                'base_price' => $setting->base_price,
                'minimum_price' => $setting->minimum_price,
            ]

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
        $setting->update($data);
        $setting->refresh();

        return response()->json([
            'message' => 'Pricing settings updated successfully.',
            'fuel' => [
                'diesel_price' => $setting->diesel_price,
                'gasoline_price' => $setting->gasoline_price,
            ],
            'trips' => [
                'price_per_km' => $setting->price_per_km,
                'base_price' => $setting->base_price,
                'minimum_price' => $setting->minimum_price,
            ],
        ]);
    }
}
