<?php

namespace App\Traits\Auth;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\ResourceCollection;

trait ApiResponse
{
    /**
     * Return a standardized success payload.
     *
     * @param  array<string, mixed>  $meta
     */
    protected function success(
        string $message = 'Success',
        mixed $data = null,
        int $statusCode = 200,
        array $meta = []
    ): JsonResponse {
        if ($data instanceof ResourceCollection && $data->resource instanceof LengthAwarePaginator) {
            $paginator = $data->resource;
            $meta = [...$meta, 'pagination' => [
                'current_page' => $paginator->currentPage(), 'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(), 'total' => $paginator->total(),
                'next_page_url' => $paginator->nextPageUrl(), 'prev_page_url' => $paginator->previousPageUrl(),
            ]];
            $data = $data->resolve();
        }
        $payload = [
            'success' => true,
            'message' => $message,
            'data' => $data,
        ];

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $statusCode);
    }

    /**
     * Return a standardized error payload.
     *
     * @param  array<string, mixed>  $meta
     */
    protected function error(
        string $message = 'Something went wrong',
        int $statusCode = 500,
        mixed $errors = null,
        array $meta = []
    ): JsonResponse {
        $payload = [
            'success' => false,
            'message' => $message,
        ];

        if ($errors !== null) {
            $payload['errors'] = $errors;
        }

        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $statusCode);
    }
}
