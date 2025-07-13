import { PageProps as InertiaPageProps } from '@inertiajs/core';

export interface User {
    id: number;
    name: string;
    email: string;
    email_verified_at?: string;
    profile_picture?: string;
    profile_picture_url?: string;
}

export interface SystemSettings {
    id: number;
    system_name: string;
    system_image: string | null;
    system_image_url: string | null;
}

export type PageProps<T extends Record<string, unknown> = Record<string, unknown>> = InertiaPageProps & T & {
    auth: {
        user: User;
    };
    systemSettings?: SystemSettings;
};
