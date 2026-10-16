<?php

declare(strict_types=1);

namespace App\Repositories\Dashboard;

use App\Models\SidebarItem;
use Illuminate\Database\Eloquent\Collection;

class SidebarItemRepository
{
    /**
     * Get all active and sorted sidebar items.
     */
    public function getAllActiveSorted(): Collection
    {
        return SidebarItem::query()
            ->where('is_visible', true)
            ->orderBy('sort_order')
            ->get();
    }

    public function findById(string $id): ?SidebarItem
    {
        return SidebarItem::find($id);
    }

}