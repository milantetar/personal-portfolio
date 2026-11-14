<?php

namespace App\Http\Middleware;

use App\Models\ContactMessage;
use App\Models\Navbar;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'seo' => [
                'siteUrl' => rtrim((string) config('app.url'), '/'),
            ],
            'auth' => [
                'user' => $request->user(),
            ],
            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],
            'branding' => fn (): array => $this->branding(),
            'navBars' => fn () => Navbar::query()->with('items')->orderBy('id')->get(),
            'unreadMessagesCount' => fn (): int => $request->user() ? ContactMessage::query()->where('is_read', false)->count() : 0,
        ];
    }

    /** @return array<string, mixed> */
    private function branding(): array
    {
        try {
            $settings = SiteSetting::query()
                ->with(['logoMedia', 'backgroundMedia', 'avatarMedia', 'faviconMedia'])
                ->first();

            return [
                'id' => $settings?->id,
                'siteName' => $settings?->site_name ?: "Milan's Portfolio",
                'logo' => $settings?->logoMedia?->only(['id', 'url', 'alt_text']),
                'backgroundImage' => $settings?->backgroundMedia?->only(['id', 'url', 'alt_text']),
                'avatar' => $settings?->avatarMedia?->only(['id', 'url', 'alt_text']),
                'favicon' => $settings?->faviconMedia?->only(['id', 'url', 'alt_text', 'mime_type']),
                'themePreset' => $settings?->theme_preset ?: 'dark',
                'glassBlur' => $settings?->glass_blur ?: 'xl',
                'glassOpacity' => $settings?->glass_opacity ?: '75',
            ];
        } catch (\Throwable) {
            return [
                'siteName' => "Milan's Portfolio",
                'logo' => null,
                'backgroundImage' => null,
                'avatar' => null,
                'favicon' => null,
                'themePreset' => 'dark',
                'glassBlur' => 'xl',
                'glassOpacity' => '75',
            ];
        }
    }
}
