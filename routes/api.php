<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Dashboard\SidebarItemController;
use App\Http\Controllers\Api\Media\MediaController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:login');
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/users/{id}', [AuthController::class, 'getUserById'])->where('id', '[0-9]+')->middleware('admin');
    Route::get('/users', [AuthController::class, 'getAllUsers'])->middleware('admin');
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::name('api.')->prefix('dashboard')->middleware('admin')->group(function (): void {
        Route::apiResource('sidebar-items', SidebarItemController::class);
        Route::apiResource('media', MediaController::class);
    });

});
