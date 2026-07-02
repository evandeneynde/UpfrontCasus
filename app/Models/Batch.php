<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Batch extends Model
{
    use HasFactory;

    protected $table = 'batches';

    /**
     * @var array<int, string>
     */
    protected $fillable = [
        'product_id',
        'user_id',
        'input_mode',
        'target_bags',
        'bag_weight_kg',
        'status',
        'current_step',
        'sifted',
        'mixer_started',
        'mix_minutes',
        'attached_to_line',
        'bags_produced',
        'started_at',
        'weighing_completed_at',
        'sifted_at',
        'mixing_completed_at',
        'attached_at',
        'completed_at',
        'notes',
    ];

    /**
     * @var array<string, string>
     */
    protected $casts = [
        'target_bags' => 'integer',
        'bag_weight_kg' => 'decimal:3',
        'current_step' => 'integer',
        'sifted' => 'boolean',
        'mixer_started' => 'boolean',
        'mix_minutes' => 'integer',
        'attached_to_line' => 'boolean',
        'bags_produced' => 'integer',
        'started_at' => 'datetime',
        'weighing_completed_at' => 'datetime',
        'sifted_at' => 'datetime',
        'mixing_completed_at' => 'datetime',
        'attached_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    public const string STATUS_IN_PROGRESS = 'in_progress';

    public const string STATUS_COMPLETED = 'completed';

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function ingredients(): HasMany
    {
        return $this->hasMany(BatchIngredient::class)->orderBy('sort_order');
    }

    public function isCompleted(): bool
    {
        return $this->status === self::STATUS_COMPLETED;
    }

    public function durationMinutes(): ?int
    {
        if ($this->started_at === null || $this->completed_at === null) {
            return null;
        }

        return (int) $this->started_at->diffInMinutes($this->completed_at);
    }

    public function totalActualWeight(): float
    {
        return (float) $this->ingredients->sum(
            fn (BatchIngredient $ingredient): float => (float) $ingredient->needed_kg,
        );
    }
}
