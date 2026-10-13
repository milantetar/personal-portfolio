<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Services\Auth\AuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService) {}

    public function store(LoginData $data): JsonResponse
    {
        // 1. Service handles authentication logic & throws validation exceptions if it fails
        $user = $this->authService->attemptLogin($data);
        $token = $this->authService->createApiToken($user);

        // 2. Base controller response helper keeps JSON output standardized
        return $this->successResponse('Login successful', [
            'token' => $token,
            'user' => $user,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();
        
        $this->authService->logoutApi($user);

        return $this->successResponse('Logged out successfully');
    }
}