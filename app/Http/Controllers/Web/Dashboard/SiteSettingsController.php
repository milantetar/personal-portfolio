<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Http\Requests\SiteSettingsUpdateRequest;
use App\Models\Media;
use App\Models\SideBarItem;
use App\Models\SiteSetting;
use App\Repositories\Dashboard\SidebarItemRepository;
use App\Services\Media\MediaService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class SiteSettingsController extends Controller
{
    public function __construct(
        protected MediaService $mediaService,
        protected SidebarItemRepository $sidebarItemRepository,
    ) {}

    public function index(): Response
    {
        $settings = SiteSetting::query()->with(['logoMedia', 'backgroundMedia', 'avatarMedia', 'resumeMedia', 'faviconMedia'])->first();
        $settings ??= SiteSetting::query()->create(['site_name' => "Milan's Portfolio"]);
        $settingsSidebarItem = SideBarItem::query()->whereIn('url', ['/dashboard/settings', 'dashboard/settings'])->first();
        if (! $settingsSidebarItem) {
            $settingsSidebarItem = SideBarItem::query()->create([
                'label' => 'Site Settings', 'url' => '/dashboard/settings', 'sort_order' => 1, 'is_visible' => true,
            ]);
        } elseif ($settingsSidebarItem->url !== '/dashboard/settings') {
            $settingsSidebarItem->update(['url' => '/dashboard/settings']);
        }
        if (! $settingsSidebarItem->is_visible || $settingsSidebarItem->label !== 'Site Settings') {
            $settingsSidebarItem->update(['label' => 'Site Settings', 'is_visible' => true]);
        }

        return inertia('admin/site-settings', [
            'settings' => $settings,
            'settingsSidebarItem' => $settingsSidebarItem->load('iconMedia'),
            'mediaItems' => Media::query()->latest()->get(),
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
        ]);
    }

    public function update(SiteSettingsUpdateRequest $request): RedirectResponse
    {
        Log::info('Web site settings update started.', [
            'user_id' => $request->user()?->id,
            'fields' => array_keys($request->validated()),
        ]);

        $this->mediaService->updateBranding($request->validated());

        if ($request->has('settings_icon_media_id')) {
            SideBarItem::query()
                ->where('url', '/dashboard/settings')
                ->update(['icon_media_id' => $request->integer('settings_icon_media_id') ?: null]);
        }

        Log::info('Web site settings updated.', ['user_id' => $request->user()?->id]);

        return to_route('site-settings.index')->with('success', 'Site settings saved successfully.');
    }
}
