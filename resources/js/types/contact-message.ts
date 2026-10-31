export interface ContactMessage {
    id: number;
    name: string;
    email: string;
    subject: string;
    message: string;
    is_read: boolean;
    replied_at: string | null;
    ip_address: string | null;
    user_agent: string | null;
    created_at: string;
    updated_at: string;
}

export interface PaginatedContactMessages {
    data: ContactMessage[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: Array<{ url: string | null; label: string; active: boolean }>;
}
