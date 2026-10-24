import type { Media } from './media';

export interface SidebarItem {
    id: number;
    label: string;
    url: string;
    icon_media_id: number | null;
    icon_media?: Media | null;
}

export interface SidebarItemFormData {
    label: string;
    url: string;
    icon_media_id: number | null;
}
