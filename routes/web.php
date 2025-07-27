<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SystemSettingsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\Auth\AuthenticatedSessionController;
use App\Http\Controllers\ItemController;
use App\Http\Controllers\DashboardController;

Route::get('/', [AuthenticatedSessionController::class, 'create'])->name('login');

Route::get('/dashboard', [DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::post('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // System settings routes
    Route::get('/settings', [SystemSettingsController::class, 'edit'])->name('settings.edit');
    Route::post('/settings', [SystemSettingsController::class, 'update'])->name('settings.update');

    // Item routes
    Route::get('/add-item', [ItemController::class, 'addItem'])->name('add-item');
    Route::post('/items', [ItemController::class, 'store'])->name('items.store');
    Route::put('/items/{item}', [ItemController::class, 'update'])->name('items.update');
    Route::delete('/items/{item}', [ItemController::class, 'destroy'])->name('items.destroy');

    // Pull In routes
    Route::get('/pull-in', [ItemController::class, 'pullIn'])->name('pull-in');
    Route::post('/pull-in', [ItemController::class, 'storePullIn'])->name('items.pull-in');

    // Pull Out routes
    Route::get('/pull-out', [ItemController::class, 'pullOut'])->name('pull-out');
    Route::post('/pull-out', [ItemController::class, 'storePullOut'])->name('items.pull-out');

    // Sell Item routes
    Route::get('/sell-item', [ItemController::class, 'sellItem'])->name('sell-item');
    Route::post('/sell-item', [ItemController::class, 'storeSell'])->name('items.sell');
});

require __DIR__.'/auth.php';
