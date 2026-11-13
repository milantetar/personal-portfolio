import { useState, type FormEvent } from 'react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    ExternalLink,
    FolderGit2,
    Image as ImageIcon,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { GitHubIcon } from '@/components/portfolio/brand-icons';
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
import type { Media, PageProps, PaginatedProjects, Project } from '@/types';

interface ProjectsPageProps extends PageProps {
    projects: PaginatedProjects;
    mediaItems: Media[];
    filters: {
        search: string;
    };
}

interface ProjectFormData {
    title: string;
    slug: string;
    tagline: string;
    description: string;
    challenge: string;
    solution: string;
    metrics: string;
    tech_stack_raw: string;
    live_url: string;
    github_url: string;
    thumbnail_media_id: number | null;
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
}

const emptyForm: ProjectFormData = {
    title: '',
    slug: '',
    tagline: '',
    description: '',
    challenge: '',
    solution: '',
    metrics: '',
    tech_stack_raw: '',
    live_url: '',
    github_url: '',
    thumbnail_media_id: null,
    is_featured: false,
    is_visible: true,
    sort_order: 0,
};

export default function ProjectsPage() {
    const { projects, mediaItems, filters, sidebarItems, branding } =
        usePage<ProjectsPageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProject, setEditingProject] = useState<Project | null>(null);

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
    } = useForm<ProjectFormData>(emptyForm);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/dashboard/projects',
            { search },
            { preserveState: true, replace: true },
        );
    };

    const openCreate = () => {
        clearErrors();
        setEditingProject(null);
        reset();
        setData(emptyForm);
        setIsFormOpen(true);
    };

    const openEdit = (project: Project) => {
        clearErrors();
        setEditingProject(project);
        setData({
            title: project.title,
            slug: project.slug,
            tagline: project.tagline || '',
            description: project.description || '',
            challenge: project.challenge || '',
            solution: project.solution || '',
            metrics: project.metrics || '',
            tech_stack_raw: project.tech_stack
                ? project.tech_stack.join(', ')
                : '',
            live_url: project.live_url || '',
            github_url: project.github_url || '',
            thumbnail_media_id: project.thumbnail_media_id,
            is_featured: project.is_featured,
            is_visible: project.is_visible,
            sort_order: project.sort_order,
        });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingProject(null);
        reset();
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        const payload = {
            title: data.title,
            slug: data.slug || undefined,
            tagline: data.tagline || null,
            description: data.description || null,
            challenge: data.challenge || null,
            solution: data.solution || null,
            metrics: data.metrics || null,
            tech_stack: data.tech_stack_raw
                ? data.tech_stack_raw
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                : [],
            live_url: data.live_url || null,
            github_url: data.github_url || null,
            thumbnail_media_id: data.thumbnail_media_id || null,
            is_featured: data.is_featured,
            is_visible: data.is_visible,
            sort_order: Number(data.sort_order) || 0,
        };

        transform(() => payload);
        if (editingProject) {
            put(`/dashboard/projects/${editingProject.id}`, {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm();
                    toast.success('Project updated.');
                },
            });
        } else {
            post('/dashboard/projects', {
                preserveScroll: true,
                onSuccess: () => {
                    closeForm();
                    toast.success('Project created.');
                },
            });
        }
    };

    const deleteProject = (project: Project) => {
        if (!window.confirm(`Delete project "${project.title}"?`)) return;
        router.delete(`/dashboard/projects/${project.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Project deleted.'),
        });
    };

    return (
        <>
            <Head title="Projects & Case Studies" />
            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={branding?.backgroundImage?.url}
                branding={branding}
            >
                <div className="admin-page flex h-full flex-col gap-4 overflow-hidden">
                    <AdminPageHeader
                        icon={<FolderGit2 className="size-4" />}
                        title="Projects & Case Studies"
                        description="Manage portfolio project showcases, technical architecture highlights, and metrics."
                        actions={
                            <Button size="sm" onClick={openCreate}>
                                <Plus className="size-3.5" />
                                Add Project
                            </Button>
                        }
                    />

                    {/* Search Bar */}
                    <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {projects.total}{' '}
                            {projects.total === 1 ? 'project' : 'projects'}{' '}
                            total
                        </p>
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full max-w-xs"
                        >
                            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search title, tagline, description..."
                                className="h-8 pl-8 text-xs"
                            />
                        </form>
                    </div>

                    {/* Table View */}
                    <section className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border/40 bg-background/30">
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-16">
                                            Preview
                                        </TableHead>
                                        <TableHead>Project</TableHead>
                                        <TableHead>Tech Stack</TableHead>
                                        <TableHead>Links</TableHead>
                                        <TableHead className="w-20">
                                            Order
                                        </TableHead>
                                        <TableHead className="w-24">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {projects.data.length ? (
                                        projects.data.map((project) => (
                                            <TableRow key={project.id}>
                                                <TableCell>
                                                    <div className="flex size-11 items-center justify-center overflow-hidden rounded-md border border-border bg-muted/40">
                                                        {project.thumbnail_media
                                                            ?.url ? (
                                                            <img
                                                                src={
                                                                    project
                                                                        .thumbnail_media
                                                                        .url
                                                                }
                                                                alt={
                                                                    project.title
                                                                }
                                                                className="size-full object-cover"
                                                            />
                                                        ) : (
                                                            <ImageIcon className="size-4 text-muted-foreground/60" />
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-xs min-w-0 sm:max-w-sm">
                                                        <div className="flex items-center gap-2">
                                                            <p className="text-sm font-semibold text-foreground">
                                                                {project.title}
                                                            </p>
                                                            {project.is_featured && (
                                                                <Badge
                                                                    variant="default"
                                                                    className="px-1.5 py-0 text-[9px]"
                                                                >
                                                                    Featured
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        {project.tagline && (
                                                            <p className="truncate text-xs text-muted-foreground">
                                                                {
                                                                    project.tagline
                                                                }
                                                            </p>
                                                        )}
                                                        {project.metrics && (
                                                            <p className="mt-0.5 truncate font-mono text-[10px] text-primary/80">
                                                                {
                                                                    project.metrics
                                                                }
                                                            </p>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex max-w-xs flex-wrap gap-1">
                                                        {project.tech_stack
                                                            ?.slice(0, 4)
                                                            .map((tech) => (
                                                                <span
                                                                    key={tech}
                                                                    className="rounded border border-border/80 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                                                                >
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        {project.tech_stack &&
                                                            project.tech_stack
                                                                .length > 4 && (
                                                                <span className="font-mono text-[10px] text-muted-foreground">
                                                                    +
                                                                    {project
                                                                        .tech_stack
                                                                        .length -
                                                                        4}
                                                                </span>
                                                            )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        {project.live_url && (
                                                            <a
                                                                href={
                                                                    project.live_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-muted-foreground hover:text-foreground"
                                                                title="Live URL"
                                                            >
                                                                <ExternalLink className="size-3.5" />
                                                            </a>
                                                        )}
                                                        {project.github_url && (
                                                            <a
                                                                href={
                                                                    project.github_url
                                                                }
                                                                target="_blank"
                                                                rel="noreferrer"
                                                                className="text-muted-foreground hover:text-foreground"
                                                                title="GitHub Repository"
                                                            >
                                                                <GitHubIcon className="size-3.5" />
                                                            </a>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {project.sort_order}
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            project.is_visible
                                                                ? 'default'
                                                                : 'secondary'
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {project.is_visible
                                                            ? 'Visible'
                                                            : 'Hidden'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-7"
                                                            title="Edit"
                                                            onClick={() =>
                                                                openEdit(
                                                                    project,
                                                                )
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
                                                                deleteProject(
                                                                    project,
                                                                )
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
                                                No projects found. Add your
                                                first showcase project.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {projects.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border/40 p-2 text-xs text-muted-foreground">
                                <span>
                                    Page {projects.current_page} of{' '}
                                    {projects.last_page} ({projects.total}{' '}
                                    projects)
                                </span>
                                <div className="flex items-center gap-1">
                                    {projects.links.map((link, idx) => (
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

            {/* Create/Edit Project Modal */}
            <Dialog
                open={isFormOpen}
                onOpenChange={(open) => !open && closeForm()}
            >
                <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>
                            {editingProject ? 'Edit Project' : 'New Project'}
                        </DialogTitle>
                        <DialogDescription>
                            Configure project showcase parameters, technical
                            challenges, and live demos.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                        <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_title">Title *</Label>
                                <Input
                                    id="p_title"
                                    value={data.title}
                                    onChange={(e) =>
                                        setData('title', e.target.value)
                                    }
                                    placeholder="e.g. Distributed Task Orchestrator"
                                    required
                                />
                                {errors.title && (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="p_slug">
                                    Custom Slug (optional)
                                </Label>
                                <Input
                                    id="p_slug"
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
                                <Label htmlFor="p_order">Sort Order</Label>
                                <Input
                                    id="p_order"
                                    type="number"
                                    value={data.sort_order}
                                    onChange={(e) =>
                                        setData(
                                            'sort_order',
                                            Number(e.target.value),
                                        )
                                    }
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_tagline">Tagline</Label>
                                <Input
                                    id="p_tagline"
                                    value={data.tagline}
                                    onChange={(e) =>
                                        setData('tagline', e.target.value)
                                    }
                                    placeholder="One-line elevator pitch or core achievement"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_tech">
                                    Tech Stack (comma separated)
                                </Label>
                                <Input
                                    id="p_tech"
                                    value={data.tech_stack_raw}
                                    onChange={(e) =>
                                        setData(
                                            'tech_stack_raw',
                                            e.target.value,
                                        )
                                    }
                                    placeholder="React, Laravel, Redis, PostgreSQL, Docker"
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="p_live">Live Demo URL</Label>
                                <Input
                                    id="p_live"
                                    type="url"
                                    value={data.live_url}
                                    onChange={(e) =>
                                        setData('live_url', e.target.value)
                                    }
                                    placeholder="https://..."
                                />
                            </div>

                            <div className="space-y-1.5">
                                <Label htmlFor="p_github">
                                    GitHub Repository URL
                                </Label>
                                <Input
                                    id="p_github"
                                    type="url"
                                    value={data.github_url}
                                    onChange={(e) =>
                                        setData('github_url', e.target.value)
                                    }
                                    placeholder="https://github.com/..."
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_thumb">Thumbnail Media</Label>
                                <select
                                    id="p_thumb"
                                    value={data.thumbnail_media_id ?? ''}
                                    onChange={(e) =>
                                        setData(
                                            'thumbnail_media_id',
                                            e.target.value
                                                ? Number(e.target.value)
                                                : null,
                                        )
                                    }
                                    className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm"
                                >
                                    <option value="">
                                        No thumbnail selected
                                    </option>
                                    {mediaItems.map((m) => (
                                        <option key={m.id} value={m.id}>
                                            {m.original_name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_metrics">
                                    Key Metrics / Impact
                                </Label>
                                <Input
                                    id="p_metrics"
                                    value={data.metrics}
                                    onChange={(e) =>
                                        setData('metrics', e.target.value)
                                    }
                                    placeholder="e.g. Handled 10M daily requests with 99.99% uptime"
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_desc">
                                    Detailed Description
                                </Label>
                                <textarea
                                    id="p_desc"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    className="min-h-20 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    placeholder="Summary of what the project does..."
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_chal">
                                    Technical Challenge
                                </Label>
                                <textarea
                                    id="p_chal"
                                    value={data.challenge}
                                    onChange={(e) =>
                                        setData('challenge', e.target.value)
                                    }
                                    className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    placeholder="The hard technical problem faced..."
                                />
                            </div>

                            <div className="space-y-1.5 sm:col-span-2">
                                <Label htmlFor="p_sol">
                                    Architectural Solution
                                </Label>
                                <textarea
                                    id="p_sol"
                                    value={data.solution}
                                    onChange={(e) =>
                                        setData('solution', e.target.value)
                                    }
                                    className="min-h-16 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm"
                                    placeholder="How you designed and resolved the bottleneck..."
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 border-t border-border/60 pt-3">
                            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={data.is_visible}
                                    onChange={(e) =>
                                        setData('is_visible', e.target.checked)
                                    }
                                />
                                Show on public portfolio
                            </label>

                            <label className="flex cursor-pointer items-center gap-2 text-xs font-medium">
                                <input
                                    type="checkbox"
                                    checked={data.is_featured}
                                    onChange={(e) =>
                                        setData('is_featured', e.target.checked)
                                    }
                                />
                                Mark as Featured Case Study
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
                                    : editingProject
                                      ? 'Save Project'
                                      : 'Create Project'}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
