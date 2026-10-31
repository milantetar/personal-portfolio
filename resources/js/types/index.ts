export type * from './auth';
export type * from './certificate';
export type * from './media';
export type * from './navbar/navbar';
export type * from './sidebar';
export type * from './site-settings';
export type * from './portfolio-section';
export type * from './github-project';
export type * from './contact-message';
export type * from './project';
export type * from './assistant-log';
export type * from './post';

import type { Auth } from './auth';
import type { BackgroundImage, Branding } from './media';
import type { NavbarType } from './navbar/navbar';
import type { SidebarItem } from './sidebar';

export interface PageProps {
    auth: Auth;
    backgroundImage?: BackgroundImage | null;
    branding?: Branding;
    seo?: { siteUrl: string };
    navBars?: NavbarType[];
    sidebarItems: SidebarItem[];
    unreadMessagesCount?: number;
    [key: string]: unknown;
}
