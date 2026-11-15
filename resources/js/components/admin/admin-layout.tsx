import { Navbar } from '@/components/navbar/navbar';
import { motion, useReducedMotion } from 'motion/react';
import { FALLBACK_BACKDROP } from '@/config/theme';
import { ResponsiveBackdrop } from '@/components/responsive-backdrop';
import { useFlash } from '@/hooks/use-flash';
import type { Branding, SidebarItem } from '@/types';

import { Sidebar } from './sidebar';

interface AdminLayoutProps {
    children: React.ReactNode;
    sidebarItems?: SidebarItem[];
    backgroundUrl?: string | null;
    branding?: Branding;
}

export function AdminLayout({
    children,
    sidebarItems = [],
    backgroundUrl,
    branding,
}: AdminLayoutProps) {
    useFlash();
    const reduceMotion = useReducedMotion() ?? false;

    const bgUrl =
        backgroundUrl || branding?.backgroundImage?.url || FALLBACK_BACKDROP;

    return (
        <div className="admin-ui app-shell relative isolate flex h-dvh min-h-0 flex-col overflow-hidden bg-transparent text-foreground">
            <ResponsiveBackdrop
                source={bgUrl}
                className="admin-backdrop pointer-events-none fixed inset-0 -z-20 block overflow-hidden"
            />
            <div
                className="admin-backdrop-scrim pointer-events-none fixed inset-0 -z-10 bg-background/80"
                aria-hidden="true"
            />
            <Navbar />
            <div className="admin-workspace flex min-h-0 min-w-0 flex-1 flex-col md:flex-row">
                <Sidebar items={sidebarItems} />
                <main className="admin-main min-w-0 flex-1 overflow-y-auto overscroll-contain">
                    <motion.div
                        initial={reduceMotion ? false : { opacity: 0, y: 7 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="admin-main-content min-h-full min-w-0 px-4 py-6 sm:px-6 lg:px-9 lg:py-8"
                    >
                        {children}
                    </motion.div>
                </main>
            </div>
        </div>
    );
}
