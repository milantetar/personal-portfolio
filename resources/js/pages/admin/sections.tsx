import { Head, router, useForm, usePage } from '@inertiajs/react';
import { BadgeCheck, Eye, EyeOff, FilePlus2, Layers3, LayoutTemplate, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { type FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminGlassPanel } from '@/components/admin/admin-glass-panel';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { PageProps, PortfolioSection, PortfolioSectionType } from '@/types';

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
    const { sections, sidebarItems, branding } = usePage<SectionsPageProps>().props;
    const [editing, setEditing] = useState<PortfolioSection | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [visibility, setVisibility] = useState<VisibilityFilter>('all');
    const { data, setData, post, put, processing, reset, errors } = useForm<SectionForm>(emptyForm);

    const counts = useMemo(() => ({
        total: sections.length,
        visible: sections.filter((section) => section.is_visible).length,
        hidden: sections.filter((section) => !section.is_visible).length,
    }), [sections]);

    const filteredSections = useMemo(() => {
        const query = search.trim().toLowerCase();

        return sections.filter((section) => {
            const matchesSearch = !query || [section.title, section.slug, section.type, section.eyebrow]
                .filter((value): value is string => Boolean(value))
                .some((value) => value.toLowerCase().includes(query));
            const matchesVisibility = visibility === 'all' || (visibility === 'visible' ? section.is_visible : !section.is_visible);

            return matchesSearch && matchesVisibility;
        });
    }, [search, sections, visibility]);

    const openForm = (section?: PortfolioSection) => {
        setEditing(section ?? null);
        setData(section ? {
            slug: section.slug,
            type: section.type,
            title: section.title ?? '',
            eyebrow: section.eyebrow ?? '',
            content: JSON.stringify(section.content ?? {}, null, 2),
            sort_order: section.sort_order,
            is_visible: section.is_visible,
        } : emptyForm);
        setIsFormOpen(true);
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
                toast.success(editing ? 'Section updated.' : 'Section created.');
            },
        };

        if (editing) put(`/dashboard/sections/${editing.id}`, options);
        else post('/dashboard/sections', options);
    };

    const toggleVisibility = (section: PortfolioSection) => {
        router.put(`/dashboard/sections/${section.id}`, {
            slug: section.slug,
            type: section.type,
            title: section.title ?? '',
            eyebrow: section.eyebrow ?? '',
            content: JSON.stringify(section.content ?? {}),
            sort_order: section.sort_order,
            is_visible: !section.is_visible,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(section.is_visible ? 'Section hidden.' : 'Section published.'),
        });
    };

    const remove = (section: PortfolioSection) => {
        if (!window.confirm(`Delete “${section.title || section.slug}”? This cannot be undone.`)) return;

        router.delete(`/dashboard/sections/${section.id}`, {
            preserveScroll: true,
            onSuccess: () => toast.success('Section deleted.'),
        });
    };

    return (
        <>
            <Head title="Portfolio Sections" />
            <AdminLayout sidebarItems={sidebarItems ?? []} backgroundUrl={branding?.backgroundImage?.url} branding={branding}>
                <div className="space-y-6 text-foreground">
                    <AdminPageHeader
                        icon={<LayoutTemplate className="size-5" />}
                        title="Homepage sections"
                        description="Edit the content blocks, publishing status, and order of your public portfolio."
                        actions={<Button onClick={() => openForm()}><Plus className="size-4" />Add section</Button>}
                    />

                    <div className="grid gap-3 sm:grid-cols-3">
                        <AdminGlassPanel className="flex items-center gap-3 p-4">
                            <span className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground"><Layers3 className="size-4" /></span>
                            <div><p className="text-xs text-muted-foreground">Total sections</p><p className="mt-0.5 text-xl font-semibold tabular-nums">{counts.total}</p></div>
                        </AdminGlassPanel>
                        <AdminGlassPanel className="flex items-center gap-3 p-4">
                            <span className="flex size-9 items-center justify-center rounded-md border border-primary/20 bg-primary/10 text-primary"><Eye className="size-4" /></span>
                            <div><p className="text-xs text-muted-foreground">Published</p><p className="mt-0.5 text-xl font-semibold tabular-nums">{counts.visible}</p></div>
                        </AdminGlassPanel>
                        <AdminGlassPanel className="flex items-center gap-3 p-4">
                            <span className="flex size-9 items-center justify-center rounded-md border border-border bg-muted/50 text-muted-foreground"><EyeOff className="size-4" /></span>
                            <div><p className="text-xs text-muted-foreground">Hidden drafts</p><p className="mt-0.5 text-xl font-semibold tabular-nums">{counts.hidden}</p></div>
                        </AdminGlassPanel>
                    </div>

                    <AdminGlassPanel className="overflow-hidden">
                        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
                            <div>
                                <h2 className="text-sm font-semibold">Section list</h2>
                                <p className="mt-1 text-xs text-muted-foreground">Lower order numbers appear earlier on the homepage.</p>
                            </div>
                            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                                <div className="relative w-full sm:w-64">
                                    <Search className="pointer-events-none absolute left-3 top-2.5 size-4 text-muted-foreground" aria-hidden="true" />
                                    <Input
                                        aria-label="Search homepage sections"
                                        value={search}
                                        onChange={(event) => setSearch(event.target.value)}
                                        placeholder="Search by title, slug, or type"
                                        className="h-9 pl-9"
                                    />
                                </div>
                                <Select value={visibility} onValueChange={(value) => setVisibility(value as VisibilityFilter)}>
                                    <SelectTrigger aria-label="Filter sections by visibility" className="w-full sm:w-40">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All statuses</SelectItem>
                                        <SelectItem value="visible">Published</SelectItem>
                                        <SelectItem value="hidden">Hidden</SelectItem>
                                    </SelectContent>
                                </Select>
                                <p className="whitespace-nowrap text-xs text-muted-foreground" aria-live="polite">
                                    {filteredSections.length} of {sections.length} sections
                                </p>
                            </div>
                        </div>

                        {sections.length === 0 ? (
                            <div className="flex flex-col items-center px-6 py-14 text-center">
                                <span className="flex size-11 items-center justify-center rounded-md border border-border bg-muted/40 text-muted-foreground"><FilePlus2 className="size-5" /></span>
                                <h3 className="mt-4 text-sm font-semibold">No homepage sections yet</h3>
                                <p className="mt-1 max-w-sm text-sm text-muted-foreground">Add a section to start building the public homepage.</p>
                                <Button className="mt-4" size="sm" onClick={() => openForm()}><Plus className="size-4" />Add section</Button>
                            </div>
                        ) : filteredSections.length === 0 ? (
                            <div className="px-6 py-12 text-center">
                                <p className="text-sm font-medium">No sections match these filters.</p>
                                <Button className="mt-3" size="sm" variant="outline" onClick={() => { setSearch(''); setVisibility('all'); }}>Clear filters</Button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table className="min-w-[760px]">
                                    <TableHeader className="sticky top-0 z-10 bg-muted/80 backdrop-blur-sm">
                                        <TableRow>
                                            <TableHead className="w-[38%]">Section</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead className="w-24">Order</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-36 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredSections.map((section) => (
                                            <TableRow key={section.id} className="group">
                                                <TableCell>
                                                    <div className="min-w-0">
                                                        <p className="truncate font-medium">{section.title || section.slug}</p>
                                                        <p className="mt-1 truncate font-mono text-[11px] text-muted-foreground">
                                                            /{section.slug}{section.eyebrow ? ` · ${section.eyebrow}` : ''}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <span className="inline-flex rounded-sm border border-border px-2 py-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">{section.type}</span>
                                                </TableCell>
                                                <TableCell className="font-mono text-xs tabular-nums text-muted-foreground">{String(section.sort_order).padStart(2, '0')}</TableCell>
                                                <TableCell>
                                                    <span className={`inline-flex items-center gap-1.5 text-xs ${section.is_visible ? 'text-primary' : 'text-muted-foreground'}`}>
                                                        {section.is_visible ? <BadgeCheck className="size-3.5" /> : <EyeOff className="size-3.5" />}
                                                        {section.is_visible ? 'Published' : 'Hidden'}
                                                    </span>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            type="button"
                                                            size="icon-sm"
                                                            variant="ghost"
                                                            aria-label={`${section.is_visible ? 'Hide' : 'Publish'} ${section.title || section.slug}`}
                                                            title={section.is_visible ? 'Hide section' : 'Publish section'}
                                                            onClick={() => toggleVisibility(section)}
                                                        >
                                                            {section.is_visible ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                                                        </Button>
                                                        <Button type="button" size="icon-sm" variant="ghost" aria-label={`Edit ${section.title || section.slug}`} title="Edit section" onClick={() => openForm(section)}>
                                                            <Pencil className="size-4" />
                                                        </Button>
                                                        <Button type="button" size="icon-sm" variant="ghost" className="text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${section.title || section.slug}`} title="Delete section" onClick={() => remove(section)}>
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

            <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
                <DialogContent className="max-w-2xl p-0">
                    <DialogHeader className="border-b border-border px-5 py-4 sm:px-6">
                        <DialogTitle>{editing ? 'Edit homepage section' : 'Add homepage section'}</DialogTitle>
                        <DialogDescription>Set the section identity, visibility, order, and content used by the homepage renderer.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-5 px-5 py-5 sm:px-6">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-1.5">
                                <Label htmlFor="section-title">Title</Label>
                                <Input id="section-title" value={data.title} onChange={(event) => setData('title', event.target.value)} aria-invalid={Boolean(errors.title)} />
                                {errors.title ? <p className="text-xs text-destructive">{errors.title}</p> : null}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-slug">Slug</Label>
                                <Input id="section-slug" value={data.slug} onChange={(event) => setData('slug', event.target.value)} placeholder="case-studies" aria-invalid={Boolean(errors.slug)} />
                                {errors.slug ? <p className="text-xs text-destructive">{errors.slug}</p> : <p className="text-xs text-muted-foreground">Lowercase letters, numbers, and hyphens.</p>}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-type">Section type</Label>
                                <Select value={data.type} onValueChange={(value) => setData('type', value as PortfolioSectionType)}>
                                    <SelectTrigger id="section-type" className="w-full" aria-invalid={Boolean(errors.type)}><SelectValue /></SelectTrigger>
                                    <SelectContent>{sectionTypes.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                                </Select>
                                {errors.type ? <p className="text-xs text-destructive">{errors.type}</p> : null}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-eyebrow">Eyebrow label</Label>
                                <Input id="section-eyebrow" value={data.eyebrow} onChange={(event) => setData('eyebrow', event.target.value)} placeholder="Optional short label" aria-invalid={Boolean(errors.eyebrow)} />
                                {errors.eyebrow ? <p className="text-xs text-destructive">{errors.eyebrow}</p> : null}
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="section-order">Display order</Label>
                                <Input id="section-order" type="number" min="0" max="10000" value={data.sort_order} onChange={(event) => setData('sort_order', Number(event.target.value))} aria-invalid={Boolean(errors.sort_order)} />
                                {errors.sort_order ? <p className="text-xs text-destructive">{errors.sort_order}</p> : <p className="text-xs text-muted-foreground">Smaller values appear first.</p>}
                            </div>
                            <label className="flex items-center gap-3 self-end rounded-md border border-border px-3 py-2.5 text-sm">
                                <input type="checkbox" checked={data.is_visible} onChange={(event) => setData('is_visible', event.target.checked)} className="size-4 accent-primary" />
                                <span><span className="block font-medium">Publish section</span><span className="mt-0.5 block text-xs text-muted-foreground">Show it on the public homepage</span></span>
                            </label>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="section-content">Section content (JSON)</Label>
                            <textarea
                                id="section-content"
                                value={data.content}
                                onChange={(event) => setData('content', event.target.value)}
                                aria-invalid={Boolean(errors.content)}
                                aria-describedby="section-content-help"
                                spellCheck={false}
                                className="min-h-52 w-full resize-y rounded-md border border-input bg-background px-3 py-2 font-mono text-xs leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive"
                            />
                            {errors.content ? <p className="text-xs text-destructive">{errors.content}</p> : <p id="section-content-help" className="text-xs text-muted-foreground">Use valid JSON. The renderer reads fields such as <code className="font-mono text-foreground">body</code> and <code className="font-mono text-foreground">description</code>.</p>}
                        </div>
                        <DialogFooter className="-mx-5 -mb-5 border-border px-5 py-4 sm:-mx-6 sm:px-6">
                            <Button type="button" variant="outline" onClick={closeForm} disabled={processing}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Saving…' : editing ? 'Save section' : 'Create section'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
