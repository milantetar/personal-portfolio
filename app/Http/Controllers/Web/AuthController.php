<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    // Show Inertia Login Page
    public function create(): Response
    {
        return Inertia::render('Auth/Login');
    }

    // Handle Web Login
    public function store(LoginData $data): RedirectResponse
    {
        $this->authService->attemptLogin($data);

        request()->session()->regenerate();

        return redirect()->intended(route('dashboard'));
    }

    // Handle Web Logout
    public function destroy(): RedirectResponse
    {
        $this->authService->logoutWeb();

        return redirect('/');
    }
}