<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Certificate;
use App\Models\PortfolioSection;
use App\Models\Post;
use App\Models\Project;
use App\Models\SiteSetting;
use App\Services\GitHub\GitHubRepositoryService;
use Illuminate\Database\Eloquent\Collection;
use Inertia\Response;

class HomeController extends Controller
{
    public function index(GitHubRepositoryService $gitHubRepositoryService): Response
    {
        $sections = PortfolioSection::query()->visible()->ordered()->get();
        $homeSection = $sections->firstWhere('type', 'hero') ?? $sections->first();
        $activeSectionSlug = $homeSection instanceof PortfolioSection ? $homeSection->slug : '';

        return $this->renderPortfolio($activeSectionSlug, $sections, $gitHubRepositoryService);
    }

    public function section(string $slug, GitHubRepositoryService $gitHubRepositoryService): Response
    {
        $sections = PortfolioSection::query()->visible()->ordered()->get();

        abort_unless($slug === 'assistant' || $sections->contains('slug', $slug), 404);

        return $this->renderPortfolio($slug, $sections, $gitHubRepositoryService);
    }

    /**
     * @param  Collection<int, PortfolioSection>  $sections
     */
    private function renderPortfolio(string $activeSectionSlug, Collection $sections, GitHubRepositoryService $gitHubRepositoryService): Response
    {
        $settings = SiteSetting::query()->with(['logoMedia', 'backgroundMedia', 'avatarMedia', 'resumeMedia'])->first();
        $githubUsername = config('services.github.username');
        $githubProfileUrl = $settings?->github_url ?: (filled($githubUsername) ? 'https://github.com/'.$githubUsername : null);

        return inertia('home', [
            'settings' => $settings,
            'certificates' => Certificate::query()->with('media')->where('is_visible', true)->orderBy('sort_order')->latest('id')->get(),
            'customProjects' => Project::query()->with('thumbnailMedia')->visible()->ordered()->get(),
            'recentPosts' => Post::query()->published()->latest('published_at')->take(3)->get(['id', 'title', 'slug', 'excerpt', 'read_time_minutes', 'published_at']),
            'sections' => $sections,
            'activeSectionSlug' => $activeSectionSlug,
            'projects' => $gitHubRepositoryService->publicRepositoriesForProfile($githubProfileUrl),
            'githubProfileUrl' => $githubProfileUrl,
            'assistantEnabled' => filled(config('services.gemini.api_key')),
        ]);
    }
}
