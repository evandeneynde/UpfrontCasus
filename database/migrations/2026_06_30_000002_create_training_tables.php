<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('training_steps', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('sort_order');
            $table->string('title');
            $table->text('description');
            $table->string('video_id')->nullable();
            $table->timestamps();
        });

        Schema::create('training_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('training_step_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('sort_order');
            $table->text('question');
            $table->json('options');
            $table->unsignedTinyInteger('correct_option');
            $table->timestamps();
        });

    }

    public function down(): void
    {
        Schema::dropIfExists('training_questions');
        Schema::dropIfExists('training_steps');
    }
};
