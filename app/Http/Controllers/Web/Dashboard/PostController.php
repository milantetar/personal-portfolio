<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web\Dashboard;

use App\Http\Controllers\Controller;
use App\Models\Media;
use App\Models\Post;
use App\Repositories\Dashboard\SidebarItemRepository;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Inertia\Response;

class PostController extends Controller
{
    public function __construct(
        protected SidebarItemRepository $sidebarItemRepository,
    ) {}

    public function index(Request $request): Response
    {
        $search = $request->string('search')->trim()->toString();
        $status = $request->string('status', 'all')->toString();

        $query = Post::query()->with('coverMedia')->latest('id');

        if ($status === 'published') {
            $query->where('is_published', true);
        } elseif ($status === 'draft') {
            $query->where('is_published', false);
        }

        if ($search !== '') {
            $query->where(function ($sub) use ($search): void {
                $sub->where('title', 'like', "%{$search}%")
                    ->orWhere('excerpt', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        $posts = $query->paginate(15)->withQueryString();

        return inertia('admin/posts', [
            'posts' => $posts,
            'mediaItems' => Media::query()->latest()->get(['id', 'original_name', 'path', 'mime_type']),
            'filters' => [
                'search' => $search,
                'status' => $status,
            ],
            'sidebarItems' => $this->sidebarItemRepository->getAllActiveSorted(),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $this->prepareSlug($request);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'alpha_dash:ascii', 'max:255', 'unique:posts,slug'],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:30'],
            'is_published' => ['boolean'],
        ]);

        if (! empty($validated['is_published'])) {
            $validated['published_at'] = now();
        }

        Post::query()->create($validated);

        return back()->with('success', 'Post saved successfully.');
    }

    public function update(Request $request, Post $post): RedirectResponse
    {
        $this->prepareSlug($request);
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'alpha_dash:ascii', 'max:255', Rule::unique('posts', 'slug')->ignore($post->id)],
            'excerpt' => ['nullable', 'string', 'max:500'],
            'content' => ['required', 'string'],
            'cover_media_id' => ['nullable', 'integer', 'exists:media,id'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:30'],
            'is_published' => ['boolean'],
        ]);

        if (! empty($validated['is_published']) && ! $post->is_published) {
            $validated['published_at'] = now();
        }

        $post->update($validated);

        return back()->with('success', 'Post updated successfully.');
    }

    public function destroy(Post $post): RedirectResponse
    {
        $post->delete();

        return back()->with('success', 'Post deleted.');
    }

    private function prepareSlug(Request $request): void
    {
        if (blank($request->input('slug')) && is_string($request->input('title'))) {
            $request->merge(['slug' => Str::slug($request->input('title'))]);
        }
    }
}
