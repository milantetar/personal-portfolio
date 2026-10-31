<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\PortfolioSection;
use App\Repositories\Dashboard\SidebarItemRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Response;

class PortfolioSectionController extends Controller
{
    public function __construct(protected SidebarItemRepository $sidebarItemRepository) {}

    public function index(): Response
    {
        return inertia('admin/sections', [
            'sections' => PortfolioSection::query()->ordered()->get(),
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $section = PortfolioSection::query()->create($this->validatedAttributes($request));
        Log::info('Portfolio section created.', ['user_id' => $request->user()?->id, 'section_id' => $section->id]);

        return to_route('portfolio-sections.index')->with('success', 'Portfolio section created successfully.');
    }

    public function update(Request $request, PortfolioSection $portfolioSection): RedirectResponse
    {
        $portfolioSection->update($this->validatedAttributes($request, $portfolioSection->id));
        Log::info('Portfolio section updated.', ['user_id' => $request->user()?->id, 'section_id' => $portfolioSection->id]);

        return to_route('portfolio-sections.index')->with('success', 'Portfolio section updated successfully.');
    }

    public function destroy(Request $request, PortfolioSection $portfolioSection): RedirectResponse
    {
        $id = $portfolioSection->id;
        $portfolioSection->delete();
        Log::info('Portfolio section deleted.', ['user_id' => $request->user()?->id, 'section_id' => $id]);

        return to_route('portfolio-sections.index')->with('success', 'Portfolio section deleted successfully.');
    }

    /** @return array<string, mixed> */
    private function validatedAttributes(Request $request, ?int $currentId = null): array
    {
        $validated = $request->validate([
            'slug' => ['required', 'string', 'max:80', 'regex:/^[a-z0-9-]+$/', 'unique:portfolio_sections,slug'.($currentId ? ','.$currentId : '')],
            'type' => ['required', 'string', 'in:hero,about,skills,experience,projects,certifications,contact,custom'],
            'title' => ['nullable', 'string', 'max:150'],
            'eyebrow' => ['nullable', 'string', 'max:150'],
            'content' => ['nullable', 'json'],
            'sort_order' => ['required', 'integer', 'min:0', 'max:10000'],
            'is_visible' => ['boolean'],
        ]);

        $validated['content'] = $validated['content'] ? json_decode($validated['content'], true, 512, JSON_THROW_ON_ERROR) : [];
        $validated['is_visible'] = (bool) ($validated['is_visible'] ?? false);

        return $validated;
    }
}
