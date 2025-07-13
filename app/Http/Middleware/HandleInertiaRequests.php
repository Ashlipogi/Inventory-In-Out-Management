<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Services\SystemSettingsService;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'auth' => [
                'user' => fn () => $request->user()
                    ? [
                        'id' => $request->user()->id,
                        'name' => $request->user()->name,
                        'email' => $request->user()->email,
                        'profile_picture_url' => $request->user()->profile_picture
                            ? asset($request->user()->profile_picture)
                            : null,
                    ]
                    : null,
            ],
            'systemSettings' => fn () => $this->getSystemSettings(),
        ];
    }

    /**
     * Get system settings for sharing.
     */
    private function getSystemSettings(): array
    {
        try {
            $settings = SystemSettingsService::getGlobalSettings();
            return [
                'id' => $settings->id,
                'system_name' => $settings->system_name,
                'system_image' => $settings->system_image,
                'system_image_url' => $settings->system_image_url,
                'created_at' => $settings->created_at,
                'updated_at' => $settings->updated_at,
            ];
        } catch (\Exception $e) {
            // Log the error for debugging
            \Log::error('SystemSettings error in HandleInertiaRequests: ' . $e->getMessage());

            // Return default settings if database is not available
            return [
                'id' => 1,
                'system_name' => 'System',
                'system_image' => null,
                'system_image_url' => null,
                'created_at' => now()->toISOString(),
                'updated_at' => now()->toISOString(),
            ];
        }
    }
}
