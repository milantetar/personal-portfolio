<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property string $name
 * @property string $location
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * 
 * @property-read Collection<int, NavbarItem> $items
 */
#[Fillable(['name', 'location'])]
class Navbar extends Model
{
    /**
     * Get the items for this navbar.
     * 
     * @return HasMany<NavbarItem, $this>
     */
    public function items(): HasMany
    {
        // Automatically order the items by the 'order' column when fetched
        return $this->hasMany(NavbarItem::class)->orderBy('order');
    }
}