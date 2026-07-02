<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class BatchIngredient extends Model
{
    use HasFactory;

    protected $table = 'batch_ingredients';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'batch_id',
        'name',
        'needed_kg',
        'sort_order',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'needed_kg' => 'decimal:3',
        'sort_order' => 'integer',
    ];

    public function batch(): BelongsTo
    {
        return $this->belongsTo(Batch::class);
    }
}
