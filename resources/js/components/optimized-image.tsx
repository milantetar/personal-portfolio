import { forwardRef, type ImgHTMLAttributes } from 'react';

import { sizedImageUrl, supportsImageSizing } from '@/lib/media-image';
import { cn } from '@/lib/utils';

interface OptimizedImageProps extends Omit<
    ImgHTMLAttributes<HTMLImageElement>,
    'src' | 'alt' | 'width' | 'height' | 'srcSet' | 'loading'
> {
    src: string;
    alt: string;
    width: number;
    height: number;
    aspectRatio?: string;
    priority?: boolean;
}

function candidates(src: string, width: number, format: 'original' | 'webp') {
    const widths = [
        ...new Set([
            Math.max(32, Math.round(width * 0.75)),
            width,
            Math.round(width * 1.5),
            ...[480, 768, 1200].filter((size) => size <= width * 2),
            Math.min(width * 2, 1920),
        ]),
    ]
        .filter((size) => size <= width * 2)
        .sort((a, b) => a - b);
    return widths
        .map((size) => `${sizedImageUrl(src, size, format)} ${size}w`)
        .join(', ');
}

export const OptimizedImage = forwardRef<HTMLImageElement, OptimizedImageProps>(
    function OptimizedImage(
        {
            src,
            alt,
            width,
            height,
            aspectRatio,
            priority = false,
            className,
            style,
            sizes,
            ...props
        },
        ref,
    ) {
        const canResize = supportsImageSizing(src);
        const preferredWidth = Math.min(width * 2, 1920);
        return (
            <picture
                className={aspectRatio ? 'block overflow-hidden' : 'contents'}
                style={aspectRatio ? { aspectRatio } : undefined}
            >
                {canResize ? (
                    <source
                        type="image/webp"
                        srcSet={candidates(src, width, 'webp')}
                        sizes={sizes || `${width}px`}
                    />
                ) : null}
                <img
                    {...props}
                    ref={ref}
                    src={canResize ? sizedImageUrl(src, preferredWidth) : src}
                    srcSet={
                        canResize
                            ? candidates(src, width, 'original')
                            : undefined
                    }
                    sizes={canResize ? sizes || `${width}px` : undefined}
                    alt={alt}
                    width={width}
                    height={height}
                    loading={priority ? 'eager' : 'lazy'}
                    decoding="async"
                    fetchPriority={priority ? 'high' : undefined}
                    className={cn('object-cover', className)}
                    style={style}
                />
            </picture>
        );
    },
);
