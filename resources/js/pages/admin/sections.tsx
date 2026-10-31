import { Head, router, useForm, usePage } from '@inertiajs/react';
import {
    BadgeCheck,
    Eye,
    EyeOff,
    FilePlus2,
    ImagePlus,
    Layers3,
    LayoutTemplate,
    LoaderCircle,
    Pencil,
    Plus,
    Search,
    Trash2,
} from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminGlassPanel } from '@/components/admin/admin-glass-panel';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { TechnologyBrandIcon } from '@/components/portfolio/technology-brand-icon';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { automaticTechnologyIconUrl } from '@/lib/technology-icons';
import type {
    PageProps,
    PortfolioSection,
    PortfolioSectionType,
} from '@/types';

interface SectionsPageProps extends PageProps {
    sections: PortfolioSection[];
}

interface SectionForm {
    slug: string;
    type: PortfolioSectionType;
    title: string;
    eyebrow: string;
    content: string;
    sort_order: number;
    is_visible: boolean;
}

type VisibilityFilter = 'all' | 'visible' | 'hidden';

interface SkillTechnology {
    name: string;
    icon_url: string | null;
}

interface SkillGroup {
    name: string;
    technologies: SkillTechnology[];
}

function parseSkillGroups(
    content: Record<string, unknown> | null,
): SkillGroup[] {
    const skills = content?.skills;
    if (Array.isArray(skills)) {
        const groups: unknown[] = skills;
        return groups.flatMap((group): SkillGroup[] => {
            if (!group || typeof group !== 'object') return [];
            const value = group as { name?: unknown; technologies?: unknown };
            if (
                typeof value.name !== 'string' ||
                !Array.isArray(value.technologies)
            )
                return [];

            const technologyEntries = value.technologies as unknown[];
            return [
                {
                    name: value.name,
                    technologies: technologyEntries.flatMap(
                        (technology): SkillTechnology[] => {
                            if (!technology || typeof technology !== 'object')
                                return [];
                            const entry = technology as {
                                name?: unknown;
                                icon_url?: unknown;
                            };
                            return typeof entry.name === 'string'
                                ? [
                                      {
                                          name: entry.name,
                                          icon_url:
                                              typeof entry.icon_url === 'string'
                                                  ? entry.icon_url
                                                  : null,
                                      },
                                  ]
                                : [];
                        },
                    ),
                },
            ];
        });
    }

    if (typeof content?.body !== 'string') return [];

    return content.body
        .split(/\n\s*\n/)
        .map((block) => {
            const [name = '', ...technologies] = block
                .split('\n')
                .map((line) => line.trim())
                .filter(Boolean);
            return {
                name,
                technologies: technologies.map((technology) => ({
                    name: technology
                        .replace(/\s*[-:]\s*\d{1,3}%?$/, '')
                        .replace(/\s+\(\d{1,3}%\)$/, '')
                        .trim(),
                    icon_url: null,
                })),
            };
        })
        .filter((group) => group.name);
}

function TechnologyIconField({
    id,
    technology,
    onChange,
}: {
    id: string;
    technology: SkillTechnology;
    onChange: (technology: SkillTechnology) => void;
}) {
    const { upload, isUploading, error } = useMediaUpload();
    const hasAutomaticIcon = Boolean(
        automaticTechnologyIconUrl(technology.name),
    );

    const uploadIcon = async (file: File | undefined) => {
        if (!file) return;
        const media = await upload(file, {
            title: `${technology.name || 'Technology'} icon`,
            alt_text: `${technology.name || 'Technology'} logo`,
            usage: 'portfolio_skill_icon',
        });
        if (media) onChange({ ...technology, icon_url: media.url });
    };

    return (
        <div className="min-w-0 flex-1">
            <div className="flex min-w-0 items-center gap-2">
                <Input
                    value={technology.name}
                    onChange={(event) =>
                        onChange({ ...technology, name: event.target.value })
                    }
                    placeholder="Technology name"
                    aria-label="Technology name"
                />
                <div className="flex shrink-0 items-center gap-2">
                    {technology.name ? (
                        <TechnologyBrandIcon
                            name={technology.name}
                            iconUrl={technology.icon_url}
                            className="size-8 rounded border border-border bg-background p-1"
                        />
                    ) : null}
                    <Input
                        id={id}
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        className="sr-only"
                        onChange={(event) => {
                            void uploadIcon(event.target.files?.[0]);
                            event.target.value = '';
                        }}
                        disabled={isUploading}
                    />
                    <Label
                        htmlFor={id}
                        className={`inline-flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium whitespace-nowrap text-foreground transition-colors hover:bg-accent ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                        title={
                            technology.icon_url
                                ? 'Replace custom icon'
                                : 'Upload a custom icon'
                        }
                    >
                        {isUploading ? (
                            <LoaderCircle className="size-4 animate-spin" />
                        ) : (
                            <ImagePlus className="size-4" />
                        )}
                        <span>
                            {isUploading
                                ? 'Uploading'
                                : technology.icon_url
                                  ? 'Replace icon'
                                  : hasAutomaticIcon
                                    ? 'Custom icon'
                                    : 'Add icon'}
                        </span>
                    </Label>
                </div>
            </div>
            {error ? (
                <p role="alert" className="mt-1 text-xs text-destructive">
                    {error}
                </p>
            ) : null}
        </div>
    );
}

const sectionTypes: PortfolioSectionType[] = [
    'hero',
    'about',
    'skills',
    'experience',
    'projects',
    'certifications',
    'contact',
    'custom',
];

const emptyForm: SectionForm = {
    slug: '',
    type: 'custom',
    title: '',
    eyebrow: '',
    content: '{\n  "body": ""\n}',
    sort_order: 80,
    is_visible: true,
};

export default function SectionsPage() {
    const { sections, sidebarItems, branding } =
        usePage<SectionsPageProps>().props;
    const [editing, setEditing] = useState<PortfolioSection | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [visibility, setVisibility] = useState<VisibilityFilter>('all');
    const [skillGroups, setSkillGroups] = useState<SkillGroup[]>([]);
    const { data, setData, post, put, processing, reset, errors } =
        useForm<SectionForm>(emptyForm);

    const counts = useMemo(
        () => ({
            total: sections.length,
            visible: sections.filter((section) => section.is_visible).length,
            hidden: sections.filter((section) => !section.is_visible).length,
        }),
        [sections],
    );

    const filteredSections = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sections.filter((section) => {
            const matchesSearch =
                !query ||
                [section.title, section.slug, section.type, section.eyebrow]
                    .filter((value): value is string => Boolean(value))
                    .some((value) => value.toLowerCase().includes(query));
            const matchesVisibility =
                visibility === 'all' ||
                (visibility === 'visible'
                    ? section.is_visible
                    : !section.is_visible);

            return matchesSearch && matchesVisibility;
        });
    }, [search, sections, visibility]);

    const openForm = (section?: PortfolioSection) => {
        setEditing(section ?? null);
        setSkillGroups(section ? parseSkillGroups(section.content) : []);
        setData(
            section
                ? {
                      slug: section.slug,
                      type: section.type,
                      title: section.title ?? '',
                      eyebrow: section.eyebrow ?? '',
                      content: JSON.stringify(section.content ?? {}, null, 2),
                      sort_order: section.sort_order,
                      is_visible: section.is_visible,
                  }
                : emptyForm,
        );
        setIsFormOpen(true);
    };

    const updateSkillGroups = (groups: SkillGroup[]) => {
        setSkillGroups(groups);
        setData('content', JSON.stringify({ skills: groups }, null, 2));
    };

    const closeForm = () => {
        if (processing) return;
        setEditing(null);
        setIsFormOpen(false);
        reset();
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsFormOpen(false);
                setEditing(null);
                reset();
                toast.success(
                    editing ? 'Section updated.' : 'Section created.',
                );
            },
        };

        if (editing) put(`/dashboard/sections/${editing.id}`, options);
        else post('/dashboard/sections', options);
    };

    const toggleVisibility = (section: PortfolioSection) => {
        router.put(
            `/dashboard/sections/${section.id}`,
            {
                slug: section.slug,
                type: section.type,
                title: section.title ?? '',
                eyebrow: section.eyebrow ?? '',
                content: JSON.stringify(section.content ?? {}),
                sort_order: section.sort_order,
                is_visible: !section.is_visible,
            },
            {
                preserveScroll: true,
                onSuccess: () =>
                    toast.success(
                        section.is_visible
                            ? 'Section hidden.'
                            : 'Section published.',
                    ),
            },
        );
    };

    const remove = (section: PortfolioSection) => {
        if (
            !window.confirm(
                `Delete “${section.title || section.slug}”? This cannot be undone.`,
            )
        )
            return;

        router.delete(`/dashboard/sections/${section.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Section deleted.'),
        });
    };

    return (
        <>
            <Head title="Portfolio Sections" />
            <AdminLayout
                sidebarItems={sidebarItems ?? []}
                backgroundUrl={branding?.backgroundImage?.url}
                branding={branding}
            >
                <div className="admin-page admin-sections-page mx-auto w-full max-w-7xl space-y-6 text-foreground">
                    <AdminPageHeader
                        icon={<LayoutTemplate className="size-5" />}
                        title="Homepage sections"
                        description="Edit the content blocks, publishing status, and order of your public portfolio."
                        actions={
                            <Button onClick={() => openForm()}>
                                <Plus className="size-4" />
                                Add section
                            </Button>
                        }
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                        <AdminGlassPanel className="flex items-center gap-3 p-4">
                            <span className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground">
                                <Layers3 className="size-4" />
                            </span>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Total sections
                                </p>
                                <p className="mt-0.5 text-xl font-semibold tabular-nums">
                                    {counts.total}
                                </p>
                            </div>
                        </AdminGlassPanel>
                        <AdminGlassPanel className="flex items-center gap-3 p-4">
                            <span className="flex size-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary">
                                <Eye className="size-4" />
                            </span>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Published
                                </p>
                                <p className="mt-0.5 text-xl font-semibold tabular-nums">
                                    {counts.visible}
                                </p>
                            </div>
                        </AdminGlassPanel>
                        <AdminGlassPanel className="flex items-center gap-3 p-4">
                            <span className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground">
                                <EyeOff className="size-4" />
                            </span>
                            <div>
                                <p className="text-xs text-muted-foreground">
                                    Hidden drafts
                                </p>
                                <p className="mt-0.5 text-xl font-semibold tabular-nums">
                                    {counts.hidden}
                                </p>
                            </div>
                        </AdminGlassPanel>
                    </div>

                    <AdminGlassPanel className="overflow-hidden">
                        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">
                                    Section list
                                </h2>
                                <p className="mt-1 text-xs text-muted-foreground">
                                    Lower order numbers appear earlier on the
                                    homepage.
                                </p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <Search
                                        className="pointer-events-none absolute top-2.5 left-3 size-4 text-muted-foreground"
                                        aria-hidden="true"
                                    />
                                    <Input
                                        aria-label="Search homepage sections"
                                        value={search}
                                        onChange={(event) =>
                                            setSearch(event.target.value)
                                        }
                                        placeholder="Search by title, slug, or type"
                                        className="h-9 pl-9"
                                    />
                                </div>
                                <Select
                                    value={visibility}
                                    onValueChange={(value) =>
                                        setVisibility(value as VisibilityFilter)
                                    }
                                >
                                    <SelectTrigger
                                        aria-label="Filter sections by visibility"
                                        className="w-full sm:w-40"
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">
                                            All statuses
                                        </SelectItem>
                                        <SelectItem value="visible">
                                            Published
                                        </SelectItem>
                                        <SelectItem value="hidden">
                                            Hidden
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <p
                                    className="text-xs whitespace-nowrap text-muted-foreground"
                                    aria-live="polite"
                                >
                                    {filteredSections.length} of{' '}
                                    {sections.length} sections
                                </p>
                            </div>
                        </div>

                        {sections.length === 0 ? (
                            <div className="flex flex-col items-center px-6 py-14 text-center">
                                <span className="flex size-11 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground">
                                    <FilePlus2 className="size-5" />
                                </span>
                                <h3 className="mt-4 text-sm font-semibold">
                                    No homepage sections yet
                                </h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">
                                    Add a section to start building the public
                                    homepage.
                                </p>
                                <Button
                                    className="mt-4"
                                    size="sm"
                                    onClick={() => openForm()}
                                >
                                    <Plus className="size-4" />
                                    Add section
                                </Button>
                            </div>
                        ) : filteredSections.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-medium">
                                    No sections match these filters.
                                </p>
                                <Button
                                    className="mt-3"
                                    size="sm"
                                    variant="outline"
                                    onClick={() => {
                                        setSearch('');
                                        setVisibility('all');
                                    }}
                                >
                                    Clear filters
                                </Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table className="min-w-[760px]">
                                    <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                                        <TableRow>
                                            <TableHead className="w-[38%]">
                                                Section
                                            </TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="w-24">
                                                Order
                                            </TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-36 text-right">
                                                Actions
                                            </TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSections.map((section) => (
                                            <TableRow
                                                key={section.id}
                                                className="group"
                                            >
                                                <TableCell>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">
                                                            {section.title ||
                                                                section.slug}
                                                        </p>
                                                        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                                                            /{section.slug}
                                                            {section.eyebrow
                                                                ? ` · ${section.eyebrow}`
                                                                : ''}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex rounded-sm border border-border px-2 py-1 font-mono text-[10px] tracking-wide text-muted-foreground uppercase">
                                                        {section.type}
                                                    </span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground tabular-nums">
                                                    {String(
                                                        section.sort_order,
                                                    ).padStart(2, '0')}
                                                </TableCell>
                                                <TableCell>
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 text-xs ${section.is_visible ? 'text-primary' : 'text-muted-foreground'}`}
                                                    >
                                                        {section.is_visible ? (
                                                            <BadgeCheck className="size-3.5" />
                                                        ) : (
                                                            <EyeOff className="size-3.5" />
                                                        )}
                                                        {section.is_visible
                                                            ? 'Published'
                                                            : 'Hidden'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            aria-label={`${section.is_visible ? 'Hide' : 'Publish'} ${section.title || section.slug}`}
                                                            title={
                                                                section.is_visible
                                                                    ? 'Hide section'
                                                                    : 'Publish section'
                                                            }
                                                            onClick={() =>
                                                                toggleVisibility(
                                                                    section,
                                                                )
                                                            }
                                                        >
                                                            {section.is_visible ? (
                                                                <EyeOff className="size-4" />
                                                            ) : (
                                                                <Eye className="size-4" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            aria-label={`Edit ${section.title || section.slug}`}
                                                            title="Edit section"
                                                            onClick={() =>
                                                                openForm(
                                                                    section,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button
                                                            type="button"
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                                                            aria-label={`Delete ${section.title || section.slug}`}
                                                            title="Delete section"
                                                            onClick={() =>
                                                                remove(section)
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </AdminGlassPanel>
                </div>
            </AdminLayout>

            <Dialog
                open={isFormOpen}
                onOpenChange={(open) => !open && closeForm()}
            >
                <DialogContent className="max-h-[90dvh] max-w-2xl overflow-y-auto p-0">
                    <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
                        <DialogTitle>
                            {editing
                                ? 'Edit homepage section'
                                : 'Add homepage section'}
                        </DialogTitle>
                        <DialogDescription>
                            Set the section identity, visibility, order, and
                            content used by the homepage renderer.
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        onSubmit={submit}
                        className="space-y-5 px-5 py-5 sm:px-6"
                    >
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="section-title">Title</Label>
                                <Input
                                    id="section-title"
                                    value={data.title}
                                    onChange={(event) =>
                                        setData('title', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.title)}
                                />
                                {errors.title ? (
                                    <p className="text-xs text-destructive">
                                        {errors.title}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-slug">Slug</Label>
                                <Input
                                    id="section-slug"
                                    value={data.slug}
                                    onChange={(event) =>
                                        setData('slug', event.target.value)
                                    }
                                    placeholder="case-studies"
                                    aria-invalid={Boolean(errors.slug)}
                                />
                                {errors.slug ? (
                                    <p className="text-xs text-destructive">
                                        {errors.slug}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Lowercase letters, numbers, and hyphens.
                                    </p>
                                )}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-type">
                                    Section type
                                </Label>
                                <Select
                                    value={data.type}
                                    onValueChange={(value) =>
                                        setData(
                                            'type',
                                            value as PortfolioSectionType,
                                        )
                                    }
                                >
                                    <SelectTrigger
                                        id="section-type"
                                        className="w-full"
                                        aria-invalid={Boolean(errors.type)}
                                    >
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {sectionTypes.map((type) => (
                                            <SelectItem key={type} value={type}>
                                                {type}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.type ? (
                                    <p className="text-xs text-destructive">
                                        {errors.type}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-eyebrow">
                                    Eyebrow label
                                </Label>
                                <Input
                                    id="section-eyebrow"
                                    value={data.eyebrow}
                                    onChange={(event) =>
                                        setData('eyebrow', event.target.value)
                                    }
                                    placeholder="Optional short label"
                                    aria-invalid={Boolean(errors.eyebrow)}
                                />
                                {errors.eyebrow ? (
                                    <p className="text-xs text-destructive">
                                        {errors.eyebrow}
                                    </p>
                                ) : null}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-order">
                                    Display order
                                </Label>
                                <Input
                                    id="section-order"
                                    type="number"
                                    min="0"
                                    max="10000"
                                    value={data.sort_order}
                                    onChange={(event) =>
                                        setData(
                                            'sort_order',
                                            Number(event.target.value),
                                        )
                                    }
                                    aria-invalid={Boolean(errors.sort_order)}
                                />
                                {errors.sort_order ? (
                                    <p className="text-xs text-destructive">
                                        {errors.sort_order}
                                    </p>
                                ) : (
                                    <p className="text-xs text-muted-foreground">
                                        Smaller values appear first.
                                    </p>
                                )}
                            </div>
                            <label className="flex items-center gap-3 self-end rounded-md border border-border px-3 py-2.5 text-sm">
                                <input
                                    type="checkbox"
                                    checked={data.is_visible}
                                    onChange={(event) =>
                                        setData(
                                            'is_visible',
                                            event.target.checked,
                                        )
                                    }
                                    className="size-4 accent-primary"
                                />
                                <span>
                                    <span className="block font-medium">
                                        Publish section
                                    </span>
                                    <span className="mt-0.5 block text-xs text-muted-foreground">
                                        Show it on the public homepage
                                    </span>
                                </span>
                            </label>
                        </div>
                        {data.type === 'skills' ? (
                            <div className="space-y-4">
                                <div>
                                    <h3 className="text-sm font-medium">
                                        Technology groups
                                    </h3>
                                    <p className="mt-1 text-xs text-muted-foreground">
                                        Known technologies receive matching
                                        logos automatically. Upload a custom
                                        icon to override one. Custom icons are
                                        stored in your Media Library.
                                    </p>
                                </div>
                                {skillGroups.map((group, groupIndex) => (
                                    <section
                                        key={`group-${groupIndex}`}
                                        className="space-y-3 rounded-lg border border-border bg-card/40 p-3 sm:p-4"
                                    >
                                        <div className="flex items-center gap-2">
                                            <Input
                                                value={group.name}
                                                onChange={(event) =>
                                                    updateSkillGroups(
                                                        skillGroups.map(
                                                            (item, index) =>
                                                                index ===
                                                                groupIndex
                                                                    ? {
                                                                          ...item,
                                                                          name: event
                                                                              .target
                                                                              .value,
                                                                      }
                                                                    : item,
                                                        ),
                                                    )
                                                }
                                                placeholder="Group name, e.g. Backend"
                                                aria-label="Skill group name"
                                            />
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="icon-sm"
                                                aria-label={`Remove ${group.name || 'skill group'}`}
                                                onClick={() =>
                                                    updateSkillGroups(
                                                        skillGroups.filter(
                                                            (_, index) =>
                                                                index !==
                                                                groupIndex,
                                                        ),
                                                    )
                                                }
                                            >
                                                <Trash2 className="size-4" />
                                            </Button>
                                        </div>
                                        <div className="space-y-2">
                                            {group.technologies.map(
                                                (
                                                    technology,
                                                    technologyIndex,
                                                ) => (
                                                    <div
                                                        key={`technology-${groupIndex}-${technologyIndex}`}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <TechnologyIconField
                                                            id={`technology-icon-${groupIndex}-${technologyIndex}`}
                                                            technology={
                                                                technology
                                                            }
                                                            onChange={(
                                                                updated,
                                                            ) =>
                                                                updateSkillGroups(
                                                                    skillGroups.map(
                                                                        (
                                                                            item,
                                                                            index,
                                                                        ) =>
                                                                            index ===
                                                                            groupIndex
                                                                                ? {
                                                                                      ...item,
                                                                                      technologies:
                                                                                          item.technologies.map(
                                                                                              (
                                                                                                  entry,
                                                                                                  entryIndex,
                                                                                              ) =>
                                                                                                  entryIndex ===
                                                                                                  technologyIndex
                                                                                                      ? updated
                                                                                                      : entry,
                                                                                          ),
                                                                                  }
                                                                                : item,
                                                                    ),
                                                                )
                                                            }
                                                        />
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="icon-sm"
                                                            aria-label={`Remove ${technology.name || 'technology'}`}
                                                            onClick={() =>
                                                                updateSkillGroups(
                                                                    skillGroups.map(
                                                                        (
                                                                            item,
                                                                            index,
                                                                        ) =>
                                                                            index ===
                                                                            groupIndex
                                                                                ? {
                                                                                      ...item,
                                                                                      technologies:
                                                                                          item.technologies.filter(
                                                                                              (
                                                                                                  _,
                                                                                                  entryIndex,
                                                                                              ) =>
                                                                                                  entryIndex !==
                                                                                                  technologyIndex,
                                                                                          ),
                                                                                  }
                                                                                : item,
                                                                    ),
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-4" />
                                                        </Button>
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="outline"
                                            onClick={() =>
                                                updateSkillGroups(
                                                    skillGroups.map(
                                                        (item, index) =>
                                                            index === groupIndex
                                                                ? {
                                                                      ...item,
                                                                      technologies:
                                                                          [
                                                                              ...item.technologies,
                                                                              {
                                                                                  name: '',
                                                                                  icon_url:
                                                                                      null,
                                                                              },
                                                                          ],
                                                                  }
                                                                : item,
                                                    ),
                                                )
                                            }
                                        >
                                            <Plus className="size-4" />
                                            Add technology
                                        </Button>
                                    </section>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() =>
                                        updateSkillGroups([
                                            ...skillGroups,
                                            {
                                                name: '',
                                                technologies: [
                                                    {
                                                        name: '',
                                                        icon_url: null,
                                                    },
                                                ],
                                            },
                                        ])
                                    }
                                >
                                    <Plus className="size-4" />
                                    Add technology group
                                </Button>
                                {errors.content ? (
                                    <p className="text-xs text-destructive">
                                        {errors.content}
                                    </p>
                                ) : null}
                            </div>
                        ) : (
                            <div className="space-y-1.5">
                                <Label htmlFor="section-content">
                                    Section content (JSON)
                                </Label>
                                <textarea
                                    id="section-content"
                                    value={data.content}
                                    onChange={(event) =>
                                        setData('content', event.target.value)
                                    }
                                    aria-invalid={Boolean(errors.content)}
                                    aria-describedby="section-content-help"
                                    spellCheck={false}
                                    className="min-h-52 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-6 transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive"
                                />
                                {errors.content ? (
                                    <p className="text-xs text-destructive">
                                        {errors.content}
                                    </p>
                                ) : (
                                    <p
                                        id="section-content-help"
                                        className="text-xs text-muted-foreground"
                                    >
                                        Use valid JSON. The renderer reads
                                        fields such as{' '}
                                        <code className="font-mono text-foreground">
                                            body
                                        </code>{' '}
                                        and{' '}
                                        <code className="font-mono text-foreground">
                                            description
                                        </code>
                                        .
                                    </p>
                                )}
                            </div>
                        )}
                        <DialogFooter className="-mx-5 -mb-5 border-border px-5 py-4 sm:-mx-6 sm:px-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeForm}
                                disabled={processing}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={processing}>
                                {processing
                                    ? 'Saving…'
                                    : editing
                                      ? 'Save section'
                                      : 'Create section'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
