<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\SiteSetting;
use App\Models\Certificate;
use App\Models\PortfolioSection;
use App\Services\GitHub\GitHubRepositoryService;
use Illuminate\Database\Eloquent\Collection;

class HomeController extends Controller
{
    public function index(GitHubRepositoryService $gitHubRepositoryService)
    {
        $sections = PortfolioSection::query()->visible()->ordered()->get();
        $homeSection = $sections->firstWhere('type', 'hero') ?? $sections->first();

        return $this->renderPortfolio($homeSection?->slug ?? '', $sections, $gitHubRepositoryService);
    }

    public function section(string $slug, GitHubRepositoryService $gitHubRepositoryService)
    {
        $sections = PortfolioSection::query()->visible()->ordered()->get();

        abort_unless($slug === 'assistant' || $sections->contains('slug', $slug), 404);

        return $this->renderPortfolio($slug, $sections, $gitHubRepositoryService);
    }

    private function renderPortfolio(string $activeSectionSlug, Collection $sections, GitHubRepositoryService $gitHubRepositoryService)
    {
        $settings = SiteSetting::query()->with(['logoMedia', 'backgroundMedia', 'avatarMedia', 'resumeMedia'])->first();
        $githubProfileUrl = $settings?->github_url ?: 'https://github.com/' . config('services.github.username', 'milantetar');

        return inertia('home', [
            'settings' => $settings,
            'certificates' => Certificate::query()->with('media')->where('is_visible', true)->orderBy('sort_order')->latest('id')->get(),
            'sections' => $sections,
            'activeSectionSlug' => $activeSectionSlug,
            'projects' => $gitHubRepositoryService->publicRepositoriesForProfile($githubProfileUrl),
            'githubProfileUrl' => $githubProfileUrl,
            'assistantEnabled' => filled(config('services.gemini.api_key')),
        ]);
    }
}
