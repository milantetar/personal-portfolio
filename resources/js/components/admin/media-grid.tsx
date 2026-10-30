import { useState } from 'react';
import { router } from '@inertiajs/react';
import { Trash2, Image as ImageIcon, UploadCloud, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MediaItem {
    id: number;
    url: string;
    original_name: string;
    size: number;
}

export function MediaGrid({ items = [] }: { items: MediaItem[] }) {
    const [isUploading, setIsUploading] = useState(false);

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
            const response = await fetch('/dashboard/media', {
                method: 'POST',
                headers: { 
                    'X-CSRF-TOKEN': csrfToken || '', 
                    'Accept': 'application/json' 
                },
                body: formData,
            });

            if (response.ok) {
                // Reload only the mediaItems prop to refresh the grid
                router.reload({ only: ['mediaItems'] });
            } else {
                alert('Upload failed');
            }
        } catch (err) {
            console.error(err);
            alert('An error occurred during upload');
        } finally {
            setIsUploading(false);
            e.target.value = ''; // Reset file input
        }
    };

    const handleDelete = (id: number) => {
        if (!confirm('Are you sure you want to permanently delete this file?')) return;
        router.delete(`/dashboard/media/${id}`, {
            preserveScroll: true,
        });
    };

    return (
        <div className="space-y-6">
            {/* Upload Area */}
            <div className="flex justify-end">
                 <Input
                    type="file"
                    id="library-upload"
                    className="peer sr-only"
                    accept="image/svg+xml, image/jpeg, image/png"
                    onChange={handleUpload}
                    disabled={isUploading}
                />
                <Label
                    htmlFor="library-upload"
                    className={cn(
                        "flex min-h-9 cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90 peer-focus-visible:ring-2 peer-focus-visible:ring-ring",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                >
                    {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Upload New Media'}
                </Label>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <div className="rounded-md border border-dashed border-border px-4 py-12 text-center">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No media found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Upload some files to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                    {items.map((item) => (
                        <div key={item.id} className="group relative aspect-square overflow-hidden rounded-md border border-border bg-card transition-colors hover:border-primary/50">
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                {item.url ? (
                                    <img src={item.url} alt={item.original_name} loading="lazy" width="240" height="240" className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            
                            {/* Overlay for actions */}
                            <div className="absolute inset-0 flex flex-col justify-between bg-card p-3 opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
                                <div className="flex justify-end">
                                    <Button 
                                        variant="destructive" 
                                        size="icon" 
                                        className="h-8 w-8"
                                        onClick={() => handleDelete(item.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                                <div className="text-foreground">
                                    <p className="text-xs font-medium truncate" title={item.original_name}>
                                        {item.original_name}
                                    </p>
                                    <p className="text-[10px] text-foreground">
                                        {(item.size / 1024).toFixed(1)} KB
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
