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
                    className="hidden"
                    accept="image/svg+xml, image/jpeg, image/png"
                    onChange={handleUpload}
                    disabled={isUploading}
                />
                <Label
                    htmlFor="library-upload"
                    className={cn(
                        "flex cursor-pointer items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90",
                        isUploading && "pointer-events-none opacity-50"
                    )}
                >
                    {isUploading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
                    {isUploading ? 'Uploading...' : 'Upload New Media'}
                </Label>
            </div>

            {/* Grid */}
            {items.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl bg-card/30 backdrop-blur-sm">
                    <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium text-foreground">No media found</h3>
                    <p className="text-sm text-muted-foreground mt-1">Upload some files to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {items.map((item) => (
                        <div key={item.id} className="group relative aspect-square rounded-xl border border-border bg-card/50 backdrop-blur-sm overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
                            <div className="absolute inset-0 flex items-center justify-center p-4">
                                {item.url ? (
                                    <img src={item.url} alt={item.original_name} className="max-h-full max-w-full object-contain" />
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                                )}
                            </div>
                            
                            {/* Overlay for actions */}
                            <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-3">
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
                                <div className="text-white">
                                    <p className="text-xs font-medium truncate" title={item.original_name}>
                                        {item.original_name}
                                    </p>
                                    <p className="text-[10px] text-white/70">
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