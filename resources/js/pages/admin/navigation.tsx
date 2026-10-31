import { Head, router, useForm, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowUp, ArrowUpRight, GripVertical, Link2, Menu, Pencil, Plus, Trash2 } from 'lucide-react';
import { type DragEvent, type FormEvent, useEffect, useState } from 'react';
import { toast } from 'sonner';

import { AdminGlassPanel } from '@/components/admin/admin-glass-panel';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { NavbarItem, NavbarType, PageProps } from '@/types';

interface NavigationPageProps extends PageProps {
    navbars: NavbarType[];
}

interface NavigationItemForm {
    navbar_id: number;
    label: string;
    url: string;
    order: number;
}

const blankForm: NavigationItemForm = { navbar_id: 0, label: '', url: '', order: 10 };

export default function NavigationPage() {
    const { navbars, sidebarItems, branding } = usePage<NavigationPageProps>().props;
    const [orderedNavbars, setOrderedNavbars] = useState(navbars);
    const [brandTitles, setBrandTitles] = useState<Record<number, string>>({});
    const [savingBrandId, setSavingBrandId] = useState<number | null>(null);
    const [activeNavbar, setActiveNavbar] = useState<NavbarType | null>(null);
    const [editingItem, setEditingItem] = useState<NavbarItem | null>(null);
    const [deletingItem, setDeletingItem] = useState<NavbarItem | null>(null);
    const [isDeletePending, setIsDeletePending] = useState(false);
    const [orderingNavbarId, setOrderingNavbarId] = useState<number | null>(null);
    const [draggedItem, setDraggedItem] = useState<{ navbarId: number; itemId: number } | null>(null);
    const [dropTargetItemId, setDropTargetItemId] = useState<number | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { data, setData, post, put, processing, reset, errors } = useForm<NavigationItemForm>(blankForm);

    useEffect(() => {
        setOrderedNavbars(navbars);
        setBrandTitles(Object.fromEntries(navbars.map((navbar) => [navbar.id, navbar.brand_title ?? ''])) as Record<number, string>);
    }, [navbars]);

    const saveBrandTitle = (event: FormEvent<HTMLFormElement>, navbar: NavbarType) => {
        event.preventDefault();
        setSavingBrandId(navbar.id);
        router.put(`/dashboard/navigation/${navbar.id}/brand`, {
            brand_title: brandTitles[navbar.id]?.trim() || null,
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`${navbar.name} brand title updated.`),
            onError: (validationErrors) => toast.error(Object.values(validationErrors).flat().join(' ') || 'Could not save the brand title.'),
            onFinish: () => setSavingBrandId(null),
        });
    };

    const saveItemOrder = (navbar: NavbarType, items: NavbarItem[]) => {
        const oldItems = orderedNavbars.find((item) => item.id === navbar.id)?.items ?? navbar.items;
        if (items.every((item, index) => item.id === oldItems[index]?.id)) return;

        setOrderedNavbars((current) => current.map((item) => item.id === navbar.id ? { ...item, items } : item));
        setOrderingNavbarId(navbar.id);
        router.put('/dashboard/navigation/reorder', {
            navbar_id: navbar.id,
            item_ids: items.map((item) => item.id),
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Navigation order updated.'),
            onError: (validationErrors) => {
                setOrderedNavbars((current) => current.map((item) => item.id === navbar.id ? { ...item, items: oldItems } : item));
                toast.error(Object.values(validationErrors).flat().join(' ') || 'Could not save the navigation order.');
            },
            onFinish: () => {
                setOrderingNavbarId(null);
                setDraggedItem(null);
                setDropTargetItemId(null);
            },
        });
    };

    const moveItem = (navbar: NavbarType, itemId: number, offset: -1 | 1) => {
        const items = orderedNavbars.find((item) => item.id === navbar.id)?.items ?? navbar.items;
        const fromIndex = items.findIndex((item) => item.id === itemId);
        const toIndex = fromIndex + offset;
        if (fromIndex < 0 || toIndex < 0 || toIndex >= items.length) return;

        const nextItems = [...items];
        [nextItems[fromIndex], nextItems[toIndex]] = [nextItems[toIndex], nextItems[fromIndex]];
        saveItemOrder(navbar, nextItems);
    };

    const handleItemDrop = (event: DragEvent<HTMLTableRowElement>, navbar: NavbarType, targetItemId: number) => {
        event.preventDefault();
        const draggedId = Number(event.dataTransfer.getData('text/plain')) || draggedItem?.itemId;
        if (!draggedId || draggedItem?.navbarId !== navbar.id || draggedId === targetItemId) return;

        const items = orderedNavbars.find((item) => item.id === navbar.id)?.items ?? navbar.items;
        const fromIndex = items.findIndex((item) => item.id === draggedId);
        const toIndex = items.findIndex((item) => item.id === targetItemId);
        if (fromIndex < 0 || toIndex < 0) return;

        const nextItems = [...items];
        const [movedItem] = nextItems.splice(fromIndex, 1);
        nextItems.splice(toIndex, 0, movedItem);
        saveItemOrder(navbar, nextItems);
    };

    const openCreate = (navbar: NavbarType) => {
        setActiveNavbar(navbar);
        setEditingItem(null);
        setData({
            ...blankForm,
            navbar_id: navbar.id,
            order: (Math.max(0, ...navbar.items.map((item) => item.order)) || 0) + 10,
        });
        setIsFormOpen(true);
    };

    const openEdit = (navbar: NavbarType, item: NavbarItem) => {
        setActiveNavbar(navbar);
        setEditingItem(item);
        setData({ navbar_id: navbar.id, label: item.label, url: item.url, order: item.order });
        setIsFormOpen(true);
    };

    const closeForm = () => {
        if (processing) return;
        setIsFormOpen(false);
        setActiveNavbar(null);
        setEditingItem(null);
        reset();
    };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = {
            preserveScroll: true,
            onSuccess: () => {
                setIsFormOpen(false);
                setActiveNavbar(null);
                setEditingItem(null);
                reset();
                toast.success(editingItem ? 'Navigation link updated.' : 'Navigation link added.');
            },
        };

        if (editingItem) {
            put(`/dashboard/navigation/items/${editingItem.id}`, options);
        } else {
            post('/dashboard/navigation/items', options);
        }
    };

    const confirmDelete = () => {
        if (!deletingItem) return;
        setIsDeletePending(true);
        router.delete(`/dashboard/navigation/items/${deletingItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeletingItem(null);
                toast.success('Navigation link deleted.');
            },
            onFinish: () => setIsDeletePending(false),
        });
    };

    return (
        <AdminLayout sidebarItems={sidebarItems} branding={branding}>
            <Head title="Navigation" />
            <div className="admin-page admin-navigation-page space-y-5">
                <AdminPageHeader
                    icon={<Menu className="size-5" />}
                    title="Navigation"
                    description="Manage the links shown in the public portfolio and the dashboard header."
                />

                <div className="grid gap-5 xl:grid-cols-2">
                    {orderedNavbars.map((navbar) => (
                        <AdminGlassPanel key={navbar.id} className="overflow-hidden">
                            <div className="flex items-center justify-between gap-4 border-b border-border/80 p-4 sm:p-5">
                                <div className="flex min-w-0 items-center gap-3">
                                    <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-muted/40 text-primary"><Link2 className="size-4" /></span>
                                    <div className="min-w-0">
                                        <h2 className="truncate text-sm font-semibold">{navbar.name}</h2>
                                        <p className="mt-1 text-xs text-muted-foreground">{navbar.location === 'homepage-header' ? 'Public portfolio header' : 'Dashboard header'} · {navbar.items.length} links</p>
                                    </div>
                                </div>
                                <Button size="sm" onClick={() => openCreate(navbar)}><Plus className="size-4" />Add link</Button>
                            </div>

                            <form onSubmit={(event) => saveBrandTitle(event, navbar)} className="flex flex-col gap-3 border-b border-border/80 bg-muted/15 p-4 sm:flex-row sm:items-end sm:p-5">
                                <div className="min-w-0 flex-1 space-y-1.5">
                                    <Label htmlFor={`navbar-brand-${navbar.id}`}>Brand title</Label>
                                    <Input
                                        id={`navbar-brand-${navbar.id}`}
                                        value={brandTitles[navbar.id] ?? ''}
                                        onChange={(event) => setBrandTitles((current) => ({ ...current, [navbar.id]: event.target.value }))}
                                        placeholder={branding?.siteName || 'Portfolio'}
                                        maxLength={100}
                                    />
                                    <p className="text-xs text-muted-foreground">Leave blank to use the site name from Site Settings.</p>
                                </div>
                                <Button type="submit" size="sm" disabled={savingBrandId === navbar.id}>
                                    {savingBrandId === navbar.id ? 'Saving…' : 'Save brand'}
                                </Button>
                            </form>

                            {navbar.items.length ? (
                                <div>
                                    <div className="overflow-x-auto">
                                        <Table className="min-w-[600px]">
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Label</TableHead>
                                                <TableHead>Destination</TableHead>
                                            <TableHead className="w-28 text-right">Order</TableHead>
                                                <TableHead className="w-24 text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {navbar.items.map((item, index) => (
                                                <TableRow
                                                    key={item.id}
                                                    onDragOver={(event) => {
                                                        if (draggedItem?.navbarId === navbar.id) {
                                                            event.preventDefault();
                                                            event.dataTransfer.dropEffect = 'move';
                                                            setDropTargetItemId(item.id);
                                                        }
                                                    }}
                                                    onDragLeave={() => setDropTargetItemId((current) => current === item.id ? null : current)}
                                                    onDrop={(event) => { handleItemDrop(event, navbar, item.id); setDropTargetItemId(null); }}
                                                    className={`${draggedItem?.itemId === item.id ? 'opacity-50' : ''} ${dropTargetItemId === item.id ? 'bg-accent/60' : ''}`}
                                                >
                                                    <TableCell className="font-medium">{item.label}</TableCell>
                                                    <TableCell><code className="block max-w-52 truncate text-xs text-muted-foreground">{item.url}</code></TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center justify-end gap-1">
                                                            <span className="min-w-4 text-right font-mono text-xs tabular-nums text-muted-foreground">{index + 1}</span>
                                                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${item.label} up`} title="Move up" disabled={index === 0 || orderingNavbarId === navbar.id} onClick={() => moveItem(navbar, item.id, -1)}><ArrowUp className="size-3.5" /></Button>
                                                            <Button type="button" variant="ghost" size="icon-sm" aria-label={`Move ${item.label} down`} title="Move down" disabled={index === navbar.items.length - 1 || orderingNavbarId === navbar.id} onClick={() => moveItem(navbar, item.id, 1)}><ArrowDown className="size-3.5" /></Button>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex justify-end gap-1">
                                                            <Button
                                                                type="button"
                                                                variant="ghost"
                                                                size="icon"
                                                                draggable={orderingNavbarId !== navbar.id}
                                                                disabled={orderingNavbarId === navbar.id}
                                                                aria-label={`Drag ${item.label} to reorder`}
                                                                title="Drag to reorder"
                                                                onDragStart={(event) => {
                                                                    event.dataTransfer.effectAllowed = 'move';
                                                                    event.dataTransfer.setData('text/plain', String(item.id));
                                                                    setDraggedItem({ navbarId: navbar.id, itemId: item.id });
                                                                }}
                                                                onDragEnd={() => { setDraggedItem(null); setDropTargetItemId(null); }}
                                                            >
                                                                <GripVertical className="size-4" />
                                                            </Button>
                                                            <Button type="button" variant="ghost" size="icon" aria-label={`Edit ${item.label}`} onClick={() => openEdit(navbar, item)}><Pencil className="size-4" /></Button>
                                                            <Button type="button" variant="ghost" size="icon" className="text-destructive hover:text-destructive" aria-label={`Delete ${item.label}`} onClick={() => setDeletingItem(item)}><Trash2 className="size-4" /></Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                        </Table>
                                    </div>
                                    <p className="border-t border-border/70 px-4 py-2 text-xs text-muted-foreground">Drag the grip handle to reorder, or use the up and down buttons.</p>
                                </div>
                            ) : (
                                <div className="px-5 py-10 text-center">
                                    <p className="text-sm font-medium">No links in this menu</p>
                                    <p className="mt-1 text-xs text-muted-foreground">Add links to control what appears in this header.</p>
                                </div>
                            )}
                        </AdminGlassPanel>
                    ))}
                </div>

                <AdminGlassPanel className="flex items-start gap-3 p-4 text-xs leading-5 text-muted-foreground">
                    <ArrowUpRight className="mt-0.5 size-4 shrink-0 text-primary" />
                    <p>Use destinations such as <code>/about</code>, <code>/dashboard/analytics</code>, <code>#projects</code>, or a full <code>https://</code> URL. Lower order values appear first.</p>
                </AdminGlassPanel>
            </div>

            <Dialog open={isFormOpen} onOpenChange={(open) => !open && closeForm()}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{editingItem ? 'Edit navigation link' : 'Add navigation link'}</DialogTitle>
                        <DialogDescription>{activeNavbar?.name} · Set the label, destination, and display order.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="navigation-label">Link label</Label>
                            <Input id="navigation-label" autoFocus maxLength={80} value={data.label} onChange={(event) => setData('label', event.target.value)} aria-invalid={Boolean(errors.label)} />
                            {errors.label ? <p className="text-xs text-destructive">{errors.label}</p> : null}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="navigation-url">Destination</Label>
                            <Input id="navigation-url" placeholder="/about or #projects" value={data.url} onChange={(event) => setData('url', event.target.value)} aria-invalid={Boolean(errors.url)} />
                            {errors.url ? <p className="text-xs text-destructive">{errors.url}</p> : null}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="navigation-order">Display order</Label>
                            <Input id="navigation-order" type="number" min={0} max={10000} value={data.order} onChange={(event) => setData('order', Number(event.target.value))} aria-invalid={Boolean(errors.order)} />
                            {errors.order ? <p className="text-xs text-destructive">{errors.order}</p> : null}
                        </div>
                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={closeForm} disabled={processing}>Cancel</Button>
                            <Button type="submit" disabled={processing}>{processing ? 'Saving…' : editingItem ? 'Save changes' : 'Add link'}</Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(deletingItem)} onOpenChange={(open) => !open && setDeletingItem(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Delete navigation link?</DialogTitle>
                        <DialogDescription>“{deletingItem?.label}” will be removed from its navbar.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setDeletingItem(null)} disabled={isDeletePending}>Cancel</Button>
                        <Button variant="destructive" onClick={confirmDelete} disabled={isDeletePending}>{isDeletePending ? 'Deleting…' : 'Delete link'}</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
