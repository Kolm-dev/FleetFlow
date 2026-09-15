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
            'pricing_setting' => $setting,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'price_per_km' => ['sometimes', 'numeric', 'min:0'],
            'base_price' => ['sometimes', 'numeric', 'min:0'],
            'minimum_price' => ['sometimes', 'numeric', 'min:0'],

        ]);

        $setting = PricingSetting::firstOrFail();
        $setting->update($data);

        return response()->json([
            'message' => 'Pricing settings updated successfully.',
            'pricing_setting' => $setting,
        ]);
    }
}
