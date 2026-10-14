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
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Exception;

class AuthController extends Controller
{
    public function __construct(protected AuthService $authService)
    {
    }

    public function getUserById(int $id): JsonResponse
    {
        try {
            $user = User::findOrFail($id);

            return $this->successResponse('User retrieved successfully', UserResource::make($user));
        } catch (ModelNotFoundException $e) {
            return response()->json([
                'message' => 'User not found.',
            ], 404);
        } catch (Exception $e) {
            return response()->json([
                'message' => 'An error occurred while retrieving the user.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function getAllUsers(): JsonResponse
    {
        try {
            $users = User::paginate(10);

            return $this->successResponse(
                'Users retrieved successfully',
                UserResource::collection($users)
            );
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Failed to retrieve users.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function login(LoginData $data): JsonResponse
    {
        try {
            // AuthService handles validation exceptions if credentials fail
            $user = $this->authService->attemptLogin($data);
            $token = $this->authService->createApiToken($user);

            return $this->successResponse('Login successful', [
                'token' => $token,
                'user' => UserResource::make($user), // Wrapped in resource for consistency
            ]);
        } catch (\Illuminate\Validation\ValidationException $e) {
            // Let validation exceptions bubble up so Laravel returns standard 422 format
            throw $e;
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Login failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    public function logout(Request $request): JsonResponse
    {
        try {
            /** @var User $user */
            $user = $request->user();

            $this->authService->logoutApi($user);

            return $this->successResponse('Logged out successfully');
        } catch (Exception $e) {
            return response()->json([
                'message' => 'Logout failed.',
                'error' => $e->getMessage(),
            ], 500);
        }
    }
}