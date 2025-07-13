import { Layout } from '@/Components/Layout';
import { PageProps } from '@/types';
import { Head } from '@inertiajs/react';
import { Settings2} from 'lucide-react';
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
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Customize System</h1>
            <p className="text-sm text-gray-600">Edit your System name and System Image</p>
          </div>
        </div>
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
