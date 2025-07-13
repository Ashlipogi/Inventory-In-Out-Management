import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Transition } from '@headlessui/react';
import { useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useState } from 'react';
import { PageProps, SystemSettings } from '@/types';

interface SettingsPageProps extends PageProps {
    systemSettings: SystemSettings;
}

export default function UpdateSettingsForm({
    status,
    className = '',
}: {
    status?: string;
    className?: string;
}) {
    const { systemSettings } = usePage<SettingsPageProps>().props;
    const [previewUrl, setPreviewUrl] = useState<string | null>(
        systemSettings?.system_image_url || null
    );

    const { data, setData, post, progress, errors, processing, recentlySuccessful } = useForm({
        system_name: systemSettings?.system_name || '',
        system_image: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('system_image', file);

        if (file) {
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        } else {
            setPreviewUrl(systemSettings?.system_image_url || null);
        }
    };

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('settings.update'), {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                if (previewUrl && previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                }
                // Reset to the updated system image URL
                setPreviewUrl(systemSettings?.system_image_url || null);
            },
            onError: () => {
                if (previewUrl && previewUrl.startsWith('blob:')) {
                    URL.revokeObjectURL(previewUrl);
                }
                setPreviewUrl(systemSettings?.system_image_url || null);
            }
        });
    };

    return (
        <section className={className}>
            <header>
                <h2 className="text-lg font-medium text-gray-900">
                    Customize System
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                    Change the system name and image shown throughout the app.
                </p>
            </header>

            <form onSubmit={submit} className="mt-6 space-y-6">
                <div>
                    <InputLabel htmlFor="system_name" value="System Name" />
                    <TextInput
                        id="system_name"
                        className="mt-1 block w-full"
                        value={data.system_name}
                        onChange={(e) => setData('system_name', e.target.value)}
                        required
                        autoComplete="off"
                    />
                    <InputError className="mt-2" message={errors.system_name} />
                </div>

                <div>
                    <InputLabel htmlFor="system_image" value="System Image" />

                    {previewUrl && (
                        <div className="mt-2 mb-4">
                            <img
                                src={previewUrl}
                                alt="System preview"
                                className="h-20 w-20 rounded object-cover border-2 border-gray-300"
                                onError={() => setPreviewUrl(null)}
                            />
                        </div>
                    )}

                    <input
                        id="system_image"
                        type="file"
                        className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100"
                        onChange={handleFileChange}
                        accept="image/png,image/jpg,image/jpeg,image/gif"
                    />

                    <p className="mt-1 text-xs text-gray-500">
                        PNG, JPG, GIF up to 2MB
                    </p>

                    <InputError className="mt-2" message={errors.system_image} />

                    {progress && (
                        <div className="mt-2">
                            <div className="bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${progress.percentage}%` }}
                                ></div>
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                                Uploading... {progress.percentage}%
                            </p>
                        </div>
                    )}
                </div>

                <div className="flex items-center gap-4">
                    <PrimaryButton disabled={processing}>
                        {processing ? 'Saving...' : 'Save'}
                    </PrimaryButton>

                    <Transition
                        show={recentlySuccessful}
                        enter="transition ease-in-out"
                        enterFrom="opacity-0"
                        leave="transition ease-in-out"
                        leaveTo="opacity-0"
                    >
                        <p className="text-sm text-gray-600">Saved.</p>
                    </Transition>
                </div>
            </form>
        </section>
    );
}
