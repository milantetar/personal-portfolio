import type { Media } from './media';

export interface Project {
    id: number;
    title: string;
    slug: string;
    tagline: string | null;
    description: string | null;
    challenge: string | null;
    solution: string | null;
    metrics: string | null;
    tech_stack: string[] | null;
    live_url: string | null;
    github_url: string | null;
    thumbnail_media_id: number | null;
    gallery_media_ids: number[] | null;
    is_featured: boolean;
    is_visible: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
    thumbnail_media?: Media | null;
}

export interface PaginatedProjects {
    data: Project[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
