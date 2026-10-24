<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\Certificate;

class HomeController extends Controller
{
    public function index()
    {
        $settings = SiteSetting::query()->with(['logoMedia', 'backgroundMedia', 'avatarMedia'])->first();

        return inertia('home', [
            'settings' => $settings,
            'certificates' => Certificate::query()->with('media')->where('is_visible', true)->orderBy('sort_order')->latest('id')->get(),
        ]);
    }
}
