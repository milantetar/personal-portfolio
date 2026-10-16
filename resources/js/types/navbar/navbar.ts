import { BackgroundImage } from "../dashboard/media";

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

export interface PageProps {
    auth: {
        user: any | null;
    };
    navBars?: NavbarType[];
    backgroundImage?: BackgroundImage | null;
    [key: string]: any;
}
