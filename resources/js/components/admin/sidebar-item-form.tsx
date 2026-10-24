import { useEffect, type FormEvent } from 'react';

import { useForm } from '@inertiajs/react';
import { Image as ImageIcon, Trash2 } from 'lucide-react';

import { MediaUploadZone } from '@/components/admin/media-upload-zone';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useMediaUpload } from '@/hooks/use-media-upload';
import type { SidebarItem, SidebarItemFormData } from '@/types';

interface SidebarItemFormModalProps {
    isOpen: boolean;
    item?: SidebarItem | null;
    onClose: () => void;
}

const emptyForm: SidebarItemFormData = { label: '', url: '', icon_media_id: null };

export function SidebarItemFormModal({ isOpen, item = null, onClose }: SidebarItemFormModalProps) {
    const isEditing = item !== null;
    const { clearPreview, error: uploadError, isUploading, previewUrl, upload } = useMediaUpload();
    const { clearErrors, data, errors, post, processing, put, reset, setData } = useForm<SidebarItemFormData>(emptyForm);

    const selectedPreviewUrl = previewUrl || item?.icon_media?.url;

    useEffect(() => {
        if (isOpen) {
            setData({ label: item?.label ?? '', url: item?.url ?? '', icon_media_id: item?.icon_media_id ?? null });
            clearErrors();
            return;
        }

        reset();
        clearPreview();
    }, [clearErrors, clearPreview, isOpen, item, reset, setData]);

    const handleFileSelected = async (file: File) => {
        const uploadedMedia = await upload(file);
        if (uploadedMedia) setData('icon_media_id', uploadedMedia.media_id);
    };

    const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { onSuccess: onClose };

        if (isEditing) {
            put(`/dashboard/sidebar-items/${item.id}`, options);
        } else {
            post('/dashboard/sidebar-items', options);
        }
    };

    return (
        <Dialog onOpenChange={(open) => !open && onClose()} open={isOpen}>
            <DialogContent className="max-h-[90vh] overflow-y-auto p-0 sm:max-w-2xl">
                <DialogHeader className="border-b bg-muted/30 px-6 py-5">
                    <DialogTitle className="text-lg">{isEditing ? 'Edit Sidebar Item' : 'Add New Sidebar Item'}</DialogTitle>
                    <DialogDescription>
                        Configure the label, destination, and optional icon for this navigation item.
                    </DialogDescription>
                </DialogHeader>

                <form className="space-y-6 px-6 py-5" onSubmit={handleSubmit}>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-1.5">
                            <Label htmlFor="label">Label</Label>
                            <Input id="label" onChange={(event) => setData('label', event.target.value)} placeholder="e.g., Projects" value={data.label} />
                            {errors.label && <p className="text-xs text-red-500">{errors.label}</p>}
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor="url">URL</Label>
                            <Input id="url" onChange={(event) => setData('url', event.target.value)} placeholder="e.g., /projects" value={data.url} />
                            {errors.url && <p className="text-xs text-red-500">{errors.url}</p>}
                        </div>
                    </div>

                    <div className="space-y-4 rounded-xl border bg-muted/20 p-4">
                        <div>
                            <Label className="text-sm">Icon image</Label>
                            <p className="mt-1 text-xs text-muted-foreground">Upload an SVG or PNG. The preview will appear in the sidebar after saving.</p>
                        </div>
                        {selectedPreviewUrl ? (
                            <div className="flex items-center gap-3 rounded-lg border bg-background p-3 shadow-sm">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded border bg-background">
                                    <img alt="Selected icon preview" className="max-h-full max-w-full object-contain p-1" src={selectedPreviewUrl} />
                                </div>
                                <p className="flex-1 text-sm font-medium">Image selected</p>
                                <Button className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => { setData('icon_media_id', null); clearPreview(); }} size="icon" type="button" variant="ghost">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 px-1 py-1 text-sm italic text-muted-foreground">
                                <ImageIcon className="h-4 w-4" /> No icon selected.
                            </div>
                        )}

                        <MediaUploadZone error={uploadError} isUploading={isUploading} onFileSelected={handleFileSelected} />
                    </div>

                    <DialogFooter className="-mx-6 -mb-5 rounded-none border-t bg-muted/30 px-6 py-4">
                        <Button onClick={onClose} type="button" variant="outline">Cancel</Button>
                        <Button disabled={processing || isUploading} type="submit">
                            {processing ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Item'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

        </Dialog>
    );
}
