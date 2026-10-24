import { useState } from 'react';
import { Link, router } from '@inertiajs/react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, MoreVertical, Pencil, Plus, Settings2, Trash2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { SidebarItem } from '@/types';

import { SidebarItemFormModal } from './sidebar-item-form';
import { cn } from '@/lib/utils';

interface SidebarProps {
    items: SidebarItem[];
}

export function Sidebar({ items }: SidebarProps) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<SidebarItem | null>(null);
    const [deleteItem, setDeleteItem] = useState<SidebarItem | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const settingsItem = items.find((item) => item.url === '/dashboard/settings' || item.url === 'dashboard/settings');
    const navigationItems = settingsItem
        ? items.map((item) => item === settingsItem ? { ...item, url: '/dashboard/settings' } : item)
        : [...items, { id: -1, label: 'Site Settings', url: '/dashboard/settings', icon_media_id: null }];

    const openAddModal = () => {
        setEditingItem(null);
        setIsFormOpen(true);
    };

    const openEditModal = (item: SidebarItem) => {
        setEditingItem(item);
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
            <aside
                className={cn(
                    'flex h-full flex-col border-r border-white/10 bg-black/25 backdrop-blur-xl transition-all duration-300',
                    isCollapsed ? 'w-16' : 'w-52'
                )}
            >
                <div className="flex h-14 items-center justify-between px-3.5 border-b border-white/10">
                    {!isCollapsed && (
                        <span className="text-xs font-semibold text-white/70 uppercase tracking-wider truncate">
                            Control Menu
                        </span>
                    )}
                    <div className="flex items-center gap-1">
                        {!isCollapsed && (
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={openAddModal}
                                className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                                title="Add item"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        )}
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="h-8 w-8 text-white/60 hover:text-white hover:bg-white/10 rounded-lg"
                        >
                            {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
                        </Button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1">
                    {navigationItems.map((item) => (
                        <div
                            key={item.id}
                            className={cn(
                                'group flex items-center justify-between rounded-xl px-2.5 py-2 hover:bg-white/10 text-white/80 hover:text-white transition-colors',
                                isCollapsed ? 'justify-center' : ''
                            )}
                        >
                            <div className="flex items-center gap-2.5 flex-1 overflow-hidden">
                                {item.id === -1 ? (
                                    <Settings2 className="h-4 w-4 shrink-0 text-white/50" />
                                ) : item.icon_media?.url ? (
                                    <div className="relative h-4 w-4 shrink-0">
                                        <img 
                                            src={item.icon_media.url} 
                                            alt={item.label} 
                                            className="h-full w-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                        <ImageIcon className="hidden absolute inset-0 h-4 w-4 text-white/50" />
                                    </div>
                                ) : (
                                    <ImageIcon className="h-4 w-4 shrink-0 text-white/50" />
                                )}
                                
                                <Link
                                    href={item.url}
                                    className={cn("text-sm font-medium truncate", isCollapsed && "hidden")}
                                >
                                    {item.label}
                                </Link>
                            </div>

                            {item.id === -1 ? null : isCollapsed ? (
                                <span className="h-1.5 w-1.5 rounded-full bg-white/40" /> 
                            ) : (
                                <DropdownMenu>
                                    <DropdownMenuTrigger
                                        render={
                                            <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-lg text-white/60 hover:text-white hover:bg-white/10">
                                                <MoreVertical className="h-3.5 w-3.5" />
                                            </button>
                                        }
                                    />
                                    <DropdownMenuContent align="end" className="border-white/15 bg-black/90 text-white backdrop-blur-xl">
                                        <DropdownMenuItem
                                            className="cursor-pointer gap-2 hover:bg-white/10"
                                            onClick={() => openEditModal(item)}
                                        >
                                            <Pencil className="h-3.5 w-3.5 text-blue-300" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="cursor-pointer gap-2 text-red-400 hover:bg-red-500/20 focus:text-red-300"
                                            onClick={() => setDeleteItem(item)}
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    ))}
                </div>
            </aside>

            <SidebarItemFormModal
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                item={editingItem}
            />

            <Dialog open={!!deleteItem} onOpenChange={(open) => !open && setDeleteItem(null)}>
                <DialogContent className="border-white/15 bg-black/85 text-white backdrop-blur-2xl shadow-2xl sm:max-w-100">
                    <DialogHeader>
                        <DialogTitle className="text-white">Delete Item</DialogTitle>
                        <DialogDescription className="text-white/60">
                            Are you sure you want to delete <strong className="text-white">{deleteItem?.label}</strong>? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-3 pt-4">
                        <Button
                            variant="outline"
                            className="border-white/15 bg-white/5 text-white hover:bg-white/10"
                            onClick={() => setDeleteItem(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            className="bg-red-500/80 hover:bg-red-500 text-white"
                            onClick={handleDelete}
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
