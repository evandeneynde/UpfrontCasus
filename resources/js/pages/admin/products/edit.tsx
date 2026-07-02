import { Head, usePage } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProductForm from '@/components/product-form';
import { index, update } from '@/routes/admin/products';
import type { ProductFormData } from '@/types';

type PageProps = {
    product: ProductFormData;
};

export default function EditProduct() {
    const { product } = usePage<PageProps>().props;

    return (
        <>
            <Head title={`${product.name} bewerken`} />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title={`${product.name} bewerken`}
                    description="Werk het product en de ingrediëntenverhoudingen bij."
                />

                <div className="max-w-3xl">
                    <ProductForm
                        method="put"
                        action={update(product.id).url}
                        submitLabel="Wijzigingen opslaan"
                        product={product}
                    />
                </div>
            </div>
        </>
    );
}

EditProduct.layout = {
    breadcrumbs: [
        {
            title: 'Producten',
            href: index(),
        },
        {
            title: 'Bewerken',
            href: '#',
        },
    ],
};
