import { Layout } from '@/Components/Layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import UpdateSettingsForm from './Partials/UpdateSettingsForm';

interface SystemSettings {
    id: number;
    system_name: string;
    system_image: string | null;
    system_image_url: string | null;
}

interface SettingsPageProps extends PageProps {
    mustVerifyEmail: boolean;
    status?: string;
    systemSettings: SystemSettings;
}

export default function Edit({
    mustVerifyEmail,
    status,
    systemSettings,
}: SettingsPageProps) {
    return (
        <Layout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Customize System
                </h2>
            }
        >
            <Head title="Customize System" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl space-y-6 sm:px-6 lg:px-8">
                    <div className="bg-white p-4 shadow sm:rounded-lg sm:p-8">
                        <UpdateSettingsForm
                            status={status}
                            className="max-w-xl"
                        />
                    </div>
                </div>
            </div>
        </Layout>
    );
}
