<?php

declare(strict_types=1);

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Carbon;

/**
 * @property int $id
 * @property int $navbar_id
 * @property string $label
 * @property string $url
 * @property int $order
 * @property Carbon|null $created_at
 * @property Carbon|null $updated_at
 * @property-read Navbar $navbar
 */
#[Fillable(['navbar_id', 'label', 'url', 'order'])]
class NavbarItem extends Model
{
    /**
     * Get the navbar that owns this item.
     *
     * @return BelongsTo<Navbar, $this>
     */
    public function navbar(): BelongsTo
    {
        return $this->belongsTo(Navbar::class);
    }
}
