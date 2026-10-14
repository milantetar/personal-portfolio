<?php

declare(strict_types=1);

use App\Http\Controllers\Api\AuthController;
use Illuminate\Support\Facades\Route;

Route::middleware('guest')->group(function (): void {
    Route::post('/login', [AuthController::class, 'login']);
});

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/users/{id}', [AuthController::class, 'getUserById'])->where('id', '[0-9]+');
    Route::get('/users', [AuthController::class, 'getAllUsers']);
    Route::post('/logout', [AuthController::class, 'logout']);
});