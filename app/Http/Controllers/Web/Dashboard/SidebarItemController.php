<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Data\Dashboard\SideBarItemData;
use App\Http\Controllers\Controller;
use App\Models\SideBarItem;
use App\Repositories\Dashboard\SidebarItemRepository;
use App\Services\Dashboard\SidebarManagementService;
use Exception;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;

class SidebarItemController extends Controller
{
    public function __construct(
        protected SidebarManagementService $sidebarItemService,
        protected SidebarItemRepository $sidebarItemRepository
    ) {}

    /**
     * Store a newly created resource in storage.
     */
    public function store(SideBarItemData $data): RedirectResponse
    {
        Log::info('Web sidebar item creation started.', ['user_id' => auth()->id()]);
        try {
            $item = $this->sidebarItemService->createSidebarItem($data);
            Log::info('Web sidebar item created.', ['user_id' => auth()->id(), 'sidebar_item_id' => $item->id]);

            return redirect()->back()->with('success', 'Sidebar item created successfully.');
        } catch (Exception $e) {
            Log::error('Web sidebar item creation failed.', ['user_id' => auth()->id(), 'exception' => $e]);

            return redirect()->back()->with('error', 'Failed to create sidebar item.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(SideBarItemData $data, SideBarItem $sidebarItem): RedirectResponse
    {
        Log::info('Web sidebar item update started.', ['user_id' => auth()->id(), 'sidebar_item_id' => $sidebarItem->id]);
        try {
            $this->sidebarItemService->updateSidebarItem($sidebarItem, $data);

            Log::info('Web sidebar item updated.', ['user_id' => auth()->id(), 'sidebar_item_id' => $sidebarItem->id]);

            return redirect()->back()->with('success', 'Sidebar item updated successfully.');
        } catch (Exception $e) {
            Log::error('Web sidebar item update failed.', ['user_id' => auth()->id(), 'sidebar_item_id' => $sidebarItem->id, 'exception' => $e]);

            return redirect()->back()->with('error', 'Failed to update sidebar item.');
        }

    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(SideBarItem $sidebarItem): RedirectResponse
    {
        Log::info('Web sidebar item deletion started.', ['user_id' => auth()->id(), 'sidebar_item_id' => $sidebarItem->id]);
        try {
            $this->sidebarItemService->deleteSidebarItem($sidebarItem);
            Log::info('Web sidebar item deleted.', ['user_id' => auth()->id(), 'sidebar_item_id' => $sidebarItem->id]);

            return redirect()->back()->with('success', 'Sidebar item deleted successfully.');
        } catch (Exception $e) {
            Log::error('Web sidebar item deletion failed.', ['user_id' => auth()->id(), 'sidebar_item_id' => $sidebarItem->id, 'exception' => $e]);

            return redirect()->back()->with('error', 'Failed to delete sidebar item.');
        }
    }
}
