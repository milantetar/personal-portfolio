export interface Media {
    id: number;
    disk: string;
    path: string;
    url: string;
    original_name: string;
    mime_type: string;
    size: number;
    alt_text: string | null;
    title: string | null;
    uploaded_by: number | null;
    created_at: string | null;
    updated_at: string | null;
}

export interface MediaUploadData {
    media_id: number;
    url: string;
}

export interface MediaUploadResponse {
    success: boolean;
    message: string;
    data?: MediaUploadData;
    errors?: Record<string, string[]>;
}

export interface MediaPaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

export interface MediaFilters {
    mime_type: string;
    per_page: number;
    search: string;
    sort: 'latest' | 'oldest' | 'largest';
}

export interface Branding {
    id?: number;
    siteName: string;
    logo: Pick<Media, 'id' | 'url' | 'alt_text'> | null;
    backgroundImage: Pick<Media, 'id' | 'url' | 'alt_text'> | null;
    avatar?: Pick<Media, 'id' | 'url' | 'alt_text'> | null;
    themePreset?: string | null;
    glassBlur?: string;
    glassOpacity?: string;
}

export interface PaginatedMedia {
    data: Media[];
    meta: MediaPaginationMeta;
}

export interface BackgroundImage {
    id: number;
    url: string;
    alt?: string | null;
}
