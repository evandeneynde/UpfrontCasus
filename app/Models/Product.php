<?php

namespace App\Models;

use App\Models\Batch;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'products';

    /**
     * The attributes that are mass-assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'name',
        'bag_weight_kg',
        'is_active',
        'grams_per_bag',
        'sort_order',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'bag_weight_kg' => 'decimal:3',
        'is_active' => 'boolean',
    ];

    /**
     * Get the recipe lines (ingredients and their per-kg proportions).
     */
    public function ingredients(): HasMany
    {
        return $this->hasMany(ProductIngredient::class)->orderBy('sort_order');
    }

    /**
     * Get the production runs started from this product.
     */
    public function batches(): HasMany
    {
        return $this->hasMany(Batch::class);
    }
}
