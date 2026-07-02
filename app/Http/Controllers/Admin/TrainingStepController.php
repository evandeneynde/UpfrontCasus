<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\TrainingStep;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class TrainingStepController extends Controller
{
    public function index(): Response
    {
        $steps = TrainingStep::query()
            ->with('questions')
            ->orderBy('sort_order')
            ->get()
            ->map(fn (TrainingStep $step): array => [
                'id' => $step->id,
                'sort_order' => $step->sort_order,
                'title' => $step->title,
                'description' => $step->description,
                'video_id' => $step->video_id,
                'questions_count' => $step->questions->count(),
            ]);

        return Inertia::render('admin/training/index', [
            'steps' => $steps,
        ]);
    }

    public function edit(TrainingStep $step): Response
    {
        $step->load('questions');

        $questions = [];
        foreach ($step->questions as $question) {
            $questions[] = [
                'id' => $question->id,
                'question' => $question->question,
                'options' => $question->options,
                'correct_option' => $question->correct_option,
            ];
        }

        return Inertia::render('admin/training/edit', [
            'step' => [
                'id' => $step->id,
                'sort_order' => $step->sort_order,
                'title' => $step->title,
                'description' => $step->description,
                'video_id' => $step->video_id,
                'questions' => $questions,
            ],
        ]);
    }

    public function update(Request $request, TrainingStep $step): RedirectResponse
    {
        $data = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['required', 'string'],
            'video_id' => ['nullable', 'string', 'max:100'],
            'questions' => ['required', 'array', 'min:1'],
            'questions.*.question' => ['required', 'string'],
            'questions.*.options' => ['required', 'array', 'size:4'],
            'questions.*.options.*' => ['required', 'string'],
            'questions.*.correct_option' => ['required', 'integer', 'between:0,3'],
        ]);

        DB::transaction(function () use ($step, $data): void {
            $step->update([
                'title' => $data['title'],
                'description' => $data['description'],
                'video_id' => $data['video_id'] ?? null,
            ]);

            $step->questions()->delete();

            foreach ($data['questions'] as $idx => $q) {
                $step->questions()->create([
                    'sort_order' => $idx,
                    'question' => $q['question'],
                    'options' => $q['options'],
                    'correct_option' => $q['correct_option'],
                ]);
            }
        });

        Inertia::flash('toast', ['type' => 'success', 'message' => 'Stap opgeslagen.']);

        return redirect()->route('admin.training.index');
    }
}
