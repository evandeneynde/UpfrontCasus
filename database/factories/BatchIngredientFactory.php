<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\BatchIngredient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<BatchIngredient>
 */
class BatchIngredientFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'batch_id' => Batch::factory(),
            'name' => ucfirst(fake()->word()),
            'needed_kg' => fake()->randomFloat(3, 1, 50),
            'sort_order' => 0,
        ];
    }
}
