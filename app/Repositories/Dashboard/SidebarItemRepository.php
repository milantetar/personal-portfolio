<?php

declare(strict_types=1);

namespace App\Repositories\Dashboard;

use App\Models\SideBarItem;
use Illuminate\Database\Eloquent\Collection;

class SidebarItemRepository
{
    /**
     * Get all active and sorted sidebar items.
     *
     * @return Collection<int, SideBarItem>
     */
    public function getAllActiveSorted(): Collection
    {
        return SideBarItem::query()
            ->where('is_visible', true)
            ->with('iconMedia')
            ->orderBy('sort_order')
            ->get();
    }

    public function findById(string $id): ?SideBarItem
    {
        return SideBarItem::find($id);
    }
}
