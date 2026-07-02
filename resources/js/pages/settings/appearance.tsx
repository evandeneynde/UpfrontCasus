import { Head } from '@inertiajs/react';
import AppearanceTabs from '@/components/appearance-tabs';
import Heading from '@/components/heading';
import { edit as editAppearance } from '@/routes/appearance';

export default function Appearance() {
    return (
        <>
            <Head title="Weergave-instellingen" />

            <h1 className="sr-only">Weergave-instellingen</h1>

            <div className="space-y-6">
                <Heading
                    variant="small"
                    title="Weergave-instellingen"
                    description="Werk de weergave-instellingen voor uw account bij"
                />
                <AppearanceTabs />
            </div>
        </>
    );
}

Appearance.layout = {
    breadcrumbs: [
        {
            title: 'Weergave-instellingen',
            href: editAppearance(),
        },
    ],
};
