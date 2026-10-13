<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Web\AuthController;


Route::middleware('guest')->group(function (): void {
    Route::get('login', [AuthController::class, 'create'])->name('login');
    Route::post('login', [AuthController::class, 'store']);
});

Route::middleware('auth')->group(function (): void {
    Route::inertia('/', 'welcome')->name('home');
    Route::post('logout', [AuthController::class, 'destroy'])->name('logout');
});