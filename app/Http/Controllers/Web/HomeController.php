<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\Certificate;
use App\Models\PortfolioSection;
use App\Services\GitHub\GitHubRepositoryService;

class HomeController extends Controller
{
    public function index(GitHubRepositoryService $gitHubRepositoryService)
    {
        $settings = SiteSetting::query()->with(['logoMedia', 'backgroundMedia', 'avatarMedia', 'resumeMedia'])->first();
        $githubProfileUrl = $settings?->github_url ?: 'https://github.com/' . config('services.github.username', 'milantetar');

        return inertia('home', [
            'settings' => $settings,
            'certificates' => Certificate::query()->with('media')->where('is_visible', true)->orderBy('sort_order')->latest('id')->get(),
            'sections' => PortfolioSection::query()->visible()->ordered()->get(),
            'projects' => $gitHubRepositoryService->publicRepositoriesForProfile($githubProfileUrl),
            'githubProfileUrl' => $githubProfileUrl,
            'assistantEnabled' => filled(config('services.gemini.api_key')),
        ]);
    }
}
