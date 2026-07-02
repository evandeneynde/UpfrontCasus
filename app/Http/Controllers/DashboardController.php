<?php

namespace App\Http\Controllers;

use App\Models\Batch;
use App\Models\Product;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(): Response
    {
        $batches = Batch::where('status', Batch::STATUS_COMPLETED)
            ->with('ingredients')
            ->orderBy('completed_at')
            ->get();

        $products = Product::where('is_active', true)
            ->orderBy('name')
            ->get(['id', 'name']);

        return Inertia::render('dashboard', [
            'volume' => $this->volumeByPeriod($batches),
            'efficiency' => $this->efficiencyByPeriod($batches),
            'leaderboard' => $this->buildLeaderboard($batches),
            'flowData' => $this->buildFlowData($batches, $products),
            'products' => $products->map(fn (Product $pt): array => [
                'id' => $pt->id,
                'name' => $pt->name,
            ])->values(),
        ]);
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @return array<string, array{bags: int, kg: float, batches: int}>
     */
    private function volumeByPeriod(Collection $batches): array
    {
        $result = [];

        foreach (['daily', 'weekly', 'monthly', 'yearly'] as $period) {
            [$start, $end] = $this->periodRange($period);
            $subset = $batches->filter(
                fn (Batch $b): bool => $b->completed_at !== null
                    && $b->completed_at->gte($start)
                    && $b->completed_at->lt($end),
            );

            $bags = (int) $subset->sum('bags_produced');
            $kg = $subset->reduce(
                fn (float $carry, Batch $b): float => $carry + (float) ($b->bags_produced ?? 0) * (float) $b->bag_weight_kg,
                0.0,
            );

            $result[$period] = [
                'bags' => $bags,
                'kg' => round($kg, 1),
                'batches' => $subset->count(),
            ];
        }

        return $result;
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @return array<string, float|null>
     */
    private function efficiencyByPeriod(Collection $batches): array
    {
        $result = [];

        foreach (['daily', 'weekly', 'monthly', 'yearly'] as $period) {
            [$start, $end] = $this->periodRange($period);
            $subset = $batches->filter(
                fn (Batch $b): bool => $b->completed_at !== null
                    && $b->completed_at->gte($start)
                    && $b->completed_at->lt($end),
            );

            $actualBags = (int) $subset->sum('bags_produced');
            $expectedBags = (int) $subset->sum('target_bags');

            $result[$period] = $expectedBags > 0 ? round($actualBags / $expectedBags * 100, 1) : null;
        }

        return $result;
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @return list<array{name: string, bags: int, kg: float, batches: int, efficiency: float|null}>
     */
    private function buildLeaderboard(Collection $batches): array
    {
        $users = User::all(['id', 'name']);
        $result = [];

        foreach ($users as $user) {
            $userBatches = $batches->filter(
                fn (Batch $b): bool => $b->user_id === $user->id,
            );

            if ($userBatches->isEmpty()) {
                continue;
            }

            $bags = (int) $userBatches->sum('bags_produced');
            $kg = $userBatches->reduce(
                fn (float $carry, Batch $b): float => $carry + (float) ($b->bags_produced ?? 0) * (float) $b->bag_weight_kg,
                0.0,
            );
            $expectedBags = (int) $userBatches->sum('target_bags');

            $result[] = [
                'name' => $user->name,
                'bags' => $bags,
                'kg' => round($kg, 1),
                'batches' => $userBatches->count(),
                'efficiency' => $expectedBags > 0 ? round($bags / $expectedBags * 100, 1) : null,
            ];
        }

        usort($result, fn (array $a, array $b): int => (int) $b['bags'] <=> (int) $a['bags']);

        return $result;
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @param  Collection<int, Product>  $products
     * @return array<string, array{day: array{labels: list<string>, average: list<float>, current: list<float>}, week: array{labels: list<string>, average: list<float>, current: list<float>}, month: array{labels: list<string>, average: list<float>, current: list<float>}}>
     */
    private function buildFlowData(Collection $batches, Collection $products): array
    {
        $result = ['all' => $this->flowPeriods($batches)];

        foreach ($products as $product) {
            $subset = $batches->filter(
                fn (Batch $b): bool => $b->product_id === $product->id,
            );
            $result['pt_'.$product->id] = $this->flowPeriods($subset);
        }

        return $result;
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @return array{day: array{labels: list<string>, average: list<float>, current: list<float>}, week: array{labels: list<string>, average: list<float>, current: list<float>}, month: array{labels: list<string>, average: list<float>, current: list<float>}}
     */
    private function flowPeriods(Collection $batches): array
    {
        return [
            'day' => $this->hourlyFlow($batches),
            'week' => $this->weeklyFlow($batches),
            'month' => $this->monthlyFlow($batches),
        ];
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @return array{labels: list<string>, average: list<float>, current: list<float>}
     */
    private function hourlyFlow(Collection $batches): array
    {
        $today = Carbon::today();
        $thirtyDaysAgo = Carbon::today()->subDays(30);

        $byHourDay = array_fill(0, 24, []);
        $current = array_fill(0, 24, 0.0);

        foreach ($batches as $b) {
            if ($b->completed_at === null) {
                continue;
            }

            $hour = (int) $b->completed_at->format('G');
            $bags = (float) ($b->bags_produced ?? 0);

            if ($b->completed_at->gte($today)) {
                $current[$hour] += $bags;
            } elseif ($b->completed_at->gte($thirtyDaysAgo)) {
                $day = $b->completed_at->toDateString();
                $byHourDay[$hour][$day] = ($byHourDay[$hour][$day] ?? 0.0) + $bags;
            }
        }

        $average = array_values(array_map(function (array $days): float {
            return empty($days) ? 0.0 : round(array_sum($days) / count($days), 1);
        }, $byHourDay));

        $currentHour = (int) Carbon::now()->format('G');

        return [
            'labels' => array_map(fn (int $h): string => sprintf('%02d:00', $h), range(0, 23)),
            'average' => $this->cumulativeSum($average),
            'current' => array_slice($this->cumulativeSum($current), 0, $currentHour + 1),
        ];
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @return array{labels: list<string>, average: list<float>, current: list<float>}
     */
    private function weeklyFlow(Collection $batches): array
    {
        $weekStart = Carbon::now()->startOfWeek();
        $twelveWeeksAgo = $weekStart->copy()->subWeeks(12);

        $byDowWeek = array_fill(0, 7, []);
        $current = array_fill(0, 7, 0.0);

        foreach ($batches as $b) {
            if ($b->completed_at === null) {
                continue;
            }

            $dow = ((int) $b->completed_at->dayOfWeek + 6) % 7;
            $bags = (float) ($b->bags_produced ?? 0);

            if ($b->completed_at->gte($weekStart)) {
                $current[$dow] += $bags;
            } elseif ($b->completed_at->gte($twelveWeeksAgo)) {
                $weekKey = $b->completed_at->format('o-W');
                $byDowWeek[$dow][$weekKey] = ($byDowWeek[$dow][$weekKey] ?? 0.0) + $bags;
            }
        }

        $average = array_values(array_map(function (array $weeks): float {
            return empty($weeks) ? 0.0 : round(array_sum($weeks) / count($weeks), 1);
        }, $byDowWeek));

        $currentDow = ((int) Carbon::now()->dayOfWeek + 6) % 7;

        return [
            'labels' => ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
            'average' => $this->cumulativeSum($average),
            'current' => array_slice($this->cumulativeSum(array_values($current)), 0, $currentDow + 1),
        ];
    }

    /**
     * @param  Collection<int, Batch>  $batches
     * @return array{labels: list<string>, average: list<float>, current: list<float>}
     */
    private function monthlyFlow(Collection $batches): array
    {
        $monthStart = Carbon::now()->startOfMonth();
        $twelveMonthsAgo = $monthStart->copy()->subMonths(12);
        $daysInMonth = (int) Carbon::now()->daysInMonth;

        $byDomMonth = array_fill(0, $daysInMonth, []);
        $current = array_fill(0, $daysInMonth, 0.0);

        foreach ($batches as $b) {
            if ($b->completed_at === null) {
                continue;
            }

            $dom = (int) $b->completed_at->day - 1;
            if ($dom >= $daysInMonth) {
                continue;
            }

            $bags = (float) ($b->bags_produced ?? 0);

            if ($b->completed_at->gte($monthStart)) {
                $current[$dom] += $bags;
            } elseif ($b->completed_at->gte($twelveMonthsAgo)) {
                $monthKey = $b->completed_at->format('Y-m');
                $byDomMonth[$dom][$monthKey] = ($byDomMonth[$dom][$monthKey] ?? 0.0) + $bags;
            }
        }

        $average = array_values(array_map(function (array $months): float {
            return empty($months) ? 0.0 : round(array_sum($months) / count($months), 1);
        }, $byDomMonth));

        $labels = array_map(fn (int $d): string => (string) $d, range(1, $daysInMonth));

        $currentDom = Carbon::now()->day - 1;

        return [
            'labels' => $labels,
            'average' => $this->cumulativeSum($average),
            'current' => array_slice($this->cumulativeSum(array_values($current)), 0, $currentDom + 1),
        ];
    }

    /**
     * Convert a per-slot array into a running cumulative total.
     *
     * @param  array<int, float>  $values
     * @return list<float>
     */
    private function cumulativeSum(array $values): array
    {
        $sum = 0.0;
        $result = [];
        foreach ($values as $v) {
            $sum += $v;
            $result[] = round($sum, 1);
        }

        return $result;
    }

    /**
     * @return array{Carbon, Carbon}
     */
    private function periodRange(string $period): array
    {
        return match ($period) {
            'daily' => [Carbon::today(), Carbon::today()->addDay()],
            'weekly' => [Carbon::now()->startOfWeek(), Carbon::now()->endOfWeek()->addSecond()],
            'monthly' => [Carbon::now()->startOfMonth(), Carbon::now()->endOfMonth()->addSecond()],
            default => [Carbon::now()->startOfYear(), Carbon::now()->endOfYear()->addSecond()],
        };
    }
}
