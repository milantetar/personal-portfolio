import { Navbar } from '@/components/navbar/navbar';
import { FALLBACK_BACKDROP } from '@/config/theme';
import { useFlash } from '@/hooks/use-flash';
import type { Branding, SidebarItem } from '@/types';

import { Sidebar } from './sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebarItems?: SidebarItem[];
    backgroundUrl?: string | null;
    branding?: Branding;
}

export function AdminLayout({ children, sidebarItems = [], backgroundUrl, branding }: AdminLayoutProps) {
    useFlash();

    const bgUrl = backgroundUrl || branding?.backgroundImage?.url || FALLBACK_BACKDROP;

    return (
        <div className="admin-ui relative isolate flex h-dvh min-h-0 flex-col overflow-hidden bg-transparent text-foreground">
            <div
                className="pointer-events-none fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url("${bgUrl}")` }}
                aria-hidden="true"
            />
            <div className="pointer-events-none fixed inset-0 -z-10 bg-background/80" aria-hidden="true" />
            <Navbar />
            <div className="flex min-h-0 flex-1 flex-col md:flex-row">
                <Sidebar items={sidebarItems} />
                <main className="min-w-0 flex-1 overflow-y-auto overscroll-contain">
                    <div className="min-h-full px-4 py-6 sm:px-6 lg:px-9 lg:py-8">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
