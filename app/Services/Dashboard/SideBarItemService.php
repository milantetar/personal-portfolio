<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Data\Dashboard\SidebarItemData;
use App\Models\SidebarItem;

class SidebarItemService
{
    public function createSidebarItem(SidebarItemData $data): SidebarItem
    {
        return SidebarItem::create($data->toArray());
    }

    public function updateSidebarItem(SidebarItem $sidebarItem, SidebarItemData $data): SidebarItem
    {
        $sidebarItem->update($data->toArray());

        return $sidebarItem;
    }

    public function deleteSidebarItem(SidebarItem $sidebarItem): void
    {
        $sidebarItem->delete();
    }
}
