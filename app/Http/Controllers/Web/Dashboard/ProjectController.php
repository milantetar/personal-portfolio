<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Project;
use App\Repositories\Dashboard\SidebarItemRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Response;

class ProjectController extends Controller
{
    public function __construct(
        protected SidebarItemRepository $sidebarItemRepository,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();

        $query = Project::query()->with('thumbnailMedia')->ordered();

        if ($search !== '') {
            $query->where(function ($sub) use ($search): void {
                $sub->where('title', 'like', "%{$search}%")
                    ->orWhere('tagline', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        $projects = $query->paginate(15)->withQueryString();

        return inertia('admin/projects', [
            'projects' => $projects,
            'mediaItems' => Media::query()->latest()->get(['id', 'original_name', 'path', 'mime_type']),
            'filters' => [
                'search' => $search,
            ],
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', 'unique:projects,slug'],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'challenge' => ['nullable', 'string'],
            'solution' => ['nullable', 'string'],
            'metrics' => ['nullable', 'string', 'max:255'],
            'tech_stack' => ['nullable', 'array'],
            'tech_stack.*' => ['string', 'max:50'],
            'live_url' => ['nullable', 'url', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'thumbnail_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'is_featured' => ['boolean'],
            'is_visible' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        Project::query()->create($validated);

        return back()->with('success', 'Project created successfully.');
    }

    public function update(Request $request, Project $project): RedirectResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['nullable', 'string', 'max:255', Rule::unique('projects', 'slug')->ignore($project->id)],
            'tagline' => ['nullable', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'challenge' => ['nullable', 'string'],
            'solution' => ['nullable', 'string'],
            'metrics' => ['nullable', 'string', 'max:255'],
            'tech_stack' => ['nullable', 'array'],
            'tech_stack.*' => ['string', 'max:50'],
            'live_url' => ['nullable', 'url', 'max:255'],
            'github_url' => ['nullable', 'url', 'max:255'],
            'thumbnail_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'is_featured' => ['boolean'],
            'is_visible' => ['boolean'],
            'sort_order' => ['integer'],
        ]);

        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['title']);
        }

        $project->update($validated);

        return back()->with('success', 'Project updated successfully.');
    }

    public function destroy(Project $project): RedirectResponse
    {
        $project->delete();

        return back()->with('success', 'Project deleted.');
    }
}
