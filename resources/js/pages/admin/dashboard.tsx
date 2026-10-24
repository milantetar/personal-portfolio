import { Head, usePage } from '@inertiajs/react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { GlassCard } from '@/components/glass-card';
import type { PageProps } from '@/types';

export default function Dashboard() {
    const { backgroundImage, branding, sidebarItems } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Admin Dashboard" />
            
            <AdminLayout 
                sidebarItems={sidebarItems} 
                backgroundUrl={branding?.backgroundImage?.url || backgroundImage?.url}
            >
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                </div>
            </AdminLayout>
        </>
    );
}
