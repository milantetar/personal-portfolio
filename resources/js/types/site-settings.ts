import type { Media } from './media';

export interface SiteSettings {
    id: number;
    site_name: string;
    hero_title: string | null;
    hero_subtitle: string | null;
    hero_description: string | null;
    about_title: string;
    about_description: string | null;
    skills_content: string | null;
    projects_content: string | null;
    experience_content: string | null;
    contact_content: string | null;
    primary_cta_label: string;
    primary_cta_url: string;
    secondary_cta_label: string;
    secondary_cta_url: string;
    email: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    is_available: boolean;
    theme_preset: string;
    glass_blur: string;
    glass_opacity: string;
    logo_media?: Media | null;
    background_media?: Media | null;
    avatar_media?: Media | null;
    resume_media?: Media | null;
}

export interface SiteSettingsForm {
    site_name: string;
    email: string;
    github_url: string;
    linkedin_url: string;
    is_available: boolean;
    theme_preset: string;
    glass_blur: string;
    glass_opacity: string;
    settings_icon_media_id: number | null;
    resume_media_id: number | null;
}
