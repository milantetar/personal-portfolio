import React, { useRef, useState } from 'react';
import { router } from '@inertiajs/react';
import { Check, FolderOpen, Pencil, Plus, Trash2, Upload } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useMediaUpload } from '@/hooks/use-media-upload';
import type { Branding, Media } from '@/types';

interface PolymorphicThemeHubProps {
    branding?: Branding;
    allMedia: Media[];
}

type SlotType = 'logo' | 'background' | 'avatar';

export function PolymorphicThemeHub({ branding, allMedia }: PolymorphicThemeHubProps) {
    const [activePickerSlot, setActivePickerSlot] = useState<SlotType | null>(null);
    const [selectedMediaId, setSelectedMediaId] = useState<number | null>(null);
    const [isSavingSlot, setIsSavingSlot] = useState(false);

    // Site Title Editing
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [siteTitle, setSiteTitle] = useState(branding?.siteName || "Milan's Portfolio");
    const [isSavingTitle, setIsSavingTitle] = useState(false);

    // Upload hooks for the 3 slots
    const logoUpload = useMediaUpload();
    const bgUpload = useMediaUpload();
    const avatarUpload = useMediaUpload();

    const logoInputRef = useRef<HTMLInputElement>(null);
    const bgInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    // Handle Direct File Upload for a slot
    const handleDirectUpload = async (slot: SlotType, file: File) => {
        const uploader = slot === 'logo' ? logoUpload : slot === 'background' ? bgUpload : avatarUpload;
        const slotLabel = slot === 'logo' ? 'Logo' : slot === 'background' ? 'Backdrop' : 'Avatar';

        toast.loading(`Uploading ${slotLabel}...`, { id: `upload-${slot}` });

        const result = await uploader.upload(file, {
            title: `${slot.toUpperCase()} - ${file.name}`,
            usage: slot,
        });

        if (result) {
            router.reload({
                only: ['branding', 'mediaItems'],
                onSuccess: () => {
                    uploader.clearPreview();
                    toast.success(`${slotLabel} updated.`, { id: `upload-${slot}` });
                },
                onError: () => {
                    toast.error(`Failed to assign ${slotLabel}.`, { id: `upload-${slot}` });
                },
            });
        } else {
            toast.error(uploader.error || `Upload failed for ${slotLabel}`, { id: `upload-${slot}` });
        }
    };

    // Assign existing media to slot
    const handleAssignSlot = () => {
        if (!activePickerSlot || !selectedMediaId) return;

        const slotLabel = activePickerSlot === 'logo' ? 'Logo' : activePickerSlot === 'background' ? 'Backdrop' : 'Avatar';
        setIsSavingSlot(true);
        toast.loading(`Activating ${slotLabel}...`, { id: 'assign-slot' });

        router.post(
            `/dashboard/media/${selectedMediaId}/assign-slot`,
            { slot: activePickerSlot },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActivePickerSlot(null);
                    setSelectedMediaId(null);
                    setIsSavingSlot(false);
                    toast.success(`${slotLabel} activated.`, { id: 'assign-slot' });
                },
                onError: () => {
                    setIsSavingSlot(false);
                    toast.error(`Failed to activate ${slotLabel}.`, { id: 'assign-slot' });
                },
            }
        );
    };

    // Clear a slot
    const handleClearSlot = (slot: SlotType) => {
        const slotLabel = slot === 'logo' ? 'Logo' : slot === 'background' ? 'Backdrop' : 'Avatar';
        router.post(
            '/dashboard/media/clear-slot',
            { slot },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Cleared ${slotLabel}.`, { id: `clear-${slot}` });
                },
            }
        );
    };

    // Save Site Title
    const handleSaveTitle = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmed = siteTitle.trim();
        if (!trimmed) {
            toast.error('Site name cannot be empty.');
            return;
        }

        setIsSavingTitle(true);
        router.post(
            '/dashboard/branding/settings',
            { site_name: trimmed },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setIsEditingTitle(false);
                    setIsSavingTitle(false);
                    toast.success('Site name updated.');
                },
                onError: () => {
                    setIsSavingTitle(false);
                    toast.error('Failed to update site name.');
                },
            }
        );
    };

    return (
        <section aria-label="Portfolio brand assets" className="admin-branding-hub mb-6 rounded-lg border border-border bg-card p-4">
            {/* Hidden file inputs */}
            <input
                ref={logoInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDirectUpload('logo', file);
                    e.target.value = '';
                }}
            />
            <input
                ref={bgInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDirectUpload('background', file);
                    e.target.value = '';
                }}
            />
            <input
                ref={avatarInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleDirectUpload('avatar', file);
                    e.target.value = '';
                }}
            />

            <header className="admin-branding-hub-header">
                <div>
                    <p className="eyebrow">Media assignments</p>
                    <h2 className="mt-1 text-sm font-semibold">Portfolio identity</h2>
                    <p className="mt-1 text-xs text-muted-foreground">Set the public logo, backdrop, and avatar from your media library.</p>
                </div>
                <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-foreground uppercase tracking-wider">Brand</span>
                {isEditingTitle ? (
                    <form onSubmit={handleSaveTitle} className="flex items-center gap-1.5">
                        <Input
                            value={siteTitle}
                            onChange={(e) => setSiteTitle(e.target.value)}
                            className="h-7 w-44 border-border bg-card text-xs text-foreground placeholder:text-foreground"
                            placeholder="Site name..."
                            autoFocus
                        />
                        <Button
                            size="xs"
                            type="submit"
                            disabled={isSavingTitle}
                            className="h-7 border border-border bg-muted/40 px-2 text-xs text-foreground bg-accent/40"
                        >
                            Save
                        </Button>
                        <Button
                            size="xs"
                            type="button"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-foreground hover:text-foreground"
                            onClick={() => {
                                setSiteTitle(branding?.siteName || "Milan's Portfolio");
                                setIsEditingTitle(false);
                            }}
                        >
                            Cancel
                        </Button>
                    </form>
                ) : (
                    <button
                        onClick={() => setIsEditingTitle(true)}
                        className="group flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium text-foreground hover:bg-muted/40 transition-colors"
                        title="Click to rename"
                    >
                        <span>{branding?.siteName || "Milan's Portfolio"}</span>
                        <Pencil className="size-3 text-foreground/30 group-hover:text-foreground transition-colors" />
                    </button>
                )}
                </div>
            </header>

            <div className="admin-branding-slots text-xs text-foreground">
                {/* Slot 1: Logo */}
                <div className="flex items-center gap-2">
                    <span className="text-foreground">Logo</span>
                    <div
                        className="relative group size-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden hover:border-border transition-colors cursor-pointer"
                        title={branding?.logo ? 'Click to change logo' : 'Upload logo'}
                    >
                        {branding?.logo?.url ? (
                            <>
                                <img src={branding.logo.url} alt="Logo" className="size-full object-contain p-1" />
                                <div className="absolute inset-0 bg-card opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <button
                                        onClick={() => logoInputRef.current?.click()}
                                        className="p-1 text-foreground hover:text-foreground"
                                        title="Upload new"
                                    >
                                        <Upload className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => setActivePickerSlot('logo')}
                                        className="p-1 text-foreground hover:text-foreground"
                                        title="Choose from library"
                                    >
                                        <FolderOpen className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => handleClearSlot('logo')}
                                        className="p-1 text-destructive hover:text-destructive"
                                        title="Remove"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => logoInputRef.current?.click()}
                                className="size-full flex items-center justify-center text-foreground hover:text-foreground"
                            >
                                <Plus className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="h-3.5 w-px bg-muted/40" />

                {/* Slot 2: Backdrop */}
                <div className="flex items-center gap-2">
                    <span className="text-foreground">Backdrop</span>
                    <div
                        className="relative group w-12 h-8 rounded-lg border border-border bg-muted/40 flex items-center justify-center overflow-hidden hover:border-border transition-colors cursor-pointer"
                        title={branding?.backgroundImage ? 'Click to change backdrop' : 'Upload backdrop'}
                    >
                        {branding?.backgroundImage?.url ? (
                            <>
                                <img src={branding.backgroundImage.url} alt="Backdrop" className="size-full object-cover" />
                                <div className="absolute inset-0 bg-card opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <button
                                        onClick={() => bgInputRef.current?.click()}
                                        className="p-1 text-foreground hover:text-foreground"
                                        title="Upload new"
                                    >
                                        <Upload className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => setActivePickerSlot('background')}
                                        className="p-1 text-foreground hover:text-foreground"
                                        title="Choose from library"
                                    >
                                        <FolderOpen className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => handleClearSlot('background')}
                                        className="p-1 text-destructive hover:text-destructive"
                                        title="Reset"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => bgInputRef.current?.click()}
                                className="size-full flex items-center justify-center text-foreground hover:text-foreground"
                            >
                                <Plus className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="h-3.5 w-px bg-muted/40" />

                {/* Slot 3: Avatar */}
                <div className="flex items-center gap-2">
                    <span className="text-foreground">Avatar</span>
                    <div
                        className="relative group size-8 rounded-full border border-border bg-muted/40 flex items-center justify-center overflow-hidden hover:border-border transition-colors cursor-pointer"
                        title={branding?.avatar ? 'Click to change avatar' : 'Upload avatar'}
                    >
                        {branding?.avatar?.url ? (
                            <>
                                <img src={branding.avatar.url} alt="Avatar" className="size-full object-cover" />
                                <div className="absolute inset-0 bg-card opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="p-1 text-foreground hover:text-foreground"
                                        title="Upload new"
                                    >
                                        <Upload className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => setActivePickerSlot('avatar')}
                                        className="p-1 text-foreground hover:text-foreground"
                                        title="Choose from library"
                                    >
                                        <FolderOpen className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => handleClearSlot('avatar')}
                                        className="p-1 text-destructive hover:text-destructive"
                                        title="Remove"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="size-full flex items-center justify-center text-foreground hover:text-foreground"
                            >
                                <Plus className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Media Selector Modal */}
            <Dialog
                open={activePickerSlot !== null}
                onOpenChange={(open) => {
                    if (!open) {
                        setActivePickerSlot(null);
                        setSelectedMediaId(null);
                    }
                }}
            >
                <DialogContent className="max-w-xl border border-border bg-card text-foreground backdrop-blur-none shadow-none">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Select {activePickerSlot === 'logo' ? 'Logo' : activePickerSlot === 'background' ? 'Backdrop' : 'Avatar'}
                        </DialogTitle>
                        <DialogDescription className="text-foreground">
                            Choose an existing file from your media library.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-80 overflow-y-auto py-2">
                        {allMedia.length === 0 ? (
                            <p className="py-8 text-center text-xs text-foreground">
                                No images found in library.
                            </p>
                        ) : (
                            <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                                {allMedia.map((item) => {
                                    const isSelected = selectedMediaId === item.id;
                                    const isCurrentSlot =
                                        (activePickerSlot === 'logo' && branding?.logo?.id === item.id) ||
                                        (activePickerSlot === 'background' && branding?.backgroundImage?.id === item.id) ||
                                        (activePickerSlot === 'avatar' && branding?.avatar?.id === item.id);

                                    return (
                                        <button
                                            key={item.id}
                                            type="button"
                                            onClick={() => setSelectedMediaId(item.id)}
                                            className={`
                                                group relative flex flex-col overflow-hidden rounded-lg border p-1.5 text-left transition-all
                                                ${isSelected
                                                    ? 'border-border bg-muted/40 ring-1 ring-primary/30'
                                                    : 'border-border bg-muted/40 hover:border-border hover:bg-muted/40'
                                                }
                                            `}
                                        >
                                            <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded bg-card">
                                                <img
                                                    src={item.url}
                                                    alt={item.alt_text || item.original_name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <p className="mt-1 truncate text-[11px] text-foreground">
                                                {item.original_name}
                                            </p>

                                            {isCurrentSlot && (
                                                <span className="absolute right-1.5 top-1.5 rounded-full border border-border bg-card p-0.5 text-emerald-300">
                                                    <Check className="size-2.5" />
                                                </span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            size="sm"
                            className="border-border bg-muted/40 text-foreground hover:bg-muted/40 text-xs"
                            onClick={() => {
                                setActivePickerSlot(null);
                                setSelectedMediaId(null);
                            }}
                        >
                            Cancel
                        </Button>
                        <Button
                            size="sm"
                            onClick={handleAssignSlot}
                            disabled={!selectedMediaId || isSavingSlot}
                            className="border border-border bg-muted/40 text-foreground bg-accent/40 text-xs"
                        >
                            {isSavingSlot ? 'Saving...' : 'Apply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </section>
    );
}
