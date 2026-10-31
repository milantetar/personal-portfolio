<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\AuthService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Password;
use Illuminate\Support\Str;
use Illuminate\Validation\Rules\Password as PasswordRule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    // Show Inertia Login Page
    public function create(): Response
    {
        Log::info('Web auth login page requested.');

        return Inertia::render('auth/login');
    }

    // Handle Web Login
    public function store(LoginData $data): RedirectResponse
    {
        Log::info('Web login attempt started.');

        try {
            $user = $this->authService->attemptLogin($data);

            request()->session()->regenerate();

            Log::info('Web login succeeded.', [
                'user_id' => $user->id,
            ]);

            return redirect()->intended(route('dashboard'));
        } catch (ValidationException $e) {
            Log::warning('Web login validation failed.', ['errors' => $e->errors()]);
            throw $e;
        } catch (Exception $e) {
            Log::error('Web login failed.', ['exception' => $e]);

            return back()->withErrors([
                'email' => 'An unexpected error occurred during login. Please try again.',
            ]);
        }
    }

    public function showForgotPassword(): Response
    {
        return Inertia::render('auth/forgot-password');
    }

    public function sendResetLink(Request $request): RedirectResponse
    {
        $request->validate([
            'email' => ['required', 'string', 'email'],
        ]);

        $status = Password::sendResetLink($request->only('email'));

        if ($status === Password::RESET_LINK_SENT) {
            Log::info('Password reset link requested.');

            return back()->with('success', __($status));
        }

        return back()->withErrors(['email' => __($status)]);
    }

    public function showResetPassword(Request $request, string $token): Response
    {
        return Inertia::render('auth/reset-password', [
            'token' => $token,
            'email' => (string) $request->query('email', ''),
        ]);
    }

    public function resetPassword(Request $request): RedirectResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'string', 'email'],
            'password' => ['required', 'string', 'confirmed', PasswordRule::defaults()],
        ]);

        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->forceFill([
                    'password' => $password,
                    'remember_token' => Str::random(60),
                ])->save();
            },
        );

        if ($status === Password::PASSWORD_RESET) {
            Log::info('Password reset completed.');

            return to_route('login')->with('success', __($status));
        }

        return back()->withErrors(['email' => __($status)]);
    }

    public function updatePassword(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string', 'current_password'],
            'password' => ['required', 'string', 'confirmed', PasswordRule::defaults()],
        ]);

        $request->user()?->update(['password' => $validated['password']]);

        Log::info('Password changed.', ['user_id' => $request->user()?->id]);

        return back()->with('success', 'Password updated successfully.');
    }

    // Handle Web Logout
    public function destroy(): RedirectResponse
    {
        Log::info('Web logout started.', ['user_id' => auth()->id()]);

        try {
            $this->authService->logoutWeb();

            Log::info('Web logout succeeded.');

            return redirect('/');
        } catch (Exception $e) {
            Log::error('Web logout failed.', ['exception' => $e]);

            return back()->with('error', 'Failed to log out.');
        }
    }
}
