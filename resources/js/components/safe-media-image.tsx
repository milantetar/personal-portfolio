import { useState } from 'react';
import { ImageOff } from 'lucide-react';

import { OptimizedImage } from '@/components/optimized-image';
import { cn } from '@/lib/utils';

interface SafeMediaImageProps {
    source: string;
    alt: string;
    className?: string;
    displayWidth?: number;
}

export function SafeMediaImage({
    source,
    alt,
    className,
    displayWidth,
}: SafeMediaImageProps) {
    const [failedSource, setFailedSource] = useState<string | null>(null);

    if (failedSource === source) {
        return (
            <span
                role="img"
                aria-label={`${alt} unavailable`}
                className={cn(
                    className,
                    'flex items-center justify-center bg-muted/40 text-muted-foreground',
                )}
            >
                <ImageOff className="size-5" aria-hidden="true" />
            </span>
        );
    }

    return (
        <OptimizedImage
            src={source}
            alt={alt}
            width={displayWidth || 160}
            height={displayWidth || 160}
            className={className}
            onError={() => setFailedSource(source)}
        />
    );
}
