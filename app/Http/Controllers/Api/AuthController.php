<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api;

use App\Data\Auth\LoginData;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\Auth\AuthService;
use App\Http\Resources\User\UserResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Exception;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function getUserById(int $id): JsonResponse
    {
        try {
            $user = User::find($id);

            if(!$user){
                return $this->notFoundResponse('No users found.');
            }

            return $this->successResponse(
                message: 'User retrieved successfully',
                data: UserResource::make($user)
            );
        } catch (Exception $e) {
            // Log the actual error internally for debugging, but keep client response generic
            Log::error('Get user by ID failed: ' . $e->getMessage());

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }

    public function getAllUsers(): JsonResponse
    {
        try {
            $users = User::paginate(10);

            if ($users->isEmpty()) {
                return $this->notFoundResponse('No users found.');
            }

            return $this->successResponse(
                message: 'Users retrieved successfully',
                data: UserResource::collection($users)
            );
        } catch (Exception $e) {
            Log::error('Get all users failed: ' . $e->getMessage());

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }

    public function login(LoginData $data): JsonResponse
    {
        try {
            $user = $this->authService->attemptLogin($data);
            $token = $this->authService->createApiToken($user);

            return $this->successResponse(
                message: 'Login successful',
                data: [
                    'token' => $token,
                    'user' => UserResource::make($user),
                ]
            );
        } catch (ValidationException $e) {
            return $this->validationErrorResponse('Validation failed', $e->errors());
        } catch (Exception $e) {
            Log::error('Login attempt failed: ' . $e->getMessage());

            return $this->serverErrorResponse('Authentication service unavailable.');
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            /** @var User|null $user */
            $user = $request->user();

            if (! $user) {
                return $this->unauthorizedResponse('Unauthenticated session.');
            }

            $this->authService->logoutApi($user);

            return $this->successResponse('Logged out successfully');
        } catch (Exception $e) {
            Log::error('Logout failed: ' . $e->getMessage());

            return $this->serverErrorResponse('An internal error occurred during logout.');
        }
    }
}