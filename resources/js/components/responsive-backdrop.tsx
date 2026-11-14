import { useState } from 'react';

import { FALLBACK_BACKDROP } from '@/config/theme';
import { sizedImageUrl } from '@/lib/media-image';

interface ResponsiveBackdropProps {
    source: string;
    className: string;
}

export function ResponsiveBackdrop({
    source,
    className,
}: ResponsiveBackdropProps) {
    const [failedSource, setFailedSource] = useState<string | null>(null);
    const imageSource = failedSource === source ? FALLBACK_BACKDROP : source;
    const localFallback = imageSource === FALLBACK_BACKDROP;
    const variant = (width: number) =>
        localFallback
            ? `/images/windows-xp-bliss-${width}.webp`
            : sizedImageUrl(imageSource, width);
    const mobileWidths = [480, 768, 960];
    const desktopWidths = localFallback
        ? [768, 1200, 1440, 1920]
        : [768, 1200, 1920];

    return (
        <picture className={className} aria-hidden="true">
            <source
                media="(max-width: 640px)"
                srcSet={mobileWidths
                    .map((width) => `${variant(width)} ${width}w`)
                    .join(', ')}
                sizes="100vw"
            />
            <img
                src={variant(1920)}
                srcSet={desktopWidths
                    .map((width) => `${variant(width)} ${width}w`)
                    .join(', ')}
                sizes="100vw"
                alt=""
                width={1920}
                height={1440}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                onError={() => {
                    if (imageSource !== FALLBACK_BACKDROP) {
                        setFailedSource(source);
                    }
                }}
            />
        </picture>
    );
}
