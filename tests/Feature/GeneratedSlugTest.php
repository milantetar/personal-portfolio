<?php

declare(strict_types=1);

use App\Models\Post;
use App\Models\Project;

it('validates generated project slugs before insert and update', function (): void {
    $this->actingAs(adminUser());
    $this->post('/dashboard/projects', ['title' => 'Browser project'])->assertRedirect();
    $project = Project::query()->sole();
    expect($project->slug)->toBe('browser-project');
    $this->post('/dashboard/projects', ['title' => 'Browser project'])->assertSessionHasErrors('slug');
    $other = Project::query()->create(['title' => 'Other', 'slug' => 'other']);
    $this->put('/dashboard/projects/'.$other->id, ['title' => 'Browser project', 'slug' => ''])->assertSessionHasErrors('slug');
    $this->put('/dashboard/projects/'.$project->id, ['title' => 'Browser project', 'slug' => ''])->assertSessionDoesntHaveErrors();
    expect(Project::query()->count())->toBe(2);
});

it('validates generated article slugs and rejects empty or unroutable slugs', function (): void {
    $this->actingAs(adminUser());
    $this->post('/dashboard/posts', ['title' => 'Browser article', 'content' => 'Content'])->assertSessionDoesntHaveErrors();
    $this->post('/dashboard/posts', ['title' => 'Browser article', 'content' => 'Content'])->assertSessionHasErrors('slug');
    $this->post('/dashboard/posts', ['title' => 'Other', 'slug' => 'invalid/path', 'content' => 'Content'])->assertSessionHasErrors('slug');
    $this->post('/dashboard/projects', ['title' => '!!!'])->assertSessionHasErrors('slug');
    expect(Post::query()->count())->toBe(1);
});
