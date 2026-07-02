import { Head, Link, usePage } from '@inertiajs/react';
import { Pencil, Video } from 'lucide-react';
import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { edit, index } from '@/routes/admin/training';
import type { AdminTrainingStep } from '@/types/production';

type PageProps = {
    steps: AdminTrainingStep[];
};

export default function AdminTrainingIndex() {
    const { steps } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Training Beheer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Training Beheer"
                    description="Bewerk de video's en vragen van de trainingsmodule."
                />

                <div className="rounded-xl border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-10">#</TableHead>
                                <TableHead>Stap</TableHead>
                                <TableHead>Video</TableHead>
                                <TableHead>Vragen</TableHead>
                                <TableHead className="text-right">
                                    Acties
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {steps.map((step, i) => (
                                <TableRow key={step.id}>
                                    <TableCell className="text-muted-foreground">
                                        {i + 1}
                                    </TableCell>
                                    <TableCell className="font-medium">
                                        {step.title}
                                    </TableCell>
                                    <TableCell>
                                        {step.video_id ? (
                                            <span className="flex items-center gap-1.5 text-sm text-green-600">
                                                <Video className="size-3.5" />
                                                {step.video_id}
                                            </span>
                                        ) : (
                                            <span className="text-sm text-muted-foreground">
                                                Geen video
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {step.questions_count ?? 0}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            asChild
                                            variant="ghost"
                                            size="icon"
                                            aria-label="Bewerken"
                                        >
                                            <Link href={edit(step.id).url}>
                                                <Pencil />
                                            </Link>
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </>
    );
}

AdminTrainingIndex.layout = {
    breadcrumbs: [
        {
            title: 'Training Beheer',
            href: index(),
        },
    ],
};
