<?php

declare(strict_types=1);

namespace App\Services\Auth;

use App\Data\Auth\LoginData;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

class AuthService
{
    public function attemptLogin(LoginData $data): User
    {
        $emailHash = hash('sha256', strtolower(trim($data->email)));
        $user = User::where('email_hash', $emailHash)->first();

        // Return the exact same error on 'email' whether the account is missing or the password is wrong
        if (! $user || ! Hash::check($data->password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => [__('auth.failed')],
            ]);
        }

        // Log the already-verified user in directly without a duplicate email lookup
        Auth::guard('web')->login($user, $data->remember);

        return $user;
    }

    public function createApiToken(User $user): string
    {
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
        optional($user->currentAccessToken())->delete();
    }
}
