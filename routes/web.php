<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\Dashboard\DashboardController;
use App\Http\Controllers\Web\Dashboard\SidebarItemController;
use App\Http\Controllers\Web\Media\MediaController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\ContactController;
use App\Http\Controllers\Web\PortfolioAssistantController;
use App\Http\Controllers\Web\Dashboard\SiteSettingsController;
use App\Http\Controllers\Web\Dashboard\CertificateController;
use App\Http\Controllers\Web\Dashboard\PortfolioSectionController;
use App\Http\Controllers\Web\Dashboard\AnalyticsController;
use App\Http\Middleware\TrackPortfolioVisit;

// 1. PUBLIC ROUTE (Anyone can view your portfolio)
Route::get('/', [HomeController::class, 'index'])->middleware(TrackPortfolioVisit::class)->name('home');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::post('/portfolio-assistant', [PortfolioAssistantController::class, 'store'])
    ->middleware('throttle:portfolio-assistant')
    ->name('portfolio-assistant.store');

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
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        Route::get('/settings', [SiteSettingsController::class, 'index'])->name('site-settings.index');
        Route::put('/settings', [SiteSettingsController::class, 'update'])->name('site-settings.update');

        Route::post('/certificates/bulk-store', [CertificateController::class, 'bulkStore'])
            ->name('certificates.bulk-store');
        Route::delete('/certificates/bulk-destroy', [CertificateController::class, 'bulkDestroy'])
            ->name('certificates.bulk-destroy');
        Route::resource('certificates', CertificateController::class)->except(['show', 'create', 'edit']);
        Route::resource('sections', PortfolioSectionController::class)
            ->parameters(['sections' => 'portfolioSection'])
            ->except(['show', 'create', 'edit'])
            ->names('portfolio-sections');

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
        Route::post('/media/bulk-store', [MediaController::class, 'bulkStore'])
            ->name('media.bulk-store');
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
