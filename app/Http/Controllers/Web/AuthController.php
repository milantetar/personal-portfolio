<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\ValidationException;
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
        return Inertia::render('auth/login');
    }

    // Handle Web Login
    public function store(LoginData $data): RedirectResponse
    {
        try {
            $this->authService->attemptLogin($data);

            request()->session()->regenerate();

            return redirect()->intended(route('dashboard'));
        } catch (ValidationException $e) {
            // Re-throw validation errors so Inertia/Blade catches form errors correctly
            throw $e;
        } catch (Exception $e) {
            return back()->withErrors([
                'email' => 'An unexpected error occurred during login. Please try again.',
            ]);
        }
    }

    // Handle Web Logout
    public function destroy(): RedirectResponse
    {
        try {
            $this->authService->logoutWeb();

            return redirect('/');
        } catch (Exception $e) {
            return back()->with('error', 'Failed to log out.');
        }
    }
}