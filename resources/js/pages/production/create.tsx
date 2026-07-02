import { Head, useForm, usePage } from '@inertiajs/react';
import React from 'react';
import Heading from '@/components/heading';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { index, store } from '@/routes/production';
import type { ActiveProduct } from '@/types';

type PageProps = {
    products: ActiveProduct[];
};

type FormShape = {
    product_id: string;
    target_bags: string;
};

export default function StartBatch() {
    const { products } = usePage<PageProps>().props;

    const form = useForm<FormShape>({
        product_id: '',
        target_bags: '',
    });

    const errors = form.errors as Record<string, string>;

    const selected = products.find(
        (product) => String(product.id) === form.data.product_id,
    );

    const computedKg =
        selected && form.data.target_bags !== ''
            ? Number(form.data.target_bags) * selected.bag_weight_kg
            : null;

    const submit = (event: React.SyntheticEvent) => {
        event.preventDefault();
        form.post(store().url);
    };

    return (
        <>
            <Head title="Batch starten" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Batch starten"
                    description="Kies een product en selecteer de hoeveelheid."
                />

                <form onSubmit={submit} className="max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Product</CardTitle>
                            <CardDescription>
                                Select een product / smaak.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="product_id">
                                    Product
                                </Label>
                                <Select
                                    value={form.data.product_id}
                                    onValueChange={(value) =>
                                        form.setData('product_id', value)
                                    }
                                >
                                    <SelectTrigger
                                        id="product_id"
                                        className="w-full"
                                    >
                                        <SelectValue placeholder="Selecteer een product" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {products.map((product) => (
                                            <SelectItem
                                                key={product.id}
                                                value={String(product.id)}
                                            >
                                                {product.name} (
                                                {product.bag_weight_kg}{' '}
                                                kg/zak)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <InputError message={errors.product_id} />
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Hoeveelheid</CardTitle>
                            <CardDescription>
                                Voer het aantal zakken in.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid gap-2 sm:max-w-xs">
                                <Label htmlFor="target_bags">
                                    Aantal zakken
                                </Label>
                                <Input
                                    id="target_bags"
                                    type="number"
                                    step="1"
                                    min="1"
                                    value={form.data.target_bags}
                                    onChange={(e) =>
                                        form.setData(
                                            'target_bags',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="bijv. 500"
                                />
                                <InputError message={errors.target_bags} />
                                {computedKg !== null && (
                                    <p className="text-sm text-muted-foreground">
                                        ≈ {computedKg.toFixed(1)} kg mengsel
                                    </p>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex items-center gap-4">
                        <Button disabled={form.processing}>Batch starten</Button>
                    </div>
                </form>
            </div>
        </>
    );
}

StartBatch.layout = {
    breadcrumbs: [
        {
            title: 'Productie',
            href: index(),
        },
        {
            title: 'Batch starten',
            href: '#',
        },
    ],
};
