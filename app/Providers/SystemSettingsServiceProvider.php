<?php

namespace App\Providers;

use App\Services\SystemSettingsService;
use Illuminate\Support\ServiceProvider;
use Inertia\Inertia;

class SystemSettingsServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        // Share system settings globally with Inertia
        Inertia::share('systemSettings', function () {
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
                \Log::error('SystemSettings error: ' . $e->getMessage());

                // Return default settings if database is not available
                return [
                    'id' => 1,
                    'system_name' => 'System',
                    'system_image' => null,
                    'system_image_url' => null,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            }
        });
    }
}
