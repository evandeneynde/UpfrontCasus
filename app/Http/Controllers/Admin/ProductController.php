<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\ProductStoreRequest;
use App\Http\Requests\Admin\ProductUpdateRequest;
use App\Models\Product;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProductController extends Controller
{
    /**
     * Display all products.
     */
    public function index(): Response
    {
        $products = Product::query()
            ->withCount(['ingredients', 'batches'])
            ->orderBy('name')
            ->get()
            ->map(fn (Product $product): array => [
                'id' => $product->id,
                'name' => $product->name,
                'bag_weight_kg' => (float) $product->bag_weight_kg,
                'is_active' => $product->is_active,
                'ingredients_count' => $product->ingredients_count,
                'batches_count' => $product->batches_count,
            ]);

        return Inertia::render('admin/products/index', [
            'products' => $products,
        ]);
    }

    /**
     * Display the form to create a new product.
     */
    public function create(): Response
    {
        return Inertia::render('admin/products/create');
    }

    /**
     * Store a new product and its ingredients.
     */
    public function store(ProductStoreRequest $request): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($data): void {
            $product = Product::create([
                'name' => $data['name'],
                'bag_weight_kg' => $data['bag_weight_kg'],
                'is_active' => $data['is_active'],
            ]);

            $this->syncIngredients($product, $data['ingredients']);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product created.')]);

        return to_route('admin.products.index');
    }

    /**
     * Display the form to edit a product.
     */
    public function edit(Product $product): Response
    {
        $product->load('ingredients');

        return Inertia::render('admin/products/edit', [
            'product' => [
                'id' => $product->id,
                'name' => $product->name,
                'bag_weight_kg' => (float) $product->bag_weight_kg,
                'is_active' => $product->is_active,
                'ingredients' => $product->ingredients->map(fn ($ingredient): array => [
                    'name' => $ingredient->name,
                    'grams_per_bag' => (float) $ingredient->grams_per_bag,
                ])->all(),
            ],
        ]);
    }

    /**
     * Update a product and replace its ingredients.
     */
    public function update(ProductUpdateRequest $request, Product $product): RedirectResponse
    {
        $data = $request->validated();

        DB::transaction(function () use ($product, $data): void {
            $product->update([
                'name' => $data['name'],
                'bag_weight_kg' => $data['bag_weight_kg'],
                'is_active' => $data['is_active'],
            ]);

            $product->ingredients()->delete();
            $this->syncIngredients($product, $data['ingredients']);
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product updated.')]);

        return to_route('admin.products.index');
    }

    /**
     * Delete a product.
     */
    public function destroy(Product $product): RedirectResponse
    {
        if ($product->batches()->exists()) {
            Inertia::flash('toast', [
                'type' => 'error',
                'message' => __('Cannot delete a product that has production runs.'),
            ]);

            return to_route('admin.products.index');
        }

        $product->delete();

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Product deleted.')]);

        return to_route('admin.products.index');
    }

    /**
     * Create the ingredient rows for a product, preserving their order (biggest part first)
     *
     * @param  array<int, array{name: string, grams_per_bag: numeric-string|float}>  $ingredients
     */
    private function syncIngredients(Product $product, array $ingredients): void
    {
        foreach (array_values($ingredients) as $index => $ingredient) {
            $product->ingredients()->create([
                'name' => $ingredient['name'],
                'grams_per_bag' => $ingredient['grams_per_bag'],
                'sort_order' => $index,
            ]);
        }
    }
}
