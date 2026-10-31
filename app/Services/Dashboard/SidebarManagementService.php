<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Data\Dashboard\SideBarItemData;
use App\Models\SideBarItem;

class SidebarManagementService
{
    public function createSidebarItem(SideBarItemData $data): SideBarItem
    {
        return SideBarItem::create($data->toArray());
    }

    public function updateSidebarItem(SideBarItem $sidebarItem, SideBarItemData $data): SideBarItem
    {
        $sidebarItem->update($data->toArray());

        return $sidebarItem;
    }

    public function deleteSidebarItem(SideBarItem $sidebarItem): void
    {
        $sidebarItem->delete();
    }
}
