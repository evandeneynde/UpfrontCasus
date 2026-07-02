<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained();
            $table->foreignId('user_id')->constrained();

            $table->string('input_mode')->default('kg');
            $table->unsignedInteger('target_bags')->nullable();
            $table->decimal('bag_weight_kg', 8, 3);

            $table->string('status')->default('in_progress');
            $table->unsignedTinyInteger('current_step')->default(1);

            $table->boolean('sifted')->nullable();
            $table->boolean('mixer_started')->nullable();
            $table->unsignedInteger('mix_minutes')->nullable();
            $table->boolean('attached_to_line')->nullable();
            $table->unsignedInteger('bags_produced')->nullable();

            $table->timestamp('started_at')->nullable();
            $table->timestamp('weighing_completed_at')->nullable();
            $table->timestamp('sifted_at')->nullable();
            $table->timestamp('mixing_completed_at')->nullable();
            $table->timestamp('attached_at')->nullable();
            $table->timestamp('completed_at')->nullable();

            $table->text('notes')->nullable();
            $table->timestamps();
        });

        Schema::create('batch_ingredients', function (Blueprint $table) {
            $table->id();
            $table->foreignId('batch_id')->constrained('batches')->cascadeOnDelete();
            $table->string('name');
            $table->decimal('needed_kg', 10, 3);
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('batch_ingredients');
        Schema::dropIfExists('batches');
    }
};
