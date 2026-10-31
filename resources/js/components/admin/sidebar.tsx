import { useState } from 'react';
import { Link, router, usePage } from '@inertiajs/react';
import {
    Activity, Award, ChevronLeft, ChevronRight, FolderOpen, Gauge,
    LayoutTemplate, Menu, MoreVertical, PanelLeft, Pencil, Plus, Settings2, Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import type { SidebarItem } from '@/types';
import { cn } from '@/lib/utils';

import { SidebarItemFormModal } from './sidebar-item-form';

interface SidebarProps {
    items: SidebarItem[];
}

interface NavigationEntry {
    label: string;
    href: string;
    icon: typeof Gauge;
    item?: SidebarItem;
}

interface NavigationGroup {
    label: string;
    entries: NavigationEntry[];
}

const corePaths = new Set([
    '/dashboard', '/dashboard/', '/dashboard/analytics', '/dashboard/sections',
    '/dashboard/certificates', '/dashboard/media', '/dashboard/settings', '/dashboard/navigation',
]);

function normalizePath(path: string): string {
    const trimmed = `/${path.replace(/^\/+|\/+$/g, '')}`;
    return trimmed === '/' ? '/dashboard/' : trimmed;
}

function defaultIconFor(item: SidebarItem) {
    const url = normalizePath(item.url).toLowerCase();

    if (url.includes('section')) return LayoutTemplate;
    if (url.includes('media')) return FolderOpen;
    if (url.includes('setting')) return Settings2;
    if (url.includes('certificate')) return Award;

    return PanelLeft;
}

export function Sidebar({ items }: SidebarProps) {
    const { url } = usePage();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SidebarItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<SidebarItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const currentPath = normalizePath(url.split('?')[0]);
    const customItems = items.filter((item) => !corePaths.has(normalizePath(item.url)));

    const groups: NavigationGroup[] = [
        {
            label: 'Workspace',
            entries: [
                { label: 'Overview', href: '/dashboard', icon: Gauge },
                { label: 'Analytics', href: '/dashboard/analytics', icon: Activity },
            ],
        },
        {
            label: 'Portfolio content',
            entries: [
                { label: 'Sections', href: '/dashboard/sections', icon: LayoutTemplate },
                { label: 'Certificates', href: '/dashboard/certificates', icon: Award },
            ],
        },
        {
            label: 'Assets',
            entries: [{ label: 'Media library', href: '/dashboard/media', icon: FolderOpen }],
        },
        {
            label: 'Configuration',
            entries: [
                { label: 'Site settings', href: '/dashboard/settings', icon: Settings2 },
                { label: 'Navigation', href: '/dashboard/navigation', icon: Menu },
            ],
        },
        ...(customItems.length ? [{
            label: 'Navigation links',
            entries: customItems.map((item) => ({ label: item.label, href: item.url, icon: defaultIconFor(item), item })),
        }] : []),
    ];

    const openAddModal = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const handleDelete = () => {
        if (!deleteItem) return;
        setIsDeleting(true);
        router.delete(`/dashboard/sidebar-items/${deleteItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                setDeleteItem(null);
                setIsDeleting(false);
            },
            onError: () => setIsDeleting(false),
        });
    };

    return (
        <>
            <aside className={cn(
                'flex max-h-36 shrink-0 flex-col border-b border-border/80 bg-card/90 md:max-h-none md:border-b-0 md:border-r',
                isCollapsed ? 'md:w-14' : 'md:w-60',
            )}>
                <div className="hidden h-11 shrink-0 items-center justify-between border-b px-3 md:flex">
                    {!isCollapsed && <span className="eyebrow truncate">Workspace</span>}
                    <div className="ml-auto flex items-center gap-1">
                        {!isCollapsed && <Button variant="ghost" size="icon" onClick={openAddModal} className="size-7" title="Add navigation link" aria-label="Add navigation link"><Plus className="size-4" /></Button>}
                        <Button variant="ghost" size="icon" onClick={() => setIsCollapsed(!isCollapsed)} className="size-7" aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
                            {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
                        </Button>
                    </div>
                </div>

                <nav aria-label="Dashboard navigation" className="flex min-h-0 flex-1 flex-row gap-1 overflow-x-auto p-2 md:flex-col md:overflow-x-hidden md:overflow-y-auto">
                    {groups.map((group) => (
                        <section key={group.label} className="flex shrink-0 flex-row gap-1 md:flex-col">
                            {!isCollapsed && <h2 className="hidden px-2 pb-1 pt-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground md:block">{group.label}</h2>}
                            {group.entries.map(({ label, href, icon: Icon, item }) => {
                                const active = currentPath === normalizePath(href);
                                return (
                                    <div key={href} className={cn(
                                        'group flex shrink-0 items-center gap-1 rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground md:w-full',
                                        active && 'bg-accent text-foreground',
                                        isCollapsed ? 'md:justify-center' : 'md:justify-between',
                                    )}>
                                        <Link href={href} prefetch="hover" title={isCollapsed ? label : undefined} aria-current={active ? 'page' : undefined} className={cn('flex min-w-0 flex-1 items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-[color,background-color,transform] duration-150 hover:translate-x-0.5 motion-reduce:transform-none', isCollapsed && 'md:justify-center md:px-0')}>
                                            {item?.icon_media?.url ? (
                                                <img src={item.icon_media.url} alt="" className="size-4 shrink-0 object-contain" />
                                            ) : <Icon className="size-4 shrink-0" aria-hidden="true" />}
                                            <span className={cn('truncate', isCollapsed && 'md:hidden')}>{label}</span>
                                        </Link>
                                        {item && !isCollapsed && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger render={<button aria-label={`Options for ${item.label}`} className="mr-1 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-background hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"><MoreVertical className="size-3.5" /></button>} />
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="gap-2" onClick={() => { setEditingItem(item); setIsFormOpen(true); }}><Pencil className="size-3.5" />Edit</DropdownMenuItem>
                                                    <DropdownMenuItem className="gap-2 text-destructive" onClick={() => setDeleteItem(item)}><Trash2 className="size-3.5" />Delete</DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                );
                            })}
                        </section>
                    ))}
                </nav>
            </aside>

            <SidebarItemFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} item={editingItem} />

            <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Delete navigation link?</DialogTitle>
                        <DialogDescription>“{deleteItem?.label}” will be removed from the dashboard menu.</DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setDeleteItem(null)}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>{isDeleting ? 'Deleting…' : 'Delete link'}</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
