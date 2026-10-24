<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Inertia\Response;
use Exception;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService)
    {
    }

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
            // Re-throw validation errors so Inertia/Blade catches form errors correctly
            throw $e;
        } catch (Exception $e) {
            Log::error('Web login failed.', ['exception' => $e]);
            return back()->withErrors([
                'email' => 'An unexpected error occurred during login. Please try again.',
            ]);
        }
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
