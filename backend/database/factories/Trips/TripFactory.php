<?php

namespace Database\Factories\Trips;

use App\Models\Trips\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Trip>
 */
class TripFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
        'title' => fake()->sentence(3),
        'distance' => fake()->numberBetween(10, 500),
        ];
    }
}
