<?php

declare(strict_types=1);

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use App\Models\Post;
use App\Models\SiteSetting;
use Illuminate\Http\Request;
use Inertia\Response;

class BlogController extends Controller
{
    public function index(Request $request): Response
    {
        $settings = SiteSetting::query()->with(['logoMedia', 'backgroundMedia', 'avatarMedia'])->first();

        $posts = Post::query()
            ->with('coverMedia')
            ->published()
            ->latest('published_at')
            ->paginate(10);

        return inertia('blog/index', [
            'settings' => $settings,
            'posts' => $posts,
        ]);
    }

    public function show(string $slug): Response
    {
        $settings = SiteSetting::query()->with(['logoMedia', 'backgroundMedia', 'avatarMedia'])->first();

        $post = Post::query()
            ->with('coverMedia')
            ->published()
            ->where('slug', $slug)
            ->firstOrFail();

        return inertia('blog/show', [
            'settings' => $settings,
            'post' => $post,
        ]);
    }
}
