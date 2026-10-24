<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\Dashboard\DashboardController;
use App\Http\Controllers\Web\Dashboard\SidebarItemController;
use App\Http\Controllers\Web\Media\MediaController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\Dashboard\SiteSettingsController;
use App\Http\Controllers\Web\Dashboard\CertificateController;

// 1. PUBLIC ROUTE (Anyone can view your portfolio)
Route::get('/', [HomeController::class, 'index'])->name('home');

// 2. GUEST ROUTES (Only for visitors who are NOT logged in)
Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store']);
});

// 3. PROTECTED ADMIN ROUTES (Requires login to access the dashboard)
Route::middleware('auth')->group(function (): void {

    Route::prefix('dashboard')->group(function (): void {

        // Dashboard Home
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

        Route::get('/settings', [SiteSettingsController::class, 'index'])->name('site-settings.index');
        Route::put('/settings', [SiteSettingsController::class, 'update'])->name('site-settings.update');

        Route::resource('certificates', CertificateController::class)->except(['show', 'create', 'edit']);

        // Sidebar Items CRUD Routes
        Route::post('/sidebar-items', [SidebarItemController::class, 'store'])
            ->name('sidebar-items.store');
        Route::put('/sidebar-items/{sidebarItem}', [SidebarItemController::class, 'update'])
            ->name('sidebar-items.update');
        Route::delete('/sidebar-items/{sidebarItem}', [SidebarItemController::class, 'destroy'])
            ->name('sidebar-items.destroy');
        
        // Media Library CRUD & Polymorphic Slot Routes
        Route::get('/media', [MediaController::class, 'index'])
            ->name('media.index');
        Route::post('/media', [MediaController::class, 'store'])
            ->name('media.store');
        Route::put('/media/{media}', [MediaController::class, 'update'])
            ->name('media.update');
        Route::delete('/media/{media}', [MediaController::class, 'destroy'])
            ->name('media.destroy');
        Route::post('/media/bulk-destroy', [MediaController::class, 'bulkDestroy'])
            ->name('media.bulk-destroy');
        Route::post('/media/{media}/assign-slot', [MediaController::class, 'assignSlot'])
            ->name('media.assign-slot');
        Route::post('/media/clear-slot', [MediaController::class, 'clearSlot'])
            ->name('media.clear-slot');
        Route::post('/branding/settings', [MediaController::class, 'updateBrandingSettings'])
            ->name('branding.update');
        
    });
    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
});
