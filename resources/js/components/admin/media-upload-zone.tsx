import { LoaderCircle, UploadCloud } from 'lucide-react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface MediaUploadZoneProps {
    id?: string;
    error?: string | null;
    isUploading: boolean;
    onFileSelected: (file: File) => void;
    multiple?: boolean;
    onFilesSelected?: (files: File[]) => void;
}

export function MediaUploadZone({
    error,
    id = 'file-upload',
    isUploading,
    multiple = false,
    onFileSelected,
    onFilesSelected,
}: MediaUploadZoneProps) {
    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(event.target.files ?? []);
        if (multiple && files.length > 0 && onFilesSelected)
            onFilesSelected(files);
        else if (files[0]) onFileSelected(files[0]);
        event.target.value = '';
    };

    return (
        <div className="space-y-1">
            <div className="flex items-center gap-3">
                <Input
                    accept="image/jpeg,image/png,image/gif,image/webp,image/avif,image/svg+xml,image/x-icon,image/vnd.microsoft.icon,.ico,application/pdf,audio/mpeg"
                    className="peer sr-only"
                    disabled={isUploading}
                    id={id}
                    multiple={multiple}
                    onChange={handleChange}
                    type="file"
                />
                <Label
                    className={cn(
                        'flex min-h-11 flex-1 cursor-pointer items-center justify-center gap-2 rounded-md border border-dashed border-border px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-ring hover:border-primary/60 hover:bg-accent/40 hover:text-foreground',
                        isUploading && 'pointer-events-none opacity-50',
                    )}
                    htmlFor={id}
                >
                    {isUploading ? (
                        <>
                            <LoaderCircle className="h-4 w-4 animate-spin" />{' '}
                            Uploading...
                        </>
                    ) : (
                        <>
                            <UploadCloud className="h-4 w-4" />{' '}
                            {multiple
                                ? 'Upload multiple files'
                                : 'Upload new image'}
                        </>
                    )}
                </Label>
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}
