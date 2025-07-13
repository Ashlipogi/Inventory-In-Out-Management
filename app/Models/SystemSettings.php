<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SystemSettings extends Model
{
    use HasFactory;

    protected $fillable = [
        'system_name',
        'system_image',
    ];

    protected $appends = [
        'system_image_url',
    ];

    /**
     * Get the system image URL attribute.
     */
    public function getSystemImageUrlAttribute(): ?string
    {
        if ($this->system_image) {
            return asset('imgs/system_image/' . $this->system_image);
        }
        return null;
    }

    /**
     * Get system settings (create if not exists).
     */
    public static function getSettings(): SystemSettings
    {
        $settings = static::first();

        if (!$settings) {
            $settings = static::create([
                'system_name' => 'System',
                'system_image' => null,
            ]);
        }

        return $settings;
    }

    /**
     * Update system settings.
     */
    public static function updateSettings(array $data): bool
    {
        $settings = static::getSettings();
        return $settings->update($data);
    }
}
