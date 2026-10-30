export type PortfolioSectionType =
    | 'hero'
    | 'about'
    | 'skills'
    | 'experience'
    | 'projects'
    | 'certifications'
    | 'contact'
    | 'custom';

export interface PortfolioSection {
    id: number;
    slug: string;
    type: PortfolioSectionType;
    title: string | null;
    eyebrow: string | null;
    content: Record<string, unknown> | null;
    sort_order: number;
    is_visible: boolean;
}
