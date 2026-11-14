/** Only transform hosts that support width and format parameters. */
export function sizedImageUrl(
    source: string,
    width: number,
    format: 'original' | 'webp' = 'original',
): string {
    try {
        const url = new URL(source);
        const size = Math.max(32, Math.round(width));

        if (
            url.protocol === 'https:' &&
            url.hostname === 'res.cloudinary.com' &&
            url.pathname.includes('/image/upload/')
        ) {
            url.pathname = url.pathname.replace(
                '/image/upload/',
                `/image/upload/q_78,c_limit,w_${size}${format === 'webp' ? ',f_webp' : ''}/`,
            );
            return url.toString();
        }

        if (
            url.protocol === 'https:' &&
            url.hostname === 'images.unsplash.com'
        ) {
            url.searchParams.set('w', String(size));
            url.searchParams.set('q', '78');
            if (format === 'webp') url.searchParams.set('fm', 'webp');
            return url.toString();
        }
    } catch {
        // Relative and unsupported URLs are served as provided by the CMS.
    }

    return source;
}

export function supportsImageSizing(source: string): boolean {
    try {
        const url = new URL(source);
        return (
            url.protocol === 'https:' &&
            ((url.hostname === 'res.cloudinary.com' &&
                url.pathname.includes('/image/upload/')) ||
                url.hostname === 'images.unsplash.com')
        );
    } catch {
        return false;
    }
}
