<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Media;

use App\Data\Media\MediaData;
use App\Data\Media\MediaUpdateData;
use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\User;
use App\Services\Media\MediaService;
use App\Repositories\Media\MediaRepository;
use App\Repositories\Dashboard\SidebarItemRepository;
use App\Http\Resources\Media\MediaResource;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Throwable;

class MediaController extends Controller
{
    public function __construct(
        protected MediaService $mediaService,
        protected MediaRepository $mediaRepository,
        protected SidebarItemRepository $sidebarItemRepository
    ){}

    public function index(Request $request)
    {
        Log::info('Web media index requested.', ['user_id' => auth()->id(), 'query' => $request->except(['file', 'password', 'token'])]);
        $perPage = min(max((int) $request->integer('per_page', 10), 1), 50);
        $sort = $request->string('sort', 'latest')->toString();

        if (! in_array($sort, ['latest', 'oldest', 'largest'], true)) {
            $sort = 'latest';
        }

        $filters = [
            'search' => $request->string('search')->trim()->toString(),
            'mime_type' => $request->string('mime_type')->trim()->toString(),
            'sort' => $sort,
        ];

        $mediaItems = $this->mediaRepository->getAllMedia($filters, $perPage);
        $sidebarItems = $this->sidebarItemRepository->getAllActiveSorted();

        Log::info('Web media index loaded.', ['user_id' => auth()->id(), 'media_count' => $mediaItems->count(), 'total_media' => $mediaItems->total(), 'filters' => $filters, 'per_page' => $perPage]);

        return inertia('admin/media', [
            'mediaItems' => MediaResource::collection($mediaItems)->response()->getData(true),
            'sidebarItems' => $sidebarItems,
            'filters' => [
                'search' => $filters['search'],
                'per_page' => $perPage,
                'mime_type' => $filters['mime_type'],
                'sort' => $filters['sort'],
            ],
        ]);
    }

    public function store(MediaData $data, Request $request): JsonResponse
    {
        Log::info('Web media upload started.', ['user_id' => $request->user()?->id]);
        try {
            /** @var User|null $user */
            $user = $request->user();
            $media = $this->mediaService->createMedia($data, $user);

            Log::info('Web media uploaded.', ['user_id' => $user?->id, 'media_id' => $media->id, 'mime_type' => $media->mime_type, 'size' => $media->size]);

            return $this->createdResponse(
                message: 'Media uploaded successfully.',
                data: [
                    'media_id' => $media->id,
                    'url' => $media->url,
                ],
            );
        } catch (Throwable $exception) {
            Log::error('Web media upload failed.', ['user_id' => $request->user()?->id, 'exception' => $exception]);

            return $this->serverErrorResponse('Failed to upload media file.');
        }
    }

    public function update(MediaUpdateData $data, Media $media): RedirectResponse
    {
        Log::info('Web media update started.', ['user_id' => auth()->id(), 'media_id' => $media->id, 'usage' => $data->usage]);
        try {
            $this->mediaService->updateMedia($media, $data);

            Log::info('Web media updated.', ['user_id' => auth()->id(), 'media_id' => $media->id, 'usage' => $data->usage]);

            return redirect()->back()->with('success', 'Media updated successfully.');
        } catch (Throwable $exception) {
            Log::error('Web media update failed.', ['user_id' => auth()->id(), 'media_id' => $media->id, 'exception' => $exception]);

            return redirect()->back()->with('error', 'Failed to update media file.');
        }
    }

    public function destroy(Media $media): RedirectResponse
    {
        Log::info('Web media deletion started.', ['user_id' => auth()->id(), 'media_id' => $media->id]);
        try {
            $this->mediaService->deleteMedia($media);

            Log::info('Web media deleted.', ['user_id' => auth()->id(), 'media_id' => $media->id]);

            return redirect()->back()->with('success', 'Media deleted successfully.');
        } catch (Throwable $exception) {
            Log::error('Web media deletion failed.', ['user_id' => auth()->id(), 'media_id' => $media->id, 'exception' => $exception]);

            return redirect()->back()->with('error', 'Failed to delete media file.');
        }
    }

    public function bulkDestroy(Request $request): RedirectResponse|JsonResponse
    {
        Log::info('Web bulk media deletion started.', ['user_id' => $request->user()?->id, 'requested_count' => count((array) $request->input('ids', []))]);
        $validated = $request->validate([
            'ids' => 'required|array|min:1',
            'ids.*' => 'integer|exists:media,id',
        ]);

        try {
            $deletedCount = $this->mediaService->deleteMultipleMedia($validated['ids']);

            Log::info('Web bulk media deletion succeeded.', ['user_id' => $request->user()?->id, 'deleted_count' => $deletedCount]);

            if ($request->wantsJson()) {
                return $this->successResponse("{$deletedCount} media files deleted successfully.");
            }

            return redirect()->back()->with('success', "{$deletedCount} media files deleted successfully.");
        } catch (Throwable $exception) {
            Log::error('Web bulk media deletion failed.', ['user_id' => $request->user()?->id, 'exception' => $exception]);

            if ($request->wantsJson()) {
                return $this->serverErrorResponse('Failed to delete selected media files.');
            }

            return redirect()->back()->with('error', 'Failed to delete selected media files.');
        }
    }

    public function assignSlot(Request $request, Media $media): RedirectResponse|JsonResponse
    {
        Log::info('Web media slot assignment started.', ['user_id' => $request->user()?->id, 'media_id' => $media->id, 'slot' => $request->input('slot')]);
        $validated = $request->validate([
            'slot' => 'required|string|in:logo,background,avatar',
        ]);

        $this->mediaService->assignMediaToSlot($media, $validated['slot']);

        Log::info('Web media slot assigned.', ['user_id' => $request->user()?->id, 'media_id' => $media->id, 'slot' => $validated['slot']]);

        if ($request->wantsJson()) {
            return $this->successResponse('Slot assigned successfully.');
        }

        return redirect()->back()->with('success', ucfirst($validated['slot']) . ' updated successfully.');
    }

    public function clearSlot(Request $request): RedirectResponse|JsonResponse
    {
        Log::info('Web media slot clearing started.', ['user_id' => $request->user()?->id, 'slot' => $request->input('slot')]);
        $validated = $request->validate([
            'slot' => 'required|string|in:logo,background,avatar',
        ]);

        $this->mediaService->clearMediaSlot($validated['slot']);

        Log::info('Web media slot cleared.', ['user_id' => $request->user()?->id, 'slot' => $validated['slot']]);

        if ($request->wantsJson()) {
            return $this->successResponse('Slot cleared successfully.');
        }

        return redirect()->back()->with('success', ucfirst($validated['slot']) . ' cleared successfully.');
    }

    public function updateBrandingSettings(Request $request): RedirectResponse|JsonResponse
    {
        Log::info('Web branding settings update started.', ['user_id' => $request->user()?->id, 'fields' => array_keys($request->except(['password', 'token', 'file']))]);
        $validated = $request->validate([
            'site_name' => 'nullable|string|max:100',
            'theme_preset' => 'nullable|string|max:50',
            'glass_blur' => 'nullable|string|max:20',
            'glass_opacity' => 'nullable|string|max:20',
        ]);

        $this->mediaService->updateBranding($validated);

        Log::info('Web branding settings updated.', ['user_id' => $request->user()?->id, 'fields' => array_keys($validated)]);

        if ($request->wantsJson()) {
            return $this->successResponse('Branding settings updated successfully.');
        }

        return redirect()->back()->with('success', 'Theme & branding settings updated successfully.');
    }
}
