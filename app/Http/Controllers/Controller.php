<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Traits\Auth\ApiResponse;
use Illuminate\Http\JsonResponse;

abstract class Controller
{
    use ApiResponse;

    /** @param array<string, mixed> $meta */
    protected function successResponse(
        string $message = 'Success',
        mixed $data = null,
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        return $this->success($message, $data, $statusCode, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function createdResponse(
        string $message = 'Created successfully',
        mixed $data = null,
        array $meta = []
    ): JsonResponse {
        return $this->success($message, $data, 201, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function errorResponse(
        string $message = 'Something went wrong',
        int $statusCode = 500,
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, $statusCode, $errors, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function badRequestResponse(
        string $message = 'Bad request',
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, 400, $errors, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function unauthorizedResponse(
        string $message = 'Unauthenticated',
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, 401, $errors, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function forbiddenResponse(
        string $message = 'Forbidden',
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, 403, $errors, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function notFoundResponse(
        string $message = 'Resource not found',
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, 404, $errors, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function conflictResponse(
        string $message = 'Conflict',
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, 409, $errors, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function validationErrorResponse(
        string $message = 'Validation failed',
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, 422, $errors, $meta);
    }

    /** @param array<string, mixed> $meta */
    protected function serverErrorResponse(
        string $message = 'Internal server error',
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        return $this->error($message, 500, $errors, $meta);
    }
}
