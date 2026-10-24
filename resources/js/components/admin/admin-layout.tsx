import { Navbar } from '@/components/navbar/navbar';
import { useFlash } from '@/hooks/use-flash';
import type { SidebarItem } from '@/types';

import { Sidebar } from './sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebarItems?: SidebarItem[];
    backgroundUrl?: string | null;
}

const FALLBACK_BG = 'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80';

export function AdminLayout({ children, sidebarItems = [], backgroundUrl }: AdminLayoutProps) {
    useFlash();

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                style={{ backgroundImage: `url(${backgroundUrl || FALLBACK_BG})` }}
                aria-hidden="true"
            />
            <div className="absolute inset-0 bg-black/40 dark:bg-black/60" aria-hidden="true" />

            <div className="relative z-10 flex h-screen flex-col">
                <Navbar />
                <div className="flex flex-1 overflow-hidden">
                    <Sidebar items={sidebarItems} />
                    <main className="flex-1 overflow-y-auto p-6 md:p-8">
                        <div className="mx-auto max-w-6xl">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
