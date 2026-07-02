import { Head, Link, router, usePage } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import Heading from '@/components/heading';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { create, index, run } from '@/routes/production';
import type { Auth, BatchListItem } from '@/types';

type PageProps = {
    auth: Auth;
    batches: BatchListItem[];
};

function formatDate(value: string | null): string {
    if (!value) {
        return '—';
    }

    return new Date(value).toLocaleString();
}

function formatDuration(minutes: number | null): string {
    if (minutes === null) {
        return '—';
    }

    if (minutes < 60) {
        return `${minutes} min`;
    }

    const hours = Math.floor(minutes / 60);
    const rest = minutes % 60;

    return `${hours}h ${rest}m`;
}

export default function ProductionIndex() {
    const { auth, batches } = usePage<PageProps>().props;
    const isAdmin = auth.user.is_admin;

    const handleDelete = (batch: BatchListItem) => {
        if (window.confirm(`Batch verwijderen? Dit kan niet ongedaan worden gemaakt.`)) {
            router.delete(`/production/${batch.id}`, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Productie" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Productie"
                        description="Start een nieuwe of hervat een lopende batch."
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus /> Nieuwe batch starten
                        </Link>
                    </Button>
                </div>

                {batches.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nog geen batches.
                    </p>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {isAdmin && <TableHead>Medewerker</TableHead>}
                                    <TableHead>Product</TableHead>
                                    <TableHead>Doel</TableHead>
                                    <TableHead>Geproduceerd</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Gestart</TableHead>
                                    <TableHead>Duur</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map((batch) => (
                                    <TableRow key={batch.id}>
                                        {isAdmin && (
                                            <TableCell className="text-muted-foreground">
                                                {batch.worker_name}
                                            </TableCell>
                                        )}
                                        <TableCell className="font-medium">
                                            {batch.product_name}
                                        </TableCell>
                                        <TableCell>
                                            {batch.target_bags}
                                        </TableCell>
                                        <TableCell>
                                            {batch.bags_produced ?? '—'}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    batch.status === 'completed'
                                                        ? 'secondary'
                                                        : 'default'
                                                }
                                            >
                                                {batch.status === 'completed'
                                                    ? 'Voltooid'
                                                    : `Bezig · stap ${batch.current_step}/5`}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            {formatDate(batch.started_at)}
                                        </TableCell>
                                        <TableCell>
                                            {formatDuration(
                                                batch.duration_minutes,
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    asChild
                                                    variant="outline"
                                                    size="sm"
                                                >
                                                    <Link href={run(batch.id)}>
                                                        {batch.status ===
                                                        'completed'
                                                            ? 'Bekijken'
                                                            : 'Hervatten'}
                                                    </Link>
                                                </Button>
                                                {batch.user_id === auth.user.id && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        aria-label="Verwijderen"
                                                        onClick={() => handleDelete(batch)}
                                                    >
                                                        <Trash2 className="text-destructive" />
                                                    </Button>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                )}
            </div>
        </>
    );
}

ProductionIndex.layout = {
    breadcrumbs: [
        {
            title: 'Productie',
            href: index(),
        },
    ],
};
