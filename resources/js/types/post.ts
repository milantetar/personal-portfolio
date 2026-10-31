import type { Media } from './media';

export interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt: string | null;
    content: string;
    cover_media_id: number | null;
    tags: string[] | null;
    read_time_minutes: number;
    is_published: boolean;
    published_at: string | null;
    created_at: string;
    updated_at: string;
    cover_media?: Media | null;
}

export interface PaginatedPosts {
    data: Post[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
