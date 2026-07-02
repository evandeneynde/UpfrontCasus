import { useForm } from '@inertiajs/react';
import { Plus, Trash2 } from 'lucide-react';
import React from 'react';
import InputError from '@/components/input-error';
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
import type { ProductFormData, ProductIngredientInput } from '@/types';

type Method = 'post' | 'put';

type ProductFormProps = {
    method: Method;
    action: string;
    submitLabel: string;
    product?: ProductFormData;
};

type FormShape = {
    name: string;
    bag_weight_kg: number | string;
    is_active: boolean;
    ingredients: ProductIngredientInput[];
};

export default function ProductForm({
    method,
    action,
    submitLabel,
    product,
}: ProductFormProps) {
    const form = useForm<FormShape>({
        name: product?.name ?? '',
        bag_weight_kg: product?.bag_weight_kg ?? '',
        is_active: product?.is_active ?? true,
        ingredients:
            product?.ingredients && product.ingredients.length > 0
                ? product.ingredients
                : [{ name: '', grams_per_bag: '' }],
    });

    const errors = form.errors as Record<string, string>;

    const updateIngredient = (
        index: number,
        key: keyof ProductIngredientInput,
        value: string,
    ) => {
        const next = form.data.ingredients.map((ingredient, i) =>
            i === index ? { ...ingredient, [key]: value } : ingredient,
        );
        form.setData('ingredients', next);
    };

    const addIngredient = () => {
        form.setData('ingredients', [
            ...form.data.ingredients,
            { name: '', grams_per_bag: '' },
        ]);
    };

    const removeIngredient = (index: number) => {
        form.setData(
            'ingredients',
            form.data.ingredients.filter((_, i) => i !== index),
        );
    };

    const submit = (event: React.SubmitEvent) => {
        event.preventDefault();

        if (method === 'put') {
            form.put(action, { preserveScroll: true });
        } else {
            form.post(action, { preserveScroll: true });
        }
    };

    return (
        <form onSubmit={submit} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Details</CardTitle>
                    <CardDescription>
                        Stel productnaam en zakgewicht in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Productnaam</Label>
                        <Input
                            id="name"
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="bijv. Chocolade whey"
                            required
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2 sm:max-w-xs">
                        <Label htmlFor="bag_weight_kg">Zakgewicht</Label>
                        <div className="relative">
                            <Input
                                id="bag_weight_kg"
                                type="number"
                                step="0.001"
                                min="0"
                                value={form.data.bag_weight_kg}
                                onChange={(e) =>
                                    form.setData('bag_weight_kg', e.target.value)
                                }
                                placeholder="1.000"
                                className="pr-9"
                                required
                            />
                            <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
                                kg
                            </span>
                        </div>
                        <InputError message={errors.bag_weight_kg} />
                    </div>

                    <div className="flex items-center gap-2">
                        <Checkbox
                            id="is_active"
                            checked={form.data.is_active}
                            onCheckedChange={(checked) =>
                                form.setData('is_active', checked === true)
                            }
                        />
                        <Label htmlFor="is_active">
                            Beschikbaar voor productie
                        </Label>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Ingrediënten</CardTitle>
                    <CardDescription>
                        Vul hoeveelheid (gram per zak) voor alle ingredienten in.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <InputError message={errors.ingredients} />

                    {form.data.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-start gap-3">
                            <div className="grid flex-1 gap-2">
                                <Label
                                    htmlFor={`ingredient-name-${index}`}
                                    className="sr-only"
                                >
                                    Naam ingrediënt
                                </Label>
                                <Input
                                    id={`ingredient-name-${index}`}
                                    value={ingredient.name}
                                    onChange={(e) =>
                                        updateIngredient(
                                            index,
                                            'name',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="Naam ingrediënt"
                                />
                                <InputError
                                    message={
                                        errors[`ingredients.${index}.name`]
                                    }
                                />
                            </div>
                            <div className="grid w-40 gap-2">
                                <Label
                                    htmlFor={`ingredient-prop-${index}`}
                                    className="sr-only"
                                >
                                    Gram per zak
                                </Label>
                                <div className="relative">
                                    <Input
                                        id={`ingredient-prop-${index}`}
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={ingredient.grams_per_bag}
                                        onChange={(e) =>
                                            updateIngredient(
                                                index,
                                                'grams_per_bag',
                                                e.target.value,
                                            )
                                        }
                                        placeholder="0"
                                        className="pr-7"
                                    />
                                    <span className="text-muted-foreground pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm">
                                        g
                                    </span>
                                </div>
                                <InputError
                                    message={
                                        errors[
                                            `ingredients.${index}.grams_per_bag`
                                        ]
                                    }
                                />
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="mt-0.5"
                                onClick={() => removeIngredient(index)}
                                disabled={form.data.ingredients.length === 1}
                                aria-label="Ingrediënt verwijderen"
                            >
                                <Trash2 className="text-muted-foreground" />
                            </Button>
                        </div>
                    ))}

                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addIngredient}
                    >
                        <Plus /> Ingrediënt toevoegen
                    </Button>
                </CardContent>
            </Card>

            <div className="flex items-center gap-4">
                <Button disabled={form.processing}>{submitLabel}</Button>
            </div>
        </form>
    );
}
