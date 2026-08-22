<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Vehicle>
 */
class VehicleFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'brand' => fake()->word(),
            'model' => fake()->word(),
            'license_plate' => strtoupper(fake()->unique()->bothify('??####')),
            'year' => fake()->numberBetween(2000, 2026),
            'driver_id' => Driver::factory(),
        ];
    }
}
