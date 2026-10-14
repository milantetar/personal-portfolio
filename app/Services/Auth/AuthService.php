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
        // 1. Hash the incoming login email the exact same way the model does
        $emailHash = hash('sha256', strtolower(trim($data->email)));

        // 2. Query the database using the hash column
        /** @var User|null $user */
        $user = User::where('email_hash', $emailHash)->first();

        // 3. If no user matches the hash, the email is incorrect
        if (!$user) {
            throw ValidationException::withMessages([
                'email' => ['The provided email does not exist.'],
            ]);
        }

        // 4. Compare the plain-text password against the user's hashed password
        if (!Hash::check($data->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => [__('The password is incorrect.')],
            ]);
        }

        // 5. Authenticate the user session
        Auth::login($user);

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