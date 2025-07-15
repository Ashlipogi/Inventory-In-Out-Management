<?php

namespace App\Http\Controllers;

use App\Models\SystemSettings;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class SystemSettingsController extends Controller
{
    /**
     * Display the system settings form.
     */
    public function edit()
    {
        $settings = SystemSettings::getSettings();

        return Inertia::render('Settings/Edit', [
            'mustVerifyEmail' => false,
            'status' => session('status'),
            'systemSettings' => $settings,
        ]);
    }

    /**
     * Update the system settings.
     */
    public function update(Request $request)
    {
        $request->validate([
            'system_name' => 'required|string|max:255',
            'system_image' => 'nullable|image|mimes:png,jpg,jpeg,gif|max:2048',
        ]);

        $settings = SystemSettings::getSettings();
        $data = ['system_name' => $request->system_name];

        // Handle image upload
        if ($request->hasFile('system_image')) {
            // Delete old image if exists
            if ($settings->system_image) {
                $oldImagePath = public_path('imgs/system_image/' . $settings->system_image);
                if (file_exists($oldImagePath)) {
                    unlink($oldImagePath);
                }
            }

            // Create directory if it doesn't exist
            $uploadDir = public_path('imgs/system_image');
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0755, true);
            }

            // Store new image
            $file = $request->file('system_image');
            $fileName = time() . '_' . $file->getClientOriginalName();
            $file->move($uploadDir, $fileName);

            $data['system_image'] = $fileName;
        }

        // Update settings
        SystemSettings::updateSettings($data);

        return redirect()->route('settings.edit')->with('success', 'System settings updated successfully!');
    }
}
