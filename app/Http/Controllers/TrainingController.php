<?php

namespace App\Http\Controllers;

use App\Models\TrainingStep;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Inertia\Inertia;
use Inertia\Response;

class TrainingController extends Controller
{
    public function index(Request $request): Response
    {
        $user = $request->user();

        return Inertia::render('training', [
            'steps' => $this->stepsForFrontend(),
            'passed' => $user instanceof User && $user->training_passed_at !== null,
        ]);
    }

    public function submit(Request $request): RedirectResponse
    {
        $request->validate([
            'answers' => ['required', 'array'],
            'answers.*' => ['required', 'array'],
            'answers.*.*' => ['required', 'integer', 'between:0,3'],
        ]);

        $answers = $request->input('answers', []);

        $steps = TrainingStep::query()->with('questions')->orderBy('sort_order')->get();

        $wrong = 0;
        foreach ($steps as $stepIdx => $step) {
            foreach ($step->questions as $qIdx => $question) {
                if (($answers[$stepIdx][$qIdx] ?? -1) !== $question->correct_option) {
                    $wrong++;
                }
            }
        }

        if ($wrong === 0) {
            $user = $request->user();
            if ($user instanceof User) {
                $user->training_passed_at = Carbon::now();
                $user->save();
            }

            Inertia::flash('toast', [
                'type' => 'success',
                'message' => 'Gefeliciteerd! Je hebt de training succesvol afgerond.',
            ]);

            return redirect()->route('training.index');
        }

        Inertia::flash('toast', [
            'type' => 'error',
            'message' => $wrong === 1
                ? 'Je had 1 fout antwoord. Bekijk de stappen opnieuw en probeer het nogmaals.'
                : "Je had {$wrong} foute antwoorden. Bekijk de stappen opnieuw en probeer het nogmaals.",
        ]);

        return redirect()->route('training.index');
    }

    /**
     * @return list<array{title: string, description: string, video_id: string|null, questions: list<array{question: string, options: list<string>}>}>
     */
    private function stepsForFrontend(): array
    {
        $steps = TrainingStep::query()
            ->with('questions')
            ->orderBy('sort_order')
            ->get();

        $result = [];
        foreach ($steps as $step) {
            $questions = [];
            foreach ($step->questions as $q) {
                $questions[] = [
                    'question' => (string) $q->question,
                    'options' => (array) $q->options,
                ];
            }
            $result[] = [
                'title' => $step->title,
                'description' => $step->description,
                'video_id' => $step->video_id,
                'questions' => $questions,
            ];
        }

        return $result;
    }
}
