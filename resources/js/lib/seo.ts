export function absoluteSiteUrl(siteUrl: string, value: string): string {
    const baseUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;

    try {
        return new URL(value, baseUrl).toString();
    } catch {
        return value;
    }
}

export function canonicalSiteUrl(
    siteUrl: string,
    currentUrl: string,
    options: { preservePage?: boolean } = {},
): string {
    const baseUrl = siteUrl.endsWith('/') ? siteUrl : `${siteUrl}/`;

    try {
        const canonical = new URL(currentUrl, baseUrl);
        canonical.hash = '';

        if (options.preservePage) {
            const page = canonical.searchParams.get('page');
            canonical.search = '';

            if (page && /^\d+$/.test(page) && Number(page) > 1) {
                canonical.searchParams.set('page', page);
            }
        } else {
            canonical.search = '';
        }

        return canonical.toString();
    } catch {
        return baseUrl;
    }
}

export function metaDescription(value: string, fallback: string): string {
    const normalized = value
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
    const description = normalized || fallback;

    return description.length > 160
        ? `${description.slice(0, 157).trimEnd()}...`
        : description;
}
