<?php

declare(strict_types=1);

use App\Http\Controllers\Web\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::get('/login ', [AuthController::class, 'login']);
});

Route::middleware('auth')->group(function (): void {
    Route::get('/logout ', [AuthController::class, 'logout']);
});


