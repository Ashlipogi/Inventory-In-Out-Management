import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { systemSettings } = usePage().props as any;

    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-100 pt-6 sm:justify-center sm:pt-0">
            <div className="flex flex-col items-center">
                <Link href="/">
                    <ApplicationLogo
                        systemSettings={systemSettings}
                        className="h-20 w-20 fill-current text-gray-500"
                        width="80px"
                        height="80px"
                    />
                </Link>
                {systemSettings?.system_name && (
                    <h1 className="mt-3 text-xl font-semibold text-gray-700 text-center">
                        {systemSettings.system_name}
                    </h1>
                )}
            </div>

            <div className="mt-6 w-full overflow-hidden bg-white px-6 py-4 shadow-md sm:max-w-md sm:rounded-lg">
                {children}
            </div>
        </div>
    );
}
