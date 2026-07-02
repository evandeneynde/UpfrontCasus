<?php

namespace Database\Seeders;

use App\Models\Batch;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductionRunSeeder extends Seeder
{
    public function run(): void
    {
        $workers = $this->createWorkers();
        $products = Product::where('is_active', true)->with('ingredients')->get();

        DB::transaction(function () use ($workers, $products): void {
            foreach ($workers as $entry) {
                $this->createRunsForWorker($entry, $products);
            }
        });
    }

    /**
     * Worker profiles define per-person behaviour:
     *   historyCount  – total completed runs in the past 400 days
     *   shiftStart/End – preferred hour range (24h)
     *   todayRuns     – fixed number of runs produced today
     *   recentRange   – [min, max] runs in the past 1–6 days
     *   dayRange      – [min, max] days-ago window for historical runs
     *
     * @return list<User>
     */
    private function createWorkers(): array
    {
        $profiles = [
            // Heavy early-shift veteran — on the floor before anyone else
            ['name' => 'Ursula',  'email' => 'ursula@example.com',
             'historyCount' => 320, 'shiftStart' => 5, 'shiftEnd' => 11,
             'todayRuns' => 2, 'recentRange' => [5, 6], 'dayRange' => [8, 400]],

            // Steady mid-shift workhorse, consistent output
            ['name' => 'Pieter',  'email' => 'pieter@example.com',
             'historyCount' => 210, 'shiftStart' => 7, 'shiftEnd' => 14,
             'todayRuns' => 2, 'recentRange' => [3, 4], 'dayRange' => [8, 400]],

            // Part-timer / newer hire — fewer historical runs, started 6 months ago
            ['name' => 'Fred',    'email' => 'fred@example.com',
             'historyCount' => 85,  'shiftStart' => 8, 'shiftEnd' => 14,
             'todayRuns' => 1, 'recentRange' => [2, 3], 'dayRange' => [8, 180]],

            // Afternoon specialist, low historical volume, active recently
            ['name' => 'Rens',    'email' => 'rens@example.com',
             'historyCount' => 130, 'shiftStart' => 11, 'shiftEnd' => 17,
             'todayRuns' => 1, 'recentRange' => [4, 5], 'dayRange' => [8, 400]],

            // High-output veteran on the early shift
            ['name' => 'Otto',    'email' => 'otto@example.com',
             'historyCount' => 270, 'shiftStart' => 6, 'shiftEnd' => 13,
             'todayRuns' => 2, 'recentRange' => [3, 5], 'dayRange' => [8, 400]],

            // Recently returned from leave — sparse history, picking back up
            ['name' => 'Nienke',  'email' => 'nienke@example.com',
             'historyCount' => 60,  'shiftStart' => 7, 'shiftEnd' => 14,
             'todayRuns' => 1, 'recentRange' => [2, 3], 'dayRange' => [8, 60]],

            // Evening closer, very few runs today, moderate history
            ['name' => 'Tom',     'email' => 'tom@example.com',
             'historyCount' => 155, 'shiftStart' => 13, 'shiftEnd' => 19,
             'todayRuns' => 0, 'recentRange' => [2, 4], 'dayRange' => [8, 400]],
        ];

        return array_map(
            fn (array $data) => [
                'user'    => User::factory()->trained()->create([
                    'name'  => $data['name'],
                    'email' => $data['email'],
                ]),
                'profile' => $data,
            ],
            $profiles,
        );
    }

    /**
     * @param array{user: User, profile: array<string, mixed>} $entry
     * @param \Illuminate\Database\Eloquent\Collection<int, Product> $products
     */
    private function createRunsForWorker(mixed $entry, \Illuminate\Database\Eloquent\Collection $products): void
    {
        /** @var User $worker */
        $worker  = $entry['user'];
        /** @var array{historyCount: int, shiftStart: int, shiftEnd: int, todayRuns: int, recentRange: array{int, int}, dayRange: array{int, int}} $profile */
        $profile = $entry['profile'];

        $shiftStart  = (int) $profile['shiftStart'];
        $shiftEnd    = (int) $profile['shiftEnd'];
        $dayMin      = (int) $profile['dayRange'][0];
        $dayMax      = (int) $profile['dayRange'][1];

        // ── Historical spread ─────────────────────────────────────────────────
        for ($j = 0; $j < (int) $profile['historyCount']; $j++) {
            $daysAgo   = fake()->numberBetween($dayMin, $dayMax);
            $startedAt = now()
                ->subDays($daysAgo)
                ->setTime(fake()->numberBetween($shiftStart, $shiftEnd), fake()->numberBetween(0, 59));

            $this->insertRun($worker, $products->random(), $startedAt, true);
        }

        // ── Today ─────────────────────────────────────────────────────────────
        $usedHours = [];
        for ($j = 0; $j < (int) $profile['todayRuns']; $j++) {
            do {
                $hour = fake()->numberBetween($shiftStart, $shiftEnd);
            } while (in_array($hour, $usedHours, true));
            $usedHours[] = $hour;

            $startedAt = now()->setTime($hour, fake()->numberBetween(0, 59));
            $this->insertRun($worker, $products->random(), $startedAt, true);
        }

        // ── Recent week ───────────────────────────────────────────────────────
        [$recentMin, $recentMax] = [(int) $profile['recentRange'][0], (int) $profile['recentRange'][1]];
        $recentCount = fake()->numberBetween($recentMin, $recentMax);
        for ($j = 0; $j < $recentCount; $j++) {
            $daysAgo   = fake()->numberBetween(1, 6);
            $startedAt = now()
                ->subDays($daysAgo)
                ->setTime(fake()->numberBetween($shiftStart, $shiftEnd), fake()->numberBetween(0, 59));
            $this->insertRun($worker, $products->random(), $startedAt, true);
        }
    }

    private function insertRun(User $worker, Product $product, \Carbon\CarbonInterface $startedAt, bool $isCompleted): void
    {
        $targetBags = fake()->randomElement([50, 75, 100, 125, 150, 200, 250, 300]);

        $mixMinutes = $isCompleted ? fake()->numberBetween(10, 25) : null;

        $batchId = DB::table('batches')->insertGetId([
            'product_id'            => $product->id,
            'user_id'               => $worker->id,
            'input_mode'            => 'bags',
            'target_bags'           => $targetBags,
            'bag_weight_kg'         => $product->bag_weight_kg,
            'status'                => $isCompleted
                ? Batch::STATUS_COMPLETED
                : Batch::STATUS_IN_PROGRESS,
            'current_step'          => $isCompleted ? 5 : fake()->numberBetween(1, 4),
            'sifted'                => $isCompleted ? 1 : null,
            'mixer_started'         => $isCompleted ? 1 : null,
            'mix_minutes'           => $mixMinutes,
            'attached_to_line'      => $isCompleted ? 1 : null,
            'bags_produced'         => $isCompleted ? (int) round($targetBags * fake()->randomFloat(3, 0.95, 1.02)) : null,
            'started_at'            => $startedAt,
            'weighing_completed_at' => $isCompleted ? $startedAt->copy()->addMinutes(fake()->numberBetween(15, 30)) : null,
            'sifted_at'             => $isCompleted ? $startedAt->copy()->addMinutes(fake()->numberBetween(30, 40)) : null,
            'mixing_completed_at'   => $isCompleted ? $startedAt->copy()->addMinutes(fake()->numberBetween(40, 55)) : null,
            'attached_at'           => $isCompleted ? $startedAt->copy()->addMinutes(fake()->numberBetween(55, 65)) : null,
            'completed_at'          => $isCompleted ? $startedAt->copy()->addMinutes(fake()->numberBetween(65, 90)) : null,
            'notes'                 => $isCompleted && fake()->boolean(15) ? fake()->sentence() : null,
            'created_at'            => $startedAt,
            'updated_at'            => $startedAt,
        ]);

        // Bulk-insert ingredient snapshot
        $ingredientRows = [];
        foreach ($product->ingredients as $ingredient) {
            $neededKg = round((float) $ingredient->grams_per_bag / 1000 * $targetBags, 3);
            $ingredientRows[] = [
                'batch_id' => $batchId,
                'name'                => $ingredient->name,
                'needed_kg'           => $neededKg,
                'sort_order'          => $ingredient->sort_order,
                'created_at'          => $startedAt,
                'updated_at'          => $startedAt,
            ];
        }
        DB::table('batch_ingredients')->insert($ingredientRows);
    }
}
