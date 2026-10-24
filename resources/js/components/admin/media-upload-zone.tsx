import { LoaderCircle, UploadCloud } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MediaUploadZoneProps {
    id?: string;
    error?: string | null;
    isUploading: boolean;
    onFileSelected: (file: File) => void;
}

export function MediaUploadZone({ error, id = 'file-upload', isUploading, onFileSelected }: MediaUploadZoneProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) onFileSelected(file);
        event.target.value = '';
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <Input
                    accept="image/svg+xml,image/jpeg,image/png,image/gif,image/webp,image/avif"
                    className="hidden"
                    disabled={isUploading}
                    id={id}
                    onChange={handleChange}
                    type="file"
                />
                <Label
                    className={cn(
                        'flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed border-muted-foreground/25 px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:border-primary hover:bg-primary/5 hover:text-primary',
                        isUploading && 'pointer-events-none opacity-50',
                    )}
                    htmlFor={id}
                >
                    {isUploading ? (
                        <><LoaderCircle className="h-4 w-4 animate-spin" /> Uploading...</>
                    ) : (
                        <><UploadCloud className="h-4 w-4" /> Upload new image</>
                    )}
                </Label>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
