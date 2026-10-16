<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController;
use App\Http\Controllers\Web\Dashboard\DashboardController;

// 1. PUBLIC ROUTE (Anyone can view your portfolio)
Route::inertia('/', 'welcome')->name('home');

// 2. GUEST ROUTES (Only for visitors who are NOT logged in)
Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store']);
});

// 3. PROTECTED ADMIN ROUTES (Requires login to access the dashboard)
Route::middleware('auth')->group(function (): void {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
});