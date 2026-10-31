<?php

declare(strict_types=1);

namespace App\Http\Controllers\Api\Dashboard;

use App\Data\Dashboard\SidebarItemData;
use App\Http\Controllers\Controller;
use App\Http\Resources\Dashboard\SidebarItemResource;
use App\Models\SidebarItem;
use App\Repositories\Dashboard\SidebarItemRepository;
use App\Services\Dashboard\SidebarItemService;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Throwable;

class SidebarItemController extends Controller
{
    public function __construct(
        protected SidebarItemService $sidebarItemService,
        protected SidebarItemRepository $sidebarItemRepository
    ) {}

    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        Log::info('API sidebar items index started.');
        try {
            $items = $this->sidebarItemRepository->getAllActiveSorted();

            if ($items->isEmpty()) {
                Log::warning('API sidebar items list is empty.');

                return $this->notFoundResponse('No sidebar items found.');
            }
            Log::info('API sidebar items retrieved.', ['count' => $items->count()]);

            return $this->successResponse(
                'Sidebar items retrieved successfully.',
                SidebarItemResource::collection($items)
            );
        } catch (Throwable $exception) {
            Log::error('API sidebar items index failed.', ['exception' => $exception]);

            return $this->serverErrorResponse(
                'Failed to retrieve sidebar items.',
                $exception->getMessage()
            );
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SidebarItemData $data): JsonResponse
    {
        Log::info('API sidebar item creation started.');
        try {
            $item = $this->sidebarItemService->createSidebarItem($data);

            Log::info('API sidebar item created.', ['sidebar_item_id' => $item->id]);

            return $this->createdResponse(
                'Sidebar item created successfully.',
                SidebarItemResource::make($item)
            );
        } catch (Throwable $exception) {
            Log::error('API sidebar item creation failed.', ['exception' => $exception]);

            return $this->serverErrorResponse(
                'Failed to create sidebar item.',
                $exception->getMessage()
            );
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id): JsonResponse
    {
        Log::info('API sidebar item lookup started.', ['sidebar_item_id' => $id]);
        try {
            $item = $this->sidebarItemRepository->findById($id);

            if (! $item instanceof SidebarItem) {
                Log::warning('API sidebar item not found.', ['sidebar_item_id' => $id]);

                return $this->notFoundResponse('Sidebar item not found.');
            }

            Log::info('API sidebar item retrieved.', ['sidebar_item_id' => $item->id]);

            return $this->successResponse(
                'Sidebar item retrieved successfully.',
                SidebarItemResource::make($item)
            );
        } catch (Throwable $exception) {
            Log::error('API sidebar item lookup failed.', ['sidebar_item_id' => $id, 'exception' => $exception]);

            return $this->serverErrorResponse(
                'Failed to retrieve sidebar item.',
                $exception->getMessage()
            );
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SidebarItemData $data, string $id): JsonResponse
    {
        Log::info('API sidebar item update started.', ['sidebar_item_id' => $id]);
        try {
            $item = $this->sidebarItemRepository->findById($id);

            if (! $item instanceof SidebarItem) {
                Log::warning('API sidebar item update target not found.', ['sidebar_item_id' => $id]);

                return $this->notFoundResponse('Sidebar item not found.');
            }

            $updatedItem = $this->sidebarItemService->updateSidebarItem($item, $data);

            Log::info('API sidebar item updated.', ['sidebar_item_id' => $updatedItem->id]);

            return $this->successResponse(
                'Sidebar item updated successfully.',
                SidebarItemResource::make($updatedItem)
            );
        } catch (Throwable $exception) {
            Log::error('API sidebar item update failed.', ['sidebar_item_id' => $id, 'exception' => $exception]);

            return $this->serverErrorResponse(
                'Failed to update sidebar item.',
                $exception->getMessage()
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id): JsonResponse
    {
        Log::info('API sidebar item deletion started.', ['sidebar_item_id' => $id]);
        try {
            $item = $this->sidebarItemRepository->findById($id);

            if (! $item instanceof SidebarItem) {
                Log::warning('API sidebar item deletion target not found.', ['sidebar_item_id' => $id]);

                return $this->notFoundResponse('Sidebar item not found.');
            }

            $this->sidebarItemService->deleteSidebarItem($item);

            Log::info('API sidebar item deleted.', ['sidebar_item_id' => $id]);

            return $this->successResponse(
                'Sidebar item deleted successfully.'
            );

        } catch (Throwable $exception) {
            Log::error('API sidebar item deletion failed.', ['sidebar_item_id' => $id, 'exception' => $exception]);

            return $this->serverErrorResponse(
                'Failed to delete sidebar item.',
                $exception->getMessage()
            );
        }
    }
}
