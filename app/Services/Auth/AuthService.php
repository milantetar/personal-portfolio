<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Data\Auth\LoginData;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function attemptLogin(LoginData $data): User
    {
        if (!Auth::attempt($data->only('email', 'password')->toArray())) {
            throw ValidationException::withMessages([
                'email' => __('auth.failed'),
            ]);
        }

        /** @var User $user */
        $user = Auth::user();

        return $user;
    }

    public function createApiToken(User $user): string
    {
        // Requires Laravel Sanctum installed via php artisan install:api
        return $user->createToken('api-token')->plainTextToken;
    }

    public function logoutWeb(): void
    {
        Auth::guard('web')->logout();
        request()->session()->invalidate();
        request()->session()->regenerateToken();
    }

    public function logoutApi(User $user): void
    {
        $token = $user->currentAccessToken();

        if ($token) {
            /** @var \Laravel\Sanctum\PersonalAccessToken $token */
            $token->delete();
        }
    }
}