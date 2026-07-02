<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TrainingStep extends Model
{
    /**
     * The table associated with the model.
     *
     * @var string
     */
    protected $table = 'training_steps';

    /**
     * The attributes that are mass-assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'sort_order',
        'title',
        'description',
        'video_id',
        'options',
        'question',
        'correct_option',
    ];

    /**
     * Get the questions for this training step.
     */
    public function questions(): HasMany
    {
        return $this->hasMany(TrainingQuestion::class)->orderBy('sort_order');
    }
}
