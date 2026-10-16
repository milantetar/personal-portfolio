<?php

declare(strict_types=1);

namespace App\Services\Dashboard;

use App\Data\Dashboard\SidebarItemData;
use App\Models\SidebarItem;

class SideBarItemService
{
    public function createSideBarItem(SidebarItemData $data) : SidebarItem
    {   
        return SidebarItem::create($data->toArray());
    }

    public function updateSideBarItem(SidebarItem $sidebarItem, SidebarItemData $data) : SidebarItem
    {
        $sidebarItem->update($data->toArray());
        return $sidebarItem;
    }
}
