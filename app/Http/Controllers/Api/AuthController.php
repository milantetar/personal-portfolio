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
use Throwable;

class AuthController extends Controller
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function getUserById(int $id): JsonResponse
    {
        Log::info('API get user started.', ['user_id' => $id]);
        try {
            $user = User::find($id);

            if(!$user){
                Log::warning('API user not found.', ['user_id' => $id]);
                return $this->notFoundResponse('No users found.');
            }

            Log::info('API user retrieved.', ['user_id' => $id]);

            return $this->successResponse(
                message: 'User retrieved successfully',
                data: UserResource::make($user)
            );
        } catch (Throwable $exception) {
            Log::error('API get user failed.', ['user_id' => $id, 'exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }

    public function getAllUsers(): JsonResponse
    {
        Log::info('API get users started.');
        try {
            $users = User::paginate(10);

            if ($users->isEmpty()) {
                Log::warning('API users list is empty.');
                return $this->notFoundResponse('No users found.');
            }

            Log::info('API users retrieved.', ['count' => $users->count(), 'total' => $users->total()]);

            return $this->successResponse(
                message: 'Users retrieved successfully',
                data: UserResource::collection($users)
            );
        } catch (Throwable $exception) {
            Log::error('API get users failed.', ['exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }

    public function login(LoginData $data): JsonResponse
    {
        Log::info('API login attempt started.');
        try {
            $user = $this->authService->attemptLogin($data);
            $token = $this->authService->createApiToken($user);

            Log::info('API login succeeded.', ['user_id' => $user->id]);

            return $this->successResponse(
                message: 'Login successful',
                data: [
                    'token' => $token,
                    'user' => UserResource::make($user),
                ]
            );
        } catch (ValidationException $e) {
            Log::warning('API login validation failed.', ['errors' => $e->errors()]);
            return $this->validationErrorResponse('Validation failed', $e->errors());
        } catch (Throwable $exception) {
            Log::error('API login failed.', ['exception' => $exception]);

            return $this->serverErrorResponse('Authentication service unavailable.');
        }
    }

    public function logout(Request $request): JsonResponse
    {
        Log::info('API logout started.', ['user_id' => $request->user()?->id]);
        try {
            /** @var User|null $user */
            $user = $request->user();

            if (! $user) {
                Log::warning('API logout rejected because user is unauthenticated.');
                return $this->unauthorizedResponse('Unauthenticated session.');
            }

            $this->authService->logoutApi($user);

            Log::info('API logout succeeded.', ['user_id' => $user->id]);

            return $this->successResponse('Logged out successfully');
        } catch (Throwable $exception) {
            Log::error('API logout failed.', ['user_id' => $request->user()?->id, 'exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred during logout.');
        }
    }
}
