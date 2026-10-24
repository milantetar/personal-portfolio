export type * from './auth';
export type * from './certificate';
export type * from './media';
export type * from './navbar/navbar';
export type * from './sidebar';
export type * from './site-settings';

import type { Auth } from './auth';
import type { BackgroundImage, Branding } from './media';
import type { NavbarType } from './navbar/navbar';
import type { SidebarItem } from './sidebar';

export interface PageProps {
    auth: Auth;
    backgroundImage?: BackgroundImage | null;
    branding?: Branding;
    navBars?: NavbarType[];
    sidebarItems: SidebarItem[];
    [key: string]: unknown;
}
