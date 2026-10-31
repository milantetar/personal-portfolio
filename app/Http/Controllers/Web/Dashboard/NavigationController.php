<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Navbar;
use App\Models\NavbarItem;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class NavigationController extends Controller
{
    private const LOCATIONS = ['homepage-header', 'dashboard-header'];

    public function index(): Response
    {
        return Inertia::render('admin/navigation', [
            'navbars' => Navbar::query()
                ->with('items')
                ->whereIn('location', self::LOCATIONS)
                ->orderBy('id')
                ->get(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'navbar_id' => ['required', 'integer', 'exists:navbars,id'],
            'label' => ['required', 'string', 'max:80'],
            'url' => ['required', 'string', 'max:2048', 'regex:/^(#[-A-Za-z0-9_]+|\/(?!\/)[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9\s()-]+)$/i'],
            'order' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);

        $navbar = Navbar::query()
            ->whereIn('location', self::LOCATIONS)
            ->findOrFail($validated['navbar_id']);

        $item = $navbar->items()->create([
            'label' => $validated['label'],
            'url' => $validated['url'],
            'order' => $validated['order'],
        ]);

        Log::info('Navigation link created.', [
            'navbar_id' => $navbar->id,
            'navbar_location' => $navbar->location,
            'item_id' => $item->id,
            'user_id' => $request->user()?->id,
        ]);

        return to_route('navigation.index')->with('success', 'Navigation link created.');
    }

    public function updateBrand(Request $request, Navbar $navbar): RedirectResponse
    {
        abort_unless(in_array($navbar->location, self::LOCATIONS, true), 404);

        $validated = $request->validate([
            'brand_title' => ['nullable', 'string', 'max:100'],
        ]);

        $navbar->update(['brand_title' => $validated['brand_title'] ?? null]);

        Log::info('Navigation brand title updated.', [
            'navbar_id' => $navbar->id,
            'navbar_location' => $navbar->location,
            'brand_title' => $navbar->brand_title,
            'user_id' => $request->user()?->id,
        ]);

        return to_route('navigation.index')->with('success', 'Navbar brand title updated.');
    }

    public function reorder(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'navbar_id' => ['required', 'integer', 'exists:navbars,id'],
            'item_ids' => ['required', 'array', 'min:1'],
            'item_ids.*' => ['required', 'integer', 'distinct'],
        ]);

        $navbar = Navbar::query()
            ->whereIn('location', self::LOCATIONS)
            ->findOrFail($validated['navbar_id']);
        $itemIds = array_map('intval', $validated['item_ids']);
        $expectedIds = $navbar->items()->orderBy('id')->pluck('id')->map(static fn ($id): int => (int) $id)->all();
        $submittedIds = $itemIds;
        sort($expectedIds);
        sort($submittedIds);

        if ($submittedIds !== $expectedIds) {
            throw ValidationException::withMessages([
                'item_ids' => 'The navigation items have changed. Refresh and try again.',
            ]);
        }

        DB::transaction(function () use ($navbar, $itemIds): void {
            foreach ($itemIds as $index => $itemId) {
                NavbarItem::query()
                    ->where('navbar_id', $navbar->id)
                    ->whereKey($itemId)
                    ->update(['order' => $index + 1]);
            }
        });

        Log::info('Navigation links reordered.', [
            'navbar_id' => $navbar->id,
            'navbar_location' => $navbar->location,
            'item_ids' => $itemIds,
            'user_id' => $request->user()?->id,
        ]);

        return to_route('navigation.index')->with('success', 'Navigation order updated.');
    }

    public function update(Request $request, NavbarItem $navbarItem): RedirectResponse
    {
        abort_unless(in_array($navbarItem->navbar()->value('location'), self::LOCATIONS, true), 404);

        $validated = $request->validate([
            'label' => ['required', 'string', 'max:80'],
            'url' => ['required', 'string', 'max:2048', 'regex:/^(#[-A-Za-z0-9_]+|\/(?!\/)[^\s]*|https?:\/\/[^\s]+|mailto:[^\s]+|tel:[+0-9\s()-]+)$/i'],
            'order' => ['required', 'integer', 'min:0', 'max:10000'],
        ]);

        $navbarItem->update($validated);

        Log::info('Navigation link updated.', [
            'navbar_id' => $navbarItem->navbar_id,
            'item_id' => $navbarItem->id,
            'user_id' => $request->user()?->id,
        ]);

        return to_route('navigation.index')->with('success', 'Navigation link updated.');
    }

    public function destroy(Request $request, NavbarItem $navbarItem): RedirectResponse
    {
        abort_unless(in_array($navbarItem->navbar()->value('location'), self::LOCATIONS, true), 404);

        $itemId = $navbarItem->id;
        $navbarId = $navbarItem->navbar_id;
        $navbarItem->delete();

        Log::info('Navigation link deleted.', [
            'navbar_id' => $navbarId,
            'item_id' => $itemId,
            'user_id' => $request->user()?->id,
        ]);

        return to_route('navigation.index')->with('success', 'Navigation link deleted.');
    }
}
