<?php

namespace Database\Factories;

use App\Models\Batch;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Batch>
 */
class BatchFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'product_id' => Product::factory(),
            'user_id' => User::factory(),
            'input_mode' => 'bags',
            'target_bags' => 100,
            'bag_weight_kg' => 1,
            'status' => Batch::STATUS_IN_PROGRESS,
            'current_step' => 1,
            'started_at' => now(),
        ];
    }

    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Batch::STATUS_COMPLETED,
            'current_step' => 5,
            'sifted' => true,
            'mixer_started' => true,
            'mix_minutes' => 15,
            'attached_to_line' => true,
            'bags_produced' => 98,
            'weighing_completed_at' => now(),
            'sifted_at' => now(),
            'mixing_completed_at' => now(),
            'attached_at' => now(),
            'completed_at' => now()->addMinutes(45),
            'notes' => null,
        ]);
    }
}
