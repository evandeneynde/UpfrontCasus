import { Head, useForm, usePage } from '@inertiajs/react';
import { Check } from 'lucide-react';
import React from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import {
    attachment,
    finish,
    index,
    mixing,
    sifting,
    weighing,
} from '@/routes/production';
import type { ProductionRun } from '@/types';

type PageProps = {
    batch: ProductionRun;
};

const STEP_LABELS = ['Wegen', 'Zeven', 'Mixen', 'Vullijn', 'Afronden'];

function StepIndicator({ current }: { current: number }) {
    return (
        <ol className="flex flex-wrap gap-2">
            {STEP_LABELS.map((label, i) => {
                const step = i + 1;
                const state =
                    step < current
                        ? 'done'
                        : step === current
                          ? 'current'
                          : 'todo';

                return (
                    <li
                        key={label}
                        className={cn(
                            'flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm',
                            state === 'current' &&
                                'border-primary bg-primary/5 font-medium',
                            state === 'todo' && 'text-muted-foreground',
                        )}
                    >
                        <span
                            className={cn(
                                'flex size-5 items-center justify-center rounded-full text-xs',
                                state === 'done' &&
                                    'bg-primary text-primary-foreground',
                                state === 'current' && 'border border-primary',
                                state === 'todo' && 'border',
                            )}
                        >
                            {state === 'done' ? (
                                <Check className="size-3" />
                            ) : (
                                step
                            )}
                        </span>
                        {label}
                    </li>
                );
            })}
        </ol>
    );
}

function WeighingStep({ batch }: { batch: ProductionRun }) {
    const [checked, setChecked] = React.useState<Record<number, boolean>>(
        () => Object.fromEntries(batch.ingredients.map((i) => [i.id, false])),
    );
    const form = useForm<{ weighing_confirmed: boolean }>({
        weighing_confirmed: false,
    });

    const allChecked = batch.ingredients.every((i) => checked[i.id]);

    const submit = (event: React.SubmitEvent) => {
        event.preventDefault();
        form.patch(weighing(batch.id).url, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stap 1 · Ingrediënten wegen</CardTitle>
                <CardDescription>
                    Weeg elk ingrediënt af en vink het aan wanneer klaar.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="rounded-lg border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Ingrediënt</TableHead>
                                    <TableHead>Benodigd (kg)</TableHead>
                                    <TableHead className="text-center">Afgewogen</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batch.ingredients.map((ingredient) => (
                                    <TableRow key={ingredient.id}>
                                        <TableCell className="font-medium">
                                            {ingredient.name}
                                        </TableCell>
                                        <TableCell>
                                            {ingredient.needed_kg.toFixed(3)}
                                        </TableCell>
                                        <TableCell className="w-10 text-center">
                                            <Checkbox
                                                id={`ing-${ingredient.id}`}
                                                checked={checked[ingredient.id]}
                                                onCheckedChange={(v) =>
                                                    setChecked((prev) => ({
                                                        ...prev,
                                                        [ingredient.id]: v === true,
                                                    }))
                                                }
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <Button disabled={form.processing || !allChecked}>
                        Bevestigen & doorgaan
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}

function SiftingStep({ batch }: { batch: ProductionRun }) {
    const form = useForm<{ sifted: boolean }>({
        sifted: batch.sifted ?? false,
    });

    const submit = (event: React.SubmitEvent) => {
        event.preventDefault();
        form.patch(sifting(batch.id).url, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stap 2 · Zeven</CardTitle>
                <CardDescription>
                    Bevestig dat de ingrediënten in de IBC-container zijn
                    gezeefd.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="sifted"
                            checked={form.data.sifted}
                            onCheckedChange={(checked) =>
                                form.setData('sifted', checked === true)
                            }
                        />
                        <Label htmlFor="sifted">
                            Ingrediënten zijn in de IBC gezeefd
                        </Label>
                    </div>
                    <Button disabled={form.processing}>Doorgaan</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function MixingStep({ batch }: { batch: ProductionRun }) {
    const form = useForm<{ mixer_started: boolean; mix_minutes: string }>({
        mixer_started: batch.mixer_started ?? false,
        mix_minutes:
            batch.mix_minutes !== null ? String(batch.mix_minutes) : '',
    });

    const errors = form.errors as Record<string, string>;

    const submit = (event: React.SubmitEvent) => {
        event.preventDefault();
        form.patch(mixing(batch.id).url, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stap 3 · Mixen</CardTitle>
                <CardDescription>
                    Bevestig dat de mixer is gestart en registreer hoe lang hij
                    heeft gedraaid.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="mixer_started"
                            checked={form.data.mixer_started}
                            onCheckedChange={(checked) =>
                                form.setData('mixer_started', checked === true)
                            }
                        />
                        <Label htmlFor="mixer_started">
                            De mixer is gestart
                        </Label>
                    </div>

                    {form.data.mixer_started && (
                        <div className="grid gap-2 sm:max-w-xs">
                            <Label htmlFor="mix_minutes">
                                Mixtijd (minuten)
                            </Label>
                            <Input
                                id="mix_minutes"
                                type="number"
                                step="1"
                                min="1"
                                value={form.data.mix_minutes}
                                onChange={(e) =>
                                    form.setData('mix_minutes', e.target.value)
                                }
                                placeholder="e.g. 15"
                            />
                            <InputError message={errors.mix_minutes} />
                        </div>
                    )}

                    <Button disabled={form.processing}>Doorgaan</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function AttachmentStep({ batch }: { batch: ProductionRun }) {
    const form = useForm<{ attached_to_line: boolean }>({
        attached_to_line: batch.attached_to_line ?? false,
    });

    const submit = (event: React.SubmitEvent) => {
        event.preventDefault();
        form.patch(attachment(batch.id).url, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stap 4 · Vullijn</CardTitle>
                <CardDescription>
                    Bevestig dat de IBC is aangesloten op de automatische
                    vullijn.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="attached_to_line"
                            checked={form.data.attached_to_line}
                            onCheckedChange={(checked) =>
                                form.setData(
                                    'attached_to_line',
                                    checked === true,
                                )
                            }
                        />
                        <Label htmlFor="attached_to_line">
                            IBC aangesloten op de automatische vullijn
                        </Label>
                    </div>
                    <Button disabled={form.processing}>Doorgaan</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function FinishStep({ batch }: { batch: ProductionRun }) {
    const form = useForm<{
        bags_produced: string;
        notes: string;
    }>({
        bags_produced: '',
        notes: '',
    });

    const errors = form.errors as Record<string, string>;

    const submit = (event: React.SubmitEvent) => {
        event.preventDefault();
        form.patch(finish(batch.id).url, { preserveScroll: true });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Stap 5 · Afronden</CardTitle>
                <CardDescription>
                    Registreer hoeveel zakken van de lijn zijn gekomen.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={submit} className="space-y-4">
                    <div className="grid gap-2 sm:max-w-xs">
                        <Label htmlFor="bags_produced">Geproduceerde zakken</Label>
                        <Input
                            id="bags_produced"
                            type="number"
                            step="1"
                            min="0"
                            value={form.data.bags_produced}
                            onChange={(e) =>
                                form.setData('bags_produced', e.target.value)
                            }
                            placeholder="e.g. 498"
                            required
                        />
                        <InputError message={errors.bags_produced} />
                    </div>

                    <div className="grid gap-2 sm:max-w-md">
                        <Label htmlFor="notes">Opmerkingen (optioneel)</Label>
                        <Input
                            id="notes"
                            value={form.data.notes}
                            onChange={(e) =>
                                form.setData('notes', e.target.value)
                            }
                            placeholder="Alles wat vermeldenswaard is"
                        />
                        <InputError message={errors.notes} />
                    </div>

                    <Button disabled={form.processing}>Batch voltooien</Button>
                </form>
            </CardContent>
        </Card>
    );
}

function Summary({ batch }: { batch: ProductionRun }) {
    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Batch-overzicht</CardTitle>
                    <CardDescription>Deze batch is voltooid.</CardDescription>
                </CardHeader>
                <CardContent>
                    <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-3">
                        <div>
                            <dt className="text-muted-foreground">Doel</dt>
                            <dd className="font-medium">
                                {batch.target_bags} zakken
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">
                                Geproduceerde zakken
                            </dt>
                            <dd className="font-medium">
                                {batch.bags_produced ?? '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">Duur</dt>
                            <dd className="font-medium">
                                {batch.duration_minutes !== null
                                    ? `${batch.duration_minutes} min`
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">
                                Mixtijd
                            </dt>
                            <dd className="font-medium">
                                {batch.mix_minutes !== null
                                    ? `${batch.mix_minutes} min`
                                    : '—'}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-muted-foreground">
                                Ingewogen
                            </dt>
                            <dd className="font-medium">
                                {batch.total_actual_weight ?? '—'} kg
                            </dd>
                        </div>
                    </dl>
                    {batch.notes && (
                        <p className="mt-4 text-sm">
                            <span className="text-muted-foreground">
                                Opmerkingen:{' '}
                            </span>
                            {batch.notes}
                        </p>
                    )}
                </CardContent>
            </Card>

        </div>
    );
}

export default function ProductionRunPage() {
    const { batch } = usePage<PageProps>().props;

    const renderStep = () => {
        switch (batch.current_step) {
            case 1:
                return <WeighingStep batch={batch} />;
            case 2:
                return <SiftingStep batch={batch} />;
            case 3:
                return <MixingStep batch={batch} />;
            case 4:
                return <AttachmentStep batch={batch} />;
            default:
                return <FinishStep batch={batch} />;
        }
    };

    return (
        <>
            <Head title={`Batch · ${batch.product_name}`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <Heading
                        title={batch.product_name}
                        description={`Batch: ${batch.target_bags} zakken`}
                    />
                    <Badge
                        variant={
                            batch.status === 'completed'
                                ? 'secondary'
                                : 'default'
                        }
                    >
                        {batch.status === 'completed'
                            ? 'Voltooid'
                            : 'Bezig'}
                    </Badge>
                </div>

                {batch.status === 'completed' ? (
                    <Summary batch={batch} />
                ) : (
                    <div className="space-y-6">
                        <StepIndicator current={batch.current_step} />
                        {renderStep()}
                    </div>
                )}
            </div>
        </>
    );
}

ProductionRunPage.layout = {
    breadcrumbs: [
        {
            title: 'Productie',
            href: index(),
        },
        {
            title: 'Batch',
            href: '#',
        },
    ],
};
