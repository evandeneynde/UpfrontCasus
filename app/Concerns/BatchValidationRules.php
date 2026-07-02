<?php

namespace App\Concerns;

use App\Models\Product;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Validation\Rule;

trait BatchValidationRules
{
    /**
     * Validation rules for creating or updating a product type (with its ingredients).
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function productRules(?int $productId = null): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:255',
                $productId === null
                    ? Rule::unique(Product::class)
                    : Rule::unique(Product::class)->ignore($productId),
            ],
            'bag_weight_kg' => ['required', 'numeric', 'gt:0', 'max:1000'],
            'is_active' => ['required', 'boolean'],
            'ingredients' => ['required', 'array', 'min:1'],
            'ingredients.*.name' => ['required', 'string', 'max:255'],
            'ingredients.*.grams_per_bag' => ['required', 'numeric', 'gt:0', 'max:100000'],
        ];
    }

    /**
     * Validation rules for starting a production run.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function startBatchRules(): array
    {
        return [
            'product_id' => ['required', 'integer', Rule::exists(Product::class, 'id')->where('is_active', true)],
            'target_bags' => ['required', 'integer', 'gt:0', 'max:100000'],
        ];
    }

    /**
     * Validation rules for the weighing step.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function weighingRules(): array
    {
        return [
            'weighing_confirmed' => ['required', 'boolean'],
        ];
    }

    /**
     * Validation rules for the mixing step.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function mixingRules(): array
    {
        return [
            'mixer_started' => ['required', 'boolean'],
            'mix_minutes' => ['required_if:mixer_started,1', 'nullable', 'integer', 'gt:0', 'max:1440'],
        ];
    }

    /**
     * Validation rules for the final step.
     *
     * @return array<string, array<int, ValidationRule|array<mixed>|string>>
     */
    protected function finishRules(): array
    {
        return [
            'bags_produced' => ['required', 'integer', 'gte:0', 'max:100000'],
            'notes' => ['nullable', 'string', 'max:2000'],
        ];
    }
}
