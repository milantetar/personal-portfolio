<?php

declare(strict_types=1);

use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\BlogController;
use App\Http\Controllers\Web\ContactController;
use App\Http\Controllers\Web\Dashboard\AnalyticsController;
use App\Http\Controllers\Web\Dashboard\CertificateController;
use App\Http\Controllers\Web\Dashboard\ContactMessageController;
use App\Http\Controllers\Web\Dashboard\DashboardController;
use App\Http\Controllers\Web\Dashboard\NavigationController;
use App\Http\Controllers\Web\Dashboard\PortfolioAssistantLogController;
use App\Http\Controllers\Web\Dashboard\PortfolioSectionController;
use App\Http\Controllers\Web\Dashboard\PostController;
use App\Http\Controllers\Web\Dashboard\ProjectController;
use App\Http\Controllers\Web\Dashboard\SidebarItemController;
use App\Http\Controllers\Web\Dashboard\SiteSettingsController;
use App\Http\Controllers\Web\HomeController;
use App\Http\Controllers\Web\Media\MediaController;
use App\Http\Controllers\Web\PortfolioAssistantController;
use App\Http\Controllers\Web\SitemapController;
use App\Http\Middleware\TrackPortfolioVisit;
use Illuminate\Support\Facades\Route;

// 1. PUBLIC ROUTES (Portfolio, Blog, Contact, Assistant)
Route::get('/', [HomeController::class, 'index'])->middleware(TrackPortfolioVisit::class)->name('home');
Route::post('/contact', [ContactController::class, 'store'])->middleware('throttle:5,1')->name('contact.store');
Route::post('/portfolio-assistant', [PortfolioAssistantController::class, 'store'])
    ->middleware('throttle:portfolio-assistant')
    ->name('portfolio-assistant.store');
Route::get('/assistant', [HomeController::class, 'section'])->defaults('slug', 'assistant')->middleware(TrackPortfolioVisit::class)->name('portfolio.assistant');

// Public Blog
Route::get('/blog', [BlogController::class, 'index'])->middleware(TrackPortfolioVisit::class)->name('blog.index');
Route::get('/blog/{slug}', [BlogController::class, 'show'])->middleware(TrackPortfolioVisit::class)->name('blog.show');

// Search engine discovery
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');
Route::get('/robots.txt', [SitemapController::class, 'robots'])->name('robots');

// 2. GUEST ROUTES
Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store'])->middleware('throttle:login');

    Route::get('forgot-password', [AuthController::class, 'showForgotPassword'])->name('password.request');
    Route::post('forgot-password', [AuthController::class, 'sendResetLink'])
        ->middleware('throttle:6,1')
        ->name('password.email');
    Route::get('reset-password/{token}', [AuthController::class, 'showResetPassword'])->name('password.reset');
    Route::post('reset-password', [AuthController::class, 'resetPassword'])
        ->middleware('throttle:6,1')
        ->name('password.store');
});

// 3. PROTECTED ADMIN ROUTES
Route::middleware('auth')->group(function (): void {

    Route::put('password', [AuthController::class, 'updatePassword'])->name('password.update');

    Route::prefix('dashboard')->middleware('admin')->group(function (): void {

        // Dashboard Home & Analytics
        Route::get('/', [DashboardController::class, 'index'])->name('dashboard');
        Route::get('/analytics', [AnalyticsController::class, 'index'])->name('analytics.index');

        // Messages & Leads Inbox
        Route::get('/messages', [ContactMessageController::class, 'index'])->name('messages.index');
        Route::post('/messages/bulk-destroy', [ContactMessageController::class, 'bulkDestroy'])->name('messages.bulk-destroy');
        Route::put('/messages/{message}', [ContactMessageController::class, 'update'])->name('messages.update');
        Route::delete('/messages/{message}', [ContactMessageController::class, 'destroy'])->name('messages.destroy');
        Route::match(['post', 'put'], '/messages/bulk-read', [ContactMessageController::class, 'bulkMarkRead'])->name('messages.bulk-read');
        Route::match(['post', 'put'], '/messages/bulk-mark-read', [ContactMessageController::class, 'bulkMarkRead'])->name('messages.bulk-mark-read');

        // Custom Projects & Case Studies
        Route::resource('projects', ProjectController::class)->except(['show', 'create', 'edit']);

        // Technical Articles / Blog Engine
        Route::resource('posts', PostController::class)->except(['show', 'create', 'edit']);

        // AI Assistant Recruiter Insights
        Route::get('/assistant-logs', [PortfolioAssistantLogController::class, 'index'])->name('assistant-logs.index');
        Route::post('/assistant-logs/clear-all', [PortfolioAssistantLogController::class, 'clearAll'])->name('assistant-logs.clear-all');
        Route::delete('/assistant-logs/{log}', [PortfolioAssistantLogController::class, 'destroy'])->name('assistant-logs.destroy');

        // Configuration & Content
        Route::get('/settings', [SiteSettingsController::class, 'index'])->name('site-settings.index');
        Route::put('/settings', [SiteSettingsController::class, 'update'])->name('site-settings.update');

        Route::get('/navigation', [NavigationController::class, 'index'])->name('navigation.index');
        Route::post('/navigation/items', [NavigationController::class, 'store'])->name('navigation.items.store');
        Route::put('/navigation/{navbar}/brand', [NavigationController::class, 'updateBrand'])->name('navigation.brand.update');
        Route::put('/navigation/reorder', [NavigationController::class, 'reorder'])->name('navigation.reorder');
        Route::put('/navigation/items/{navbarItem}', [NavigationController::class, 'update'])->name('navigation.items.update');
        Route::delete('/navigation/items/{navbarItem}', [NavigationController::class, 'destroy'])->name('navigation.items.destroy');

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

Route::get('/{slug}', [HomeController::class, 'section'])
    ->where('slug', '[a-z0-9-]+')
    ->middleware(TrackPortfolioVisit::class)
    ->name('portfolio.section');
