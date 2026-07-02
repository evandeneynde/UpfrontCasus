import { Head, Link, router, usePage } from '@inertiajs/react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
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
import { create, destroy, edit, index } from '@/routes/admin/products';
import type { ProductListItem } from '@/types';

type PageProps = {
    products: ProductListItem[];
};

export default function ProductsIndex() {
    const { products } = usePage<PageProps>().props;

    const handleDelete = (product: ProductListItem) => {
        if (
            window.confirm(`"${product.name}" verwijderen?`)
        ) {
            router.delete(destroy(product.id).url, { preserveScroll: true });
        }
    };

    return (
        <>
            <Head title="Product Beheer" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <div className="flex items-center justify-between gap-4">
                    <Heading
                        title="Product Beheer"
                        description="Voeg nieuwe smaken of producten toe en stel de ingredientverhoudingen in."
                    />
                    <Button asChild>
                        <Link href={create()}>
                            <Plus /> Nieuw Product / Smaak
                        </Link>
                    </Button>
                </div>

                {products.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                        Nog geen producten.
                    </p>
                ) : (
                    <div className="rounded-xl border">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Naam</TableHead>
                                    <TableHead>Zakgewicht</TableHead>
                                    <TableHead>Ingrediënten</TableHead>
                                    <TableHead>Runs</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">
                                        Acties
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {products.map((product) => (
                                    <TableRow key={product.id}>
                                        <TableCell className="font-medium">
                                            {product.name}
                                        </TableCell>
                                        <TableCell>
                                            {product.bag_weight_kg} kg
                                        </TableCell>
                                        <TableCell>
                                            {product.ingredients_count}
                                        </TableCell>
                                        <TableCell>
                                            {product.batches_count}
                                        </TableCell>
                                        <TableCell>
                                            <Badge
                                                variant={
                                                    product.is_active
                                                        ? 'default'
                                                        : 'secondary'
                                                }
                                            >
                                                {product.is_active
                                                    ? 'Actief'
                                                    : 'Inactief'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex justify-end gap-1">
                                                <Button
                                                    asChild
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Bewerken"
                                                >
                                                    <Link
                                                        href={edit(
                                                            product.id,
                                                        )}
                                                    >
                                                        <Pencil />
                                                    </Link>
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    aria-label="Verwijderen"
                                                    onClick={() =>
                                                        handleDelete(product)
                                                    }
                                                >
                                                    <Trash2 className="text-destructive" />
                                                </Button>
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

ProductsIndex.layout = {
    breadcrumbs: [
        {
            title: 'Product Beheer',
            href: index(),
        },
    ],
};
