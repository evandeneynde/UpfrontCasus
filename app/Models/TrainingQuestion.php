<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TrainingQuestion extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'training_questions';

    /**
     * The attributes that are mass-assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'training_step_id',
        'sort_order',
        'question',
        'options',
        'correct_option',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'options' => 'array',
        'correct_option' => 'integer',
    ];

    /**
     * Get the training step this question belongs to.
     */
    public function step(): BelongsTo
    {
        return $this->belongsTo(TrainingStep::class, 'training_step_id');
    }
}
