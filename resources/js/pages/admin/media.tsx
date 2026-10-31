import { Head, usePage } from '@inertiajs/react';
import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { MediaDataTable } from '@/components/admin/media-data-table';
import { PolymorphicThemeHub } from '@/components/admin/polymorphic-theme-hub';
import { Images } from 'lucide-react';
import type { MediaFilters, PageProps, PaginatedMedia } from '@/types';

interface MediaPageProps extends PageProps {
    filters: MediaFilters;
    mediaItems: PaginatedMedia;
}

export default function MediaLibrary() {
    const { branding, sidebarItems, mediaItems, filters, backgroundImage } =
        usePage<MediaPageProps>().props;

    return (
        <>
            <Head title="Media" />

            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={
                    branding?.backgroundImage?.url || backgroundImage?.url
                }
                branding={branding}
            >
                <div className="admin-page admin-media-page mx-auto flex w-full max-w-7xl flex-col gap-5">
                    <AdminPageHeader
                        icon={<Images className="size-4" />}
                        title="Media library"
                        description="Upload, organize, preview, and assign the assets used by your portfolio."
                    />
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
                </div>
            </AdminLayout>
        </>
    );
}
