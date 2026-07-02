<?php

namespace App\Http\Controllers\Production;

use App\Http\Controllers\Controller;
use App\Http\Requests\Production\FinishBatchRequest;
use App\Http\Requests\Production\MixingRequest;
use App\Http\Requests\Production\StartBatchRequest;
use App\Http\Requests\Production\WeighingRequest;
use App\Models\Batch;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class BatchController extends Controller
{
    /**
     * List production runs, all runs for admins, own runs for workers.
     */
    public function index(Request $request): Response
    {
        $user = $request->user();
        $isAdmin = $user->can('admin');

        $query = Batch::query()->with('product:id,name');

        if ($isAdmin) {
            $query->with('user:id,name');
        } else {
            $query->where('user_id', $user->id);
        }

        $batches = $query
            ->latest()
            ->get()
            ->map(fn (Batch $batch): array => [
                'id' => $batch->id,
                'user_id' => $batch->user_id,
                'worker_name' => $isAdmin ? $batch->user->name : null,
                'product_name' => $batch->product->name,
                'status' => $batch->status,
                'current_step' => $batch->current_step,
                'target_bags' => $batch->target_bags,
                'bags_produced' => $batch->bags_produced,
                'started_at' => $batch->started_at?->toIso8601String(),
                'completed_at' => $batch->completed_at?->toIso8601String(),
                'duration_minutes' => $batch->durationMinutes(),
            ]);

        return Inertia::render('production/index', [
            'batches' => $batches,
        ]);
    }

    /**
     * Display the form to start a new batch.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        $user = $request->user();
        if ($user !== null && ! $user->is_admin && $user->training_passed_at === null) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Voltooi eerst de training voordat je een batch kunt starten.',
            ]);

            return redirect()->route('training.index');
        }

        $products = Product::query()
            ->where('is_active', true)
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'bag_weight_kg' => (float) $product->bag_weight_kg,
            ]);

        return Inertia::render('production/create', [
            'products' => $products,
        ]);
    }

    /**
     * Start a batch: snapshot the recipe and scale ingredients correctly.
     */
    public function store(StartBatchRequest $request): RedirectResponse
    {
        $user = $request->user();
        if ($user !== null && ! $user->is_admin && $user->training_passed_at === null) {
            Inertia::flash('toast', [
                'type' => 'warning',
                'message' => 'Voltooi eerst de training voordat je een batch kunt starten.',
            ]);

            return redirect()->route('training.index');
        }

        $data = $request->validated();

        $product = Product::with('ingredients')->findOrFail($data['product_id']);

        $bagWeight = (float) $product->bag_weight_kg;
        $targetBags = (int) $data['target_bags'];

        $batch = DB::transaction(function () use ($request, $product, $targetBags, $bagWeight): Batch {
            $batch = Batch::create([
                'product_id' => $product->id,
                'user_id' => $request->user()->id,
                'input_mode' => 'bags',
                'target_bags' => $targetBags,
                'bag_weight_kg' => $bagWeight,
                'status' => Batch::STATUS_IN_PROGRESS,
                'current_step' => 1,
                'started_at' => now(),
            ]);

            foreach ($product->ingredients as $index => $ingredient) {
                $batch->ingredients()->create([
                    'name' => $ingredient->name,
                    'needed_kg' => round((float) $ingredient->grams_per_bag / 1000 * $targetBags, 3),
                    'sort_order' => $index,
                ]);
            }

            return $batch;
        });

        return to_route('production.run', $batch);
    }

    /**
     * Show the steps for a batch (or a read-only summary once completed).
     */
    public function run(Request $request, Batch $batch): Response
    {
        $this->authorizeBatch($request, $batch);

        $batch->load(['product:id,name', 'ingredients']);

        return Inertia::render('production/run', [
            'batch' => $this->serializeBatch($batch),
        ]);
    }

    /**
     * Store the weighing step.
     */
    public function storeWeighing(WeighingRequest $request, Batch $batch): RedirectResponse
    {
        $this->authorizeBatch($request, $batch);

        $batch->update([
            'weighing_completed_at' => now(),
            'current_step' => max($batch->current_step, 2),
        ]);

        return back();
    }

    /**
     * Store the sifting step.
     */
    public function storeSifting(Request $request, Batch $batch): RedirectResponse
    {
        $this->authorizeBatch($request, $batch);

        $validated = $request->validate([
            'sifted' => ['required', 'boolean'],
        ]);

        $batch->update([
            'sifted' => $validated['sifted'],
            'sifted_at' => now(),
            'current_step' => max($batch->current_step, 3),
        ]);

        return back();
    }

    /**
     * Store the mixing step.
     */
    public function storeMixing(MixingRequest $request, Batch $batch): RedirectResponse
    {
        $this->authorizeBatch($request, $batch);

        $validated = $request->validated();

        $batch->update([
            'mixer_started' => $validated['mixer_started'],
            'mix_minutes' => $validated['mixer_started'] ? $validated['mix_minutes'] : null,
            'mixing_completed_at' => now(),
            'current_step' => max($batch->current_step, 4),
        ]);

        return back();
    }

    /**
     * Store the attachment step.
     */
    public function storeAttachment(Request $request, Batch $batch): RedirectResponse
    {
        $this->authorizeBatch($request, $batch);

        $validated = $request->validate([
            'attached_to_line' => ['required', 'boolean'],
        ]);

        $batch->update([
            'attached_to_line' => $validated['attached_to_line'],
            'attached_at' => now(),
            'current_step' => max($batch->current_step, 5),
        ]);

        return back();
    }

    /**
     * Store the final step and complete the batch.
     */
    public function finish(FinishBatchRequest $request, Batch $batch): RedirectResponse
    {
        $this->authorizeBatch($request, $batch);

        $validated = $request->validated();

        $batch->update([
            'bags_produced' => $validated['bags_produced'],
            'notes' => $validated['notes'] ?? null,
            'status' => Batch::STATUS_COMPLETED,
            'completed_at' => now(),
            'current_step' => 5,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Batch completed.')]);

        return to_route('production.run', $batch);
    }

    /**
     * Delete a batch (and its ingredient snapshot).
     */
    public function destroy(Request $request, Batch $batch): RedirectResponse
    {
        $this->authorizeBatch($request, $batch);

        $batch->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Batch deleted.')]);

        return to_route('production.index');
    }

    private function authorizeBatch(Request $request, Batch $batch): void
    {
        abort_unless(
            $batch->user_id === $request->user()->id || $request->user()->can('admin'),
            403
        );
    }

    private function serializeBatch(Batch $batch): array
    {
        return [
            'id' => $batch->id,
            'product_name' => $batch->product->name,
            'input_mode' => $batch->input_mode,
            'target_bags' => $batch->target_bags,
            'bag_weight_kg' => (float) $batch->bag_weight_kg,
            'status' => $batch->status,
            'current_step' => $batch->current_step,
            'sifted' => $batch->sifted,
            'mixer_started' => $batch->mixer_started,
            'mix_minutes' => $batch->mix_minutes,
            'attached_to_line' => $batch->attached_to_line,
            'bags_produced' => $batch->bags_produced,
            'notes' => $batch->notes,
            'started_at' => $batch->started_at?->toIso8601String(),
            'completed_at' => $batch->completed_at?->toIso8601String(),
            'duration_minutes' => $batch->durationMinutes(),
            'total_actual_weight' => $batch->isCompleted() ? round($batch->totalActualWeight(), 3) : null,
            'ingredients' => $batch->ingredients->map(fn ($ingredient): array => [
                'id' => $ingredient->id,
                'name' => $ingredient->name,
                'needed_kg' => (float) $ingredient->needed_kg,
            ])->all(),
        ];
    }
}
