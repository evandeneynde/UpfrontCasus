import { Head, router, usePage } from '@inertiajs/react';
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { index, submit } from '@/routes/training';
import type { TrainingStep } from '@/types';

type PageProps = {
    steps: TrainingStep[];
    passed: boolean;
};

function VideoEmbed({ videoId }: { videoId: string | null }) {
    if (!videoId) {
        return (
            <div className="flex aspect-video w-full items-center justify-center rounded-lg bg-muted">
                <p className="text-sm text-muted-foreground">Nog geen video</p>
            </div>
        );
    }

    return (
        <div className="aspect-video w-full overflow-hidden rounded-lg bg-black">
            <iframe
                src={`https://www.youtube.com/embed/${videoId}`}
                title="Trainingsvideo"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="size-full border-0"
            />
        </div>
    );
}

function Question({
    question,
    options,
    selected,
    onChange,
    index: qIdx,
}: {
    question: string;
    options: string[];
    selected: number | null;
    onChange: (value: number) => void;
    index: number;
}) {
    return (
        <div className="space-y-2">
            <p className="text-sm font-medium">
                Vraag {qIdx + 1}: {question}
            </p>
            <div className="space-y-1.5">
                {options.map((option, i) => (
                    <label
                        key={i}
                        className={`flex cursor-pointer items-start gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                            selected === i
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-transparent bg-muted/40 text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        }`}
                    >
                        <input
                            type="radio"
                            name={`q-${qIdx}`}
                            value={i}
                            checked={selected === i}
                            onChange={() => onChange(i)}
                            className="mt-0.5 accent-primary"
                        />
                        <span>{option}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}

function StepCard({
    step,
    stepIndex,
    answers,
    onAnswer,
    defaultOpen,
}: {
    step: TrainingStep;
    stepIndex: number;
    answers: (number | null)[];
    onAnswer: (qIdx: number, value: number) => void;
    defaultOpen: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const answered = answers.filter((a) => a !== null).length;
    const total = step.questions.length;
    const complete = answered === total;

    return (
        <Card className="overflow-hidden gap-0 pb-0">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex w-full cursor-pointer items-center gap-4 px-6 py-5 text-left"
                aria-expanded={open}
            >
                <span
                    className={`flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                        complete
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                    }`}
                >
                    {stepIndex + 1}
                </span>
                <div className="flex-1">
                    <p className="font-medium leading-tight">{step.title}</p>
                    <p className="text-xs text-muted-foreground">
                        {complete
                            ? 'Alle vragen beantwoord'
                            : `${answered}/${total} vragen beantwoord`}
                    </p>
                </div>
                {open ? (
                    <ChevronUp className="size-4 shrink-0 text-muted-foreground" />
                ) : (
                    <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                )}
            </button>

            {open && (
                <div className="space-y-6 border-t px-6 py-5">
                    <VideoEmbed videoId={step.video_id} />
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                    {step.questions.map((q, qIdx) => (
                        <Question
                            key={qIdx}
                            index={qIdx}
                            question={q.question}
                            options={q.options}
                            selected={answers[qIdx] ?? null}
                            onChange={(value) => onAnswer(qIdx, value)}
                        />
                    ))}
                </div>
            )}
        </Card>
    );
}

export default function Training() {
    const { steps, passed } = usePage<PageProps>().props;

    const [answers, setAnswers] = useState<(number | null)[][]>(
        steps.map((s) => Array(s.questions.length).fill(null)),
    );
    const [submitting, setSubmitting] = useState(false);

    const totalQuestions = steps.reduce((sum, s) => sum + s.questions.length, 0);
    const answeredCount = answers.flat().filter((a) => a !== null).length;
    const allAnswered = answeredCount === totalQuestions;

    function handleAnswer(stepIdx: number, qIdx: number, value: number) {
        setAnswers((prev) => {
            const next = prev.map((row) => [...row]);
            next[stepIdx][qIdx] = value;

            return next;
        });
    }

    function handleSubmit() {
        setSubmitting(true);
        router.post(
            submit().url,
            { answers },
            {
                onFinish: () => setSubmitting(false),
            },
        );
    }

    return (
        <>
            <Head title="Traingsmodule" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Traingsmodule"
                    description="Beantwoord de vragen om toegang te krijgen tot de productiemodule."
                />

                {passed && (
                    <Card className="border-green-500/40 bg-green-500/5">
                        <CardContent className="flex items-center gap-3 py-4">
                            <CheckCircle2 className="size-5 shrink-0 text-green-600 dark:text-green-400" />
                            <div>
                                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                                    Training voltooid
                                </p>
                                <p className="text-xs text-green-600/80 dark:text-green-500/80">
                                    Je hebt de training gehaald!
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="space-y-3">
                    {steps.map((step, stepIdx) => (
                        <StepCard
                            key={stepIdx}
                            step={step}
                            stepIndex={stepIdx}
                            answers={answers[stepIdx]}
                            onAnswer={(qIdx, value) =>
                                handleAnswer(stepIdx, qIdx, value)
                            }
                            defaultOpen={stepIdx === 0}
                        />
                    ))}
                </div>

                <div className="flex items-center justify-between gap-4 rounded-xl border bg-card px-6 py-4">
                    <p className="text-sm text-muted-foreground">
                        {allAnswered
                            ? 'Alle vragen beantwoord — klaar om in te sturen.'
                            : `${answeredCount} van de ${totalQuestions} vragen beantwoord.`}
                    </p>
                    <Button
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                    >
                        {submitting ? 'Bezig…' : 'Verstuur antwoorden'}
                    </Button>
                </div>
            </div>
        </>
    );
}

Training.layout = {
    breadcrumbs: [
        {
            title: 'Training',
            href: index(),
        },
    ],
};
