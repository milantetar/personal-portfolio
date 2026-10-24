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
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-white/10 bg-black/20 px-4 py-2.5 backdrop-blur-md">
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

            {/* Left: Brand Name */}
            <div className="flex items-center gap-2.5">
                <span className="text-xs font-medium text-white/40 uppercase tracking-wider">Brand</span>
                {isEditingTitle ? (
                    <form onSubmit={handleSaveTitle} className="flex items-center gap-1.5">
                        <Input
                            value={siteTitle}
                            onChange={(e) => setSiteTitle(e.target.value)}
                            className="h-7 w-44 border-white/20 bg-black/40 text-xs text-white placeholder:text-white/40"
                            placeholder="Site name..."
                            autoFocus
                        />
                        <Button
                            size="xs"
                            type="submit"
                            disabled={isSavingTitle}
                            className="h-7 border border-white/20 bg-white/15 px-2 text-xs text-white hover:bg-white/25"
                        >
                            Save
                        </Button>
                        <Button
                            size="xs"
                            type="button"
                            variant="ghost"
                            className="h-7 px-2 text-xs text-white/60 hover:text-white"
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
                        className="group flex items-center gap-1.5 rounded px-2 py-1 text-sm font-medium text-white hover:bg-white/5 transition-colors"
                        title="Click to rename"
                    >
                        <span>{branding?.siteName || "Milan's Portfolio"}</span>
                        <Pencil className="size-3 text-white/30 group-hover:text-white/70 transition-colors" />
                    </button>
                )}
            </div>

            {/* Right: The 3 Minimal Media Slots */}
            <div className="flex items-center gap-4 text-xs text-white/60">
                {/* Slot 1: Logo */}
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Logo</span>
                    <div
                        className="relative group size-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center overflow-hidden hover:border-white/30 transition-colors cursor-pointer"
                        title={branding?.logo ? 'Click to change logo' : 'Upload logo'}
                    >
                        {branding?.logo?.url ? (
                            <>
                                <img src={branding.logo.url} alt="Logo" className="size-full object-contain p-1" />
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <button
                                        onClick={() => logoInputRef.current?.click()}
                                        className="p-1 text-white/80 hover:text-white"
                                        title="Upload new"
                                    >
                                        <Upload className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => setActivePickerSlot('logo')}
                                        className="p-1 text-white/80 hover:text-white"
                                        title="Choose from library"
                                    >
                                        <FolderOpen className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => handleClearSlot('logo')}
                                        className="p-1 text-red-400 hover:text-red-300"
                                        title="Remove"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => logoInputRef.current?.click()}
                                className="size-full flex items-center justify-center text-white/40 hover:text-white"
                            >
                                <Plus className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="h-3.5 w-px bg-white/10" />

                {/* Slot 2: Backdrop */}
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Backdrop</span>
                    <div
                        className="relative group w-12 h-8 rounded-lg border border-white/15 bg-white/5 flex items-center justify-center overflow-hidden hover:border-white/30 transition-colors cursor-pointer"
                        title={branding?.backgroundImage ? 'Click to change backdrop' : 'Upload backdrop'}
                    >
                        {branding?.backgroundImage?.url ? (
                            <>
                                <img src={branding.backgroundImage.url} alt="Backdrop" className="size-full object-cover" />
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <button
                                        onClick={() => bgInputRef.current?.click()}
                                        className="p-1 text-white/80 hover:text-white"
                                        title="Upload new"
                                    >
                                        <Upload className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => setActivePickerSlot('background')}
                                        className="p-1 text-white/80 hover:text-white"
                                        title="Choose from library"
                                    >
                                        <FolderOpen className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => handleClearSlot('background')}
                                        className="p-1 text-red-400 hover:text-red-300"
                                        title="Reset"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => bgInputRef.current?.click()}
                                className="size-full flex items-center justify-center text-white/40 hover:text-white"
                            >
                                <Plus className="size-3.5" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="h-3.5 w-px bg-white/10" />

                {/* Slot 3: Avatar */}
                <div className="flex items-center gap-2">
                    <span className="text-white/40">Avatar</span>
                    <div
                        className="relative group size-8 rounded-full border border-white/15 bg-white/5 flex items-center justify-center overflow-hidden hover:border-white/30 transition-colors cursor-pointer"
                        title={branding?.avatar ? 'Click to change avatar' : 'Upload avatar'}
                    >
                        {branding?.avatar?.url ? (
                            <>
                                <img src={branding.avatar.url} alt="Avatar" className="size-full object-cover" />
                                <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1 transition-opacity">
                                    <button
                                        onClick={() => avatarInputRef.current?.click()}
                                        className="p-1 text-white/80 hover:text-white"
                                        title="Upload new"
                                    >
                                        <Upload className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => setActivePickerSlot('avatar')}
                                        className="p-1 text-white/80 hover:text-white"
                                        title="Choose from library"
                                    >
                                        <FolderOpen className="size-3" />
                                    </button>
                                    <button
                                        onClick={() => handleClearSlot('avatar')}
                                        className="p-1 text-red-400 hover:text-red-300"
                                        title="Remove"
                                    >
                                        <Trash2 className="size-3" />
                                    </button>
                                </div>
                            </>
                        ) : (
                            <button
                                onClick={() => avatarInputRef.current?.click()}
                                className="size-full flex items-center justify-center text-white/40 hover:text-white"
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
                <DialogContent className="max-w-xl border border-white/15 bg-black/85 text-white backdrop-blur-2xl shadow-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-white">
                            Select {activePickerSlot === 'logo' ? 'Logo' : activePickerSlot === 'background' ? 'Backdrop' : 'Avatar'}
                        </DialogTitle>
                        <DialogDescription className="text-white/60">
                            Choose an existing file from your media library.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="max-h-80 overflow-y-auto py-2">
                        {allMedia.length === 0 ? (
                            <p className="py-8 text-center text-xs text-white/40">
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
                                                    ? 'border-white/50 bg-white/15 ring-1 ring-white/30'
                                                    : 'border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10'
                                                }
                                            `}
                                        >
                                            <div className="flex h-20 w-full items-center justify-center overflow-hidden rounded bg-black/40">
                                                <img
                                                    src={item.url}
                                                    alt={item.alt_text || item.original_name}
                                                    className="h-full w-full object-contain"
                                                />
                                            </div>
                                            <p className="mt-1 truncate text-[11px] text-white/80">
                                                {item.original_name}
                                            </p>

                                            {isCurrentSlot && (
                                                <span className="absolute right-1.5 top-1.5 rounded-full border border-white/20 bg-black/70 p-0.5 text-emerald-300">
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
                            className="border-white/15 bg-white/5 text-white hover:bg-white/10 text-xs"
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
                            className="border border-white/20 bg-white/20 text-white hover:bg-white/30 text-xs"
                        >
                            {isSavingSlot ? 'Saving...' : 'Apply'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
