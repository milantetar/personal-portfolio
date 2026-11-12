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
        // 1. Hash the incoming email to match the database's email_hash lookup
        $emailHash = hash('sha256', strtolower(trim($data->email)));
        $user = User::where('email_hash', $emailHash)->first();

        if (! $user) {
            throw ValidationException::withMessages([
                'email' => ["No account was found registered with the email address '{$data->email}'."],
            ]);
        }

        // 2. Check if the password is correct for this user
        if (! Hash::check($data->password, $user->password)) {
            throw ValidationException::withMessages([
                'password' => ['The password you entered is incorrect. Please check your spelling and try again.'],
            ]);
        }

        // 3. Perform the actual authentication login session using plain email for Auth::attempt
        if (! Auth::attempt(['email' => $data->email, 'password' => $data->password], $data->remember)) {
            throw ValidationException::withMessages([
                'email' => ['Authentication failed due to an unexpected session or guard restriction.'],
            ]);
        }

        /** @var User $authenticatedUser */
        $authenticatedUser = Auth::user();

        return $authenticatedUser;
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