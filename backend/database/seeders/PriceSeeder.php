<?php

namespace Database\Seeders;

use App\Models\PricingSetting;
use Illuminate\Database\Seeder;

class PriceSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        PricingSetting::updateOrCreate(
            ['id' => 1],
            [
                'price_per_km' => 12,
                'base_price' => 300,
                'minimum_price' => 500,
            ]
        );
    }
}
