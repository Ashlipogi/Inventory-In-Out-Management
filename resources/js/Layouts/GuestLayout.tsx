import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link, usePage } from '@inertiajs/react';
import { PropsWithChildren } from 'react';

export default function Guest({ children }: PropsWithChildren) {
    const { systemSettings,systemName } = usePage().props as any;

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
            <div className="flex w-full max-w-4xl overflow-hidden rounded-lg bg-white shadow-lg">
                {/* Left Column */}
                <div className="flex w-1/2 flex-col items-center justify-center bg-gray-200 p-8">
                    <Link href="/">
                        <ApplicationLogo
                            systemSettings={systemSettings}
                            className="h-20 w-20 fill-current text-gray-500"
                        />
                    </Link>
                    <h2 className="mt-6 text-2xl font-bold text-gray-700 text-center">
                        {systemSettings?.system_name || ''}
                    </h2>
                </div>

                {/* Right Column */}
                <div className="w-1/2 p-8">
                    {children}
                </div>
            </div>
        </div>
    );
}
