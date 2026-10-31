import type { PortfolioSection } from '@/types';

export function portfolioHref(reference: string, sections: PortfolioSection[], label = ''): string {
    const rawHref = reference.trim();
    const href = rawHref.startsWith('/#') ? rawHref.slice(1) : rawHref;

    if (!href.startsWith('#')) return href;

    const requested = href.slice(1).toLowerCase();
    const normalizedLabel = label.trim().toLowerCase();

    if (requested === 'home' || requested === 'hero' || normalizedLabel === 'home') return '/';
    if (requested === 'assistant' || requested === 'ask-ai' || normalizedLabel.includes('ask ai')) return '/assistant';

    const section = sections.find((candidate) =>
        candidate.slug.toLowerCase() === requested
        || candidate.type === requested
        || candidate.title?.trim().toLowerCase() === normalizedLabel,
    );

    return section ? `/${section.slug}` : `/${requested}`;
}

export function isInternalPortfolioHref(href: string): boolean {
    return href.startsWith('/') && !href.startsWith('//');
}
