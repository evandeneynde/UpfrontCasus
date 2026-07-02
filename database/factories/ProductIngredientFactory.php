<?php

namespace Database\Factories;

use App\Models\Product;
use App\Models\ProductIngredient;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ProductIngredient>
 */
class ProductIngredientFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'name' => ucfirst(fake()->unique()->word()),
            'grams_per_bag' => fake()->randomFloat(2, 10, 900),
            'sort_order' => 0,
        ];
    }
}
