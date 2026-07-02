import { Head } from '@inertiajs/react';
import Heading from '@/components/heading';
import ProductForm from '@/components/product-form';
import { index, store } from '@/routes/admin/products';

export default function CreateProduct() {
    return (
        <>
            <Head title="Nieuw Product" />

            <div className="flex h-full flex-1 flex-col gap-6 p-4">
                <Heading
                    title="Nieuw Product"
                    description="Nieuw product en receptuur aanmaken."
                />

                <div className="max-w-3xl">
                    <ProductForm
                        method="post"
                        action={store().url}
                        submitLabel="Product aanmaken"
                    />
                </div>
            </div>
        </>
    );
}

CreateProduct.layout = {
    breadcrumbs: [
        {
            title: 'Producten',
            href: index(),
        },
        {
            title: 'Nieuw',
            href: '#',
        },
    ],
};
