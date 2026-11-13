import { useState, type FormEvent } from 'react';
import { Head, Link, router, useForm, usePage } from '@inertiajs/react';
import {
    ExternalLink,
    FileText,
    Image as ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Media, PageProps, PaginatedPosts, Post } from '@/types';

interface PostsPageProps extends PageProps {
    posts: PaginatedPosts;
    mediaItems: Media[];
    filters: {
        search: string;
        status: string;
    };
}

interface PostFormData {
    title: string;
    slug: string;
    excerpt: string;
    content: string;
    cover_media_id: number | null;
    tags_raw: string;
    is_published: boolean;
}

const emptyForm: PostFormData = {
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    cover_media_id: null,
    tags_raw: '',
    is_published: false,
};

function formatDate(dateStr: string | null): string {
    if (!dateStr) return 'Unpublished';
    return new Date(dateStr).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    });
}

export default function PostsPage() {
    const { posts, mediaItems, filters, sidebarItems, branding } =
        usePage<PostsPageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);

    const {
        data,
        setData,
        processing,
        reset,
        errors,
        transform,
        post,
        put,
        clearErrors,
    } = useForm<PostFormData>(emptyForm);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/dashboard/posts',
            { search, status: filters.status },
            { preserveState: true, replace: true },
        );
    };

    const handleFilterStatus = (status: string) => {
        router.get(
            '/dashboard/posts',
            { search: filters.search, status },
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        clearErrors();
        setEditingPost(null);
        reset();
        setData(emptyForm);
        setIsFormOpen(true);
    };

    const openEdit = (p: Post) => {
        clearErrors();
        setEditingPost(p);
        setData({
            title: p.title,
            slug: p.slug,
            excerpt: p.excerpt || '',
            content: p.content,
            cover_media_id: p.cover_media_id,
            tags_raw: p.tags ? p.tags.join(', ') : '',
            is_published: p.is_published,
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingPost(null);
        reset();
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            title: data.title,
            slug: data.slug || undefined,
            excerpt: data.excerpt || null,
            content: data.content,
            cover_media_id: data.cover_media_id || null,
            tags: data.tags_raw
                ? data.tags_raw
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [],
            is_published: data.is_published,
        };

        transform(() => payload);
        if (editingPost) {
            put(`/dashboard/posts/${editingPost.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm();
                    toast.success('Article updated.');
                },
            });
        } else {
            post('/dashboard/posts', {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm();
                    toast.success('Article published/drafted.');
                },
            });
        }
    };

    const deletePost = (p: Post) => {
        if (!window.confirm(`Delete article "${p.title}"?`)) return;
        router.delete(`/dashboard/posts/${p.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Article deleted.'),
        });
    };

    return (
        <>
            <Head title="Articles & Blog" />
            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={branding?.backgroundImage?.url}
                branding={branding}
            >
                <div className="admin-page flex h-full flex-col gap-4 overflow-hidden">
                    <AdminPageHeader
                        icon={<FileText className="size-4" />}
                        title="Articles & Blog"
                        description="Publish engineering notes, architecture write-ups, and portfolio articles."
                        actions={
                            <div className="flex items-center gap-2">
                                <Button size="sm" asChild variant="outline">
                                    <Link href="/blog" target="_blank">
                                        View Blog
                                        <ExternalLink className="ml-1 size-3.5" />
                                    </Link>
                                </Button>
                                <Button size="sm" onClick={openCreate}>
                                    <Plus className="size-3.5" />
                                    New Article
                                </Button>
                            </div>
                        }
                    />

                    {/* Filter and Search Bar */}
                    <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                variant={
                                    filters.status === 'all' || !filters.status
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                onClick={() => handleFilterStatus('all')}
                            >
                                All ({posts.total})
                            </Button>
                            <Button
                                variant={
                                    filters.status === 'published'
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                onClick={() => handleFilterStatus('published')}
                            >
                                Published
                            </Button>
                            <Button
                                variant={
                                    filters.status === 'draft'
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                onClick={() => handleFilterStatus('draft')}
                            >
                                Drafts
                            </Button>
                        </div>

                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full max-w-xs"
                        >
                            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search articles..."
                                className="h-8 pl-8 text-xs"
                            />
                        </form>
                    </div>

                    {/* Posts Table */}
                    <section className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border/40 bg-background/30">
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-14">
                                            Cover
                                        </TableHead>
                                        <TableHead>Article</TableHead>
                                        <TableHead>Tags</TableHead>
                                        <TableHead className="w-24">
                                            Read Time
                                        </TableHead>
                                        <TableHead className="w-24">
                                            Status
                                        </TableHead>
                                        <TableHead className="w-32">
                                            Date
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {posts.data.length ? (
                                        posts.data.map((p) => (
                                            <TableRow key={p.id}>
                                                <TableCell>
                                                    <div className="flex size-10 items-center justify-center overflow-hidden rounded border border-border bg-muted/40">
                                                        {p.cover_media?.url ? (
                                                            <img
                                                                src={
                                                                    p
                                                                        .cover_media
                                                                        .url
                                                                }
                                                                alt={p.title}
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="size-4 text-muted-foreground/60" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-sm min-w-0">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {p.title}
                                                        </p>
                                                        {p.excerpt ? (
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {p.excerpt}
                                                            </p>
                                                        ) : null}
                                                        <span className="font-mono text-[10px] text-muted-foreground/70">
                                                            /{p.slug}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex max-w-xs flex-wrap gap-1">
                                                        {p.tags
                                                            ?.slice(0, 3)
                                                            .map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="rounded border border-border/80 px-1.5 py-0.5 text-[10px] text-muted-foreground"
                                                                >
                                                                    {tag}
                                                                </span>
                                                            ))}
                                                        {p.tags &&
                                                            p.tags.length >
                                                                3 && (
                                                                <span className="text-[10px] text-muted-foreground">
                                                                    +
                                                                    {p.tags
                                                                        .length -
                                                                        3}
                                                                </span>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {p.read_time_minutes} min
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            p.is_published
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {p.is_published
                                                            ? 'Published'
                                                            : 'Draft'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                    {formatDate(
                                                        p.published_at ||
                                                            p.created_at,
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        {p.is_published && (
                                                            <Button
                                                                size="icon"
                                                                variant="ghost"
                                                                className="size-7"
                                                                asChild
                                                                title="View live post"
                                                            >
                                                                <Link
                                                                    href={`/blog/${p.slug}`}
                                                                    target="_blank"
                                                                >
                                                                    <ExternalLink className="size-3.5" />
                                                                </Link>
                                                            </Button>
                                                        )}
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-7"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEdit(p)
                                                            }
                                                        >
                                                            <Pencil className="size-3.5" />
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-7 text-destructive hover:text-destructive"
                                                            title="Delete"
                                                            onClick={() =>
                                                                deletePost(p)
                                                            }
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={7}
                                                className="py-12 text-center text-sm text-muted-foreground"
                                            >
                                                No articles found. Start writing
                                                your first post.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {posts.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border/40 p-2 text-xs text-muted-foreground">
                                <span>
                                    Page {posts.current_page} of{' '}
                                    {posts.last_page} ({posts.total} articles)
                                </span>
                                <div className="flex items-center gap-1">
                                    {posts.links.map((link, idx) => (
                                        <Button
                                            key={idx}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.get(
                                                    link.url,
                                                    {},
                                                    { preserveState: true },
                                                )
                                            }
                                            className="h-7 px-2.5 text-xs"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </AdminLayout>

            {/* Create/Edit Post Modal */}
            <Dialog
                open={isFormOpen}
                onOpenChange={(open) => !open && closeForm()}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingPost ? 'Edit Article' : 'New Article'}
                        </DialogTitle>
                        <DialogDescription>
                            Compose your article, technical insights, or
                            architectural notes.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="art_title">Title *</Label>
                                <Input
                                    id="art_title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="e.g. Scaling Real-Time WebSocket Clusters"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="art_slug">
                                    Slug (optional)
                                </Label>
                                <Input
                                    id="art_slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    placeholder="auto-generated from title if blank"
                                />
                                {errors.slug && (
                                    <p className="text-xs text-destructive">
                                        {errors.slug}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="art_cover">
                                    Cover Image Media
                                </Label>
                                <select
                                    id="art_cover"
                                    value={data.cover_media_id ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'cover_media_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                >
                                    <option value="">No cover image</option>
                                    {mediaItems.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.original_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="art_excerpt">
                                    Summary / Excerpt (shown on list and social
                                    previews)
                                </Label>
                                <textarea
                                    id="art_excerpt"
                                    value={data.excerpt}
                                    onChange={(e) =>
                                        setData('excerpt', e.target.value)
                                    }
                                    className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    placeholder="Concise overview under 200 characters..."
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="art_tags">
                                    Tags (comma separated)
                                </Label>
                                <Input
                                    id="art_tags"
                                    value={data.tags_raw}
                                    onChange={(e) =>
                                        setData('tags_raw', e.target.value)
                                    }
                                    placeholder="Architecture, PHP, TypeScript, Performance"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="art_content">
                                    Article Content *
                                </Label>
                                <textarea
                                    id="art_content"
                                    value={data.content}
                                    onChange={(e) =>
                                        setData('content', e.target.value)
                                    }
                                    className="min-h-48 w-full rounded-md border border-input bg-background px-3 py-2 font-mono text-sm shadow-sm"
                                    placeholder="Write your article in Markdown or paragraphs..."
                                    required
                                />
                                {errors.content && (
                                    <p className="text-xs text-destructive">
                                        {errors.content}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between border-t border-border/60 pt-3">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={data.is_published}
                                    onChange={(e) =>
                                        setData(
                                            'is_published',
                                            e.target.checked,
                                        )
                                    }
                                />
                                Publish immediately (makes visible on /blog)
                            </label>
                        </div>

                        <div className="flex justify-end gap-2 border-t border-border/40 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeForm}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving...'
                                    : editingPost
                                      ? 'Save Changes'
                                      : 'Create Article'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
