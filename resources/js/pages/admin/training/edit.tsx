import { Head, router, usePage } from '@inertiajs/react';
import { Minus, Plus } from 'lucide-react';
import React, { useState } from 'react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { index, update } from '@/routes/admin/training';
import type { AdminTrainingQuestion, AdminTrainingStep } from '@/types/production';

type PageProps = {
    step: AdminTrainingStep;
};

type DraftQuestion = {
    id?: number;
    question: string;
    options: [string, string, string, string];
    correct_option: number;
};

function QuestionEditor({
    question,
    index: idx,
    onChange,
    onRemove,
}: {
    question: DraftQuestion;
    index: number;
    onChange: (q: DraftQuestion) => void;
    onRemove: () => void;
}) {
    const setOption = (optIdx: number, value: string) => {
        const next = [...question.options] as [string, string, string, string];
        next[optIdx] = value;
        onChange({ ...question, options: next });
    };

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4 pb-2">
                <CardTitle className="text-sm font-medium">
                    Vraag {idx + 1}
                </CardTitle>
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={onRemove}
                    aria-label="Vraag verwijderen"
                >
                    <Minus className="size-4" />
                </Button>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                    <Label>Vraag</Label>
                    <Textarea
                        value={question.question}
                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                            onChange({ ...question, question: e.target.value })
                        }
                        rows={2}
                        placeholder="Stel hier je vraag..."
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <Label>Antwoordopties</Label>
                    {question.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center gap-2">
                            <input
                                type="radio"
                                name={`correct-${idx}`}
                                checked={question.correct_option === optIdx}
                                onChange={() =>
                                    onChange({
                                        ...question,
                                        correct_option: optIdx,
                                    })
                                }
                                className="accent-primary"
                                aria-label={`Optie ${optIdx + 1} is correct`}
                            />
                            <Input
                                value={opt}
                                onChange={(e) =>
                                    setOption(optIdx, e.target.value)
                                }
                                placeholder={`Optie ${optIdx + 1}`}
                            />
                        </div>
                    ))}
                    <p className="text-xs text-muted-foreground">
                        Selecteer het rondje links van het juiste antwoord.
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}

export default function AdminTrainingEdit() {
    const { step } = usePage<PageProps>().props;

    const [title, setTitle] = useState(step.title);
    const [description, setDescription] = useState(step.description);
    const [videoId, setVideoId] = useState(step.video_id ?? '');
    const [questions, setQuestions] = useState<DraftQuestion[]>(
        step.questions.map((q: AdminTrainingQuestion) => ({ ...q })),
    );
    const [processing, setProcessing] = useState(false);

    const addQuestion = () => {
        setQuestions((prev) => [
            ...prev,
            {
                question: '',
                options: ['', '', '', ''],
                correct_option: 0,
            },
        ]);
    };

    const removeQuestion = (idx: number) => {
        setQuestions((prev) => prev.filter((_, i) => i !== idx));
    };

    const updateQuestion = (idx: number, q: DraftQuestion) => {
        setQuestions((prev) => prev.map((old, i) => (i === idx ? q : old)));
    };

    const handleSubmit = (e: React.SubmitEvent) => {
        e.preventDefault();
        setProcessing(true);

        router.put(
            update(step.id).url,
            {
                title,
                description,
                video_id: videoId || null,
                questions: questions.map((q) => ({
                    question: q.question,
                    options: q.options,
                    correct_option: q.correct_option,
                })),
            },
            {
                onFinish: () => setProcessing(false),
            },
        );
    };

    return (
        <>
            <Head title={`Stap ${step.sort_order + 1} bewerken`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title={`Stap ${step.sort_order + 1} bewerken`}
                    description="Pas de video, omschrijving en vragen aan."
                />

                <form
                    onSubmit={handleSubmit}
                    className="flex max-w-3xl flex-col gap-6"
                >
                    <Card>
                        <CardHeader>
                            <CardTitle>Stap details</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-4">
                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="title">Titel</Label>
                                <Input
                                    id="title"
                                    value={title}
                                    onChange={(e) =>
                                        setTitle(e.target.value)
                                    }
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="description">Omschrijving</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    rows={3}
                                    required
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <Label htmlFor="video_id">
                                    YouTube video ID{' '}
                                    <span className="text-muted-foreground">
                                        (optioneel)
                                    </span>
                                </Label>
                                <Input
                                    id="video_id"
                                    value={videoId}
                                    onChange={(e) =>
                                        setVideoId(e.target.value)
                                    }
                                    placeholder="bijv. dQw4w9WgXcQ"
                                />
                                <p className="text-xs text-muted-foreground">
                                    Alleen het ID-gedeelte van de YouTube URL,
                                    niet de volledige link.
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-sm font-semibold">Vragen</h2>
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={addQuestion}
                            >
                                <Plus className="size-4" /> Vraag toevoegen
                            </Button>
                        </div>

                        {questions.length === 0 ? (
                            <p className="text-sm text-muted-foreground">
                                Nog geen vragen. Voeg er minimaal één toe.
                            </p>
                        ) : (
                            questions.map((q, idx) => (
                                <QuestionEditor
                                    key={idx}
                                    question={q}
                                    index={idx}
                                    onChange={(updated) =>
                                        updateQuestion(idx, updated)
                                    }
                                    onRemove={() => removeQuestion(idx)}
                                />
                            ))
                        )}
                    </div>

                    <div className="flex gap-3">
                        <Button type="submit" disabled={processing}>
                            {processing ? 'Opslaan…' : 'Wijzigingen opslaan'}
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.visit(index().url)}
                        >
                            Annuleren
                        </Button>
                    </div>
                </form>
            </div>
        </>
    );
}

AdminTrainingEdit.layout = {
    breadcrumbs: [
        {
            title: 'Training beheer',
            href: index(),
        },
        {
            title: 'Bewerken',
            href: '#',
        },
    ],
};
