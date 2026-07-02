<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class HourlyBatchSeeder extends Seeder
{
    private const WORKER_EMAILS = [
        'ursula@example.com'  => ['shiftStart' => 5,  'shiftEnd' => 11],
        'pieter@example.com'  => ['shiftStart' => 7,  'shiftEnd' => 14],
        'fred@example.com'    => ['shiftStart' => 8,  'shiftEnd' => 14],
        'rens@example.com'    => ['shiftStart' => 11, 'shiftEnd' => 17],
        'otto@example.com'    => ['shiftStart' => 6,  'shiftEnd' => 13],
        'nienke@example.com'  => ['shiftStart' => 7,  'shiftEnd' => 14],
        'tom@example.com'     => ['shiftStart' => 13, 'shiftEnd' => 19],
    ];

    public function run(): void
    {
        $products = Product::where('is_active', true)->with('ingredients')->get();

        if ($products->isEmpty()) {
            return;
        }

        $workers = User::whereIn('email', array_keys(self::WORKER_EMAILS))->get()->keyBy('email');

        DB::transaction(function () use ($workers, $products): void {
            foreach (self::WORKER_EMAILS as $email => $shift) {
                $worker = $workers->get($email);

                if (! $worker instanceof User) {
                    continue;
                }

                $count = fake()->numberBetween(0, 2);

                for ($i = 0; $i < $count; $i++) {
                    $minutesAgo = fake()->numberBetween(10, 90);
                    $startedAt  = now()->subMinutes($minutesAgo + fake()->numberBetween(65, 90));

                    $this->insertRun($worker, $products->random(), $startedAt);
                }
            }
        });
    }

    private function insertRun(User $worker, Product $product, \Carbon\CarbonInterface $startedAt): void
    {
        $targetBags = fake()->randomElement([50, 75, 100, 125, 150, 200, 250, 300]);

        $batchId = DB::table('batches')->insertGetId([
            'product_id'            => $product->id,
            'user_id'               => $worker->id,
            'input_mode'            => 'bags',
            'target_bags'           => $targetBags,
            'bag_weight_kg'         => $product->bag_weight_kg,
            'status'                => Batch::STATUS_COMPLETED,
            'current_step'          => 5,
            'sifted'                => 1,
            'mixer_started'         => 1,
            'mix_minutes'           => fake()->numberBetween(10, 25),
            'attached_to_line'      => 1,
            'bags_produced'         => (int) round($targetBags * fake()->randomFloat(3, 0.95, 1.02)),
            'started_at'            => $startedAt,
            'weighing_completed_at' => $startedAt->copy()->addMinutes(fake()->numberBetween(15, 30)),
            'sifted_at'             => $startedAt->copy()->addMinutes(fake()->numberBetween(30, 40)),
            'mixing_completed_at'   => $startedAt->copy()->addMinutes(fake()->numberBetween(40, 55)),
            'attached_at'           => $startedAt->copy()->addMinutes(fake()->numberBetween(55, 65)),
            'completed_at'          => $startedAt->copy()->addMinutes(fake()->numberBetween(65, 90)),
            'notes'                 => fake()->boolean(15) ? fake()->sentence() : null,
            'created_at'            => $startedAt,
            'updated_at'            => $startedAt,
        ]);

        $rows = [];
        foreach ($product->ingredients as $ingredient) {
            $rows[] = [
                'batch_id'   => $batchId,
                'name'       => $ingredient->name,
                'needed_kg'  => round((float) $ingredient->grams_per_bag / 1000 * $targetBags, 3),
                'sort_order' => $ingredient->sort_order,
                'created_at' => $startedAt,
                'updated_at' => $startedAt,
            ];
        }
        DB::table('batch_ingredients')->insert($rows);
    }
}
