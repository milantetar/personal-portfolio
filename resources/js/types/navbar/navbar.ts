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
    brand_title?: string | null;
    items: NavbarItem[];
}
