<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SystemSettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ItemController;

Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('login');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // System settings routes
    Route::get('/settings', [SystemSettingsController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [SystemSettingsController::class, 'update'])->name('settings.update');

  Route::get('/add-item', [ItemController::class, 'addItem'])->name('add-item');
    Route::get('/pull-in', [ItemController::class, 'pullIn'])->name('pull-in');
    Route::get('/pull-out', [ItemController::class, 'pullOut'])->name('pull-out');
});

require __DIR__.'/auth.php';
