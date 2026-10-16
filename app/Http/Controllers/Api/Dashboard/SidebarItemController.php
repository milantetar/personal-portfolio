<?php

namespace App\Http\Controllers\Api\Dashboard;

use App\Data\Dashboard\SidebarItemData;
use App\Http\Controllers\Controller;
use App\Http\Resources\Dashboard\SidebarItemResource;
use App\Services\Dashboard\SidebarItemService;
;
use App\Repositories\Dashboard\SidebarItemRepository;
use Exception;

class SidebarItemController extends Controller
{
    public function __construct(
        protected SidebarItemService $sidebarItemService,
        protected SidebarItemRepository $sidebarItemRepository
    ) {
    }

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $items = $this->sidebarItemRepository->getAllActiveSorted();
        
            if ($items->isEmpty()) {
                return $this->notFoundResponse('No sidebar items found.');
            }
            return $this->successResponse(
                'Sidebar items retrieved successfully.',
                SidebarItemResource::collection($items)
            );
        } catch (Exception $e) {
            return $this->serverErrorResponse(
                'Failed to retrieve sidebar items.',
                $e->getMessage()
            );
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(SidebarItemData $data)
    {
        try {
            $item = $this->sidebarItemService->createSidebarItem($data);

            return $this->createdResponse(
                'Sidebar item created successfully.',
                SidebarItemResource::make($item)
            );
        } catch (Exception $e) {
            return $this->serverErrorResponse(
                'Failed to create sidebar item.',
                $e->getMessage()
            );
        }

    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SidebarItemData $data, string $id)
    {
        try {
            $item = $this->sidebarItemRepository->findById($id);

            if (!$item) {
                return $this->notFoundResponse('Sidebar item not found.');
            }

            $updatedItem = $this->sidebarItemService->updateSidebarItem($item, $data);

            return $this->successResponse(
                'Sidebar item updated successfully.',
                SidebarItemResource::make($updatedItem)
            );
        } catch (Exception $e) {
            return $this->serverErrorResponse(
                'Failed to update sidebar item.',
                $e->getMessage()
            );
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        //
    }
}
