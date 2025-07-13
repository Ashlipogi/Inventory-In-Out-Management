<?php

namespace App\Services;

use App\Models\SystemSettings;

class SystemSettingsService
{
    /**
     * Get system settings for global use.
     */
    public static function getGlobalSettings(): SystemSettings
    {
        return SystemSettings::getSettings();
    }

    /**
     * Get system name.
     */
    public static function getSystemName(): string
    {
        return self::getGlobalSettings()->system_name;
    }

    /**
     * Get system image URL.
     */
    public static function getSystemImageUrl(): ?string
    {
        return self::getGlobalSettings()->system_image_url;
    }
}
