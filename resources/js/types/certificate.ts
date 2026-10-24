import type { Media } from './media';

export interface Certificate {
    id: number;
    title: string;
    issuer: string;
    description: string | null;
    issued_at: string | null;
    credential_url: string | null;
    media_id: number | null;
    media?: Media | null;
    sort_order: number;
    is_visible: boolean;
}

export interface CertificateForm {
    title: string;
    issuer: string;
    description: string;
    issued_at: string;
    credential_url: string;
    media_id: number | null;
    sort_order: number;
    is_visible: boolean;
}
