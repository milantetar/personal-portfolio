export interface NavbarItem {
    id: number;
    label: string;
    url: string;
    order: number;
}

export interface NavbarType {
    id: number;
    name: string;
    location: string;
    items: NavbarItem[];
}

import type { BackgroundImage } from '../media';
import type { User } from '../auth';

