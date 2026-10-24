import { Head, usePage } from '@inertiajs/react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { MediaDataTable } from '@/components/admin/media-data-table';
import { PolymorphicThemeHub } from '@/components/admin/polymorphic-theme-hub';
import type { MediaFilters, PageProps, PaginatedMedia } from '@/types';

interface MediaPageProps extends PageProps {
    filters: MediaFilters;
    mediaItems: PaginatedMedia;
}

export default function MediaLibrary() {
    const { branding, sidebarItems, mediaItems, filters, backgroundImage } = usePage<MediaPageProps>().props;

    return (
        <>
            <Head title="Media" />

            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={branding?.backgroundImage?.url || backgroundImage?.url}
            >
                {/* Minimalist Brief Branding Bar */}
                <PolymorphicThemeHub
                    branding={branding}
                    allMedia={mediaItems.data}
                />

                {/* Media Data Table */}
                <MediaDataTable
                    mediaItems={mediaItems}
                    filters={filters}
                    branding={branding}
                />
            </AdminLayout>
        </>
    );
}
