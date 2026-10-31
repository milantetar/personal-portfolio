<?php

namespace App\Http\Controllers\Api\Media;

use App\Data\Media\MediaData;
use App\Data\Media\MediaUpdateData;
use App\Http\Controllers\Controller;
use App\Http\Resources\Media\MediaResource;
use App\Models\Media;
use App\Repositories\Media\MediaRepository;
use App\Services\Media\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class MediaController extends Controller
{
    public function __construct(
        protected MediaService $mediaService,
        protected MediaRepository $mediaRepository
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Log::info('API media index started.');
        try {
            $mediaFiles = $this->mediaRepository->getAllMedia();

            if ($mediaFiles->isEmpty()) {
                Log::warning('API media list is empty.');

                return $this->notFoundResponse('No media files found.');
            }

            Log::info('API media retrieved.', ['count' => $mediaFiles->total()]);

            return $this->successResponse(
                message: 'Media files retrieved successfully',
                data: MediaResource::collection($mediaFiles)
            );
        } catch (Throwable $exception) {
            Log::error('Get all media files failed.', ['exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(MediaData $data): JsonResponse
    {
        Log::info('API media creation started.');
        try {
            $media = $this->mediaService->createMedia($data);

            Log::info('API media created.', ['media_id' => $media->id, 'mime_type' => $media->mime_type, 'size' => $media->size]);

            return $this->successResponse(
                message: 'Media created successfully',
                data: MediaResource::make($media)
            );
        } catch (Throwable $exception) {
            Log::error('Media creation failed.', ['exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        Log::info('API media lookup started.', ['media_id' => $id]);
        try {

            $media = $this->mediaRepository->getMediaById((int) $id);

            if (! $media instanceof Media) {
                Log::warning('API media not found.', ['media_id' => $id]);

                return $this->notFoundResponse('Media file not found.');
            }

            Log::info('API media retrieved.', ['media_id' => $media->id]);

            return $this->successResponse(
                message: 'Media retrieved successfully',
                data: MediaResource::make($media)
            );
        } catch (Throwable $exception) {
            Log::error('Get media by ID failed.', ['exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(MediaUpdateData $data, string $id): JsonResponse
    {
        Log::info('API media update started.', ['media_id' => $id, 'usage' => $data->usage]);
        try {
            $media = Media::find($id);

            if (! $media) {
                Log::warning('API media update target not found.', ['media_id' => $id]);

                return $this->notFoundResponse('Media file not found.');
            }

            $updatedMedia = $this->mediaService->updateMedia($media, $data);

            Log::info('API media updated.', ['media_id' => $updatedMedia->id, 'usage' => $data->usage]);

            return $this->successResponse(
                message: 'Media updated successfully',
                data: MediaResource::make($updatedMedia)
            );
        } catch (Throwable $exception) {
            Log::error('API media update failed.', ['exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred while processing your update.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        Log::info('API media deletion started.', ['media_id' => $id]);
        try {
            $media = Media::find($id);

            if (! $media) {
                Log::warning('API media deletion target not found.', ['media_id' => $id]);

                return $this->notFoundResponse('Media file not found.');
            }

            $this->mediaService->deleteMedia($media);

            Log::info('API media deleted.', ['media_id' => $id]);

            return $this->successResponse('Media deleted successfully');
        } catch (Throwable $exception) {
            Log::error('API media deletion failed.', ['exception' => $exception]);

            return $this->serverErrorResponse('An internal error occurred while processing your request.');
        }
    }
}
