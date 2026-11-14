import { Head, Link, usePage } from '@inertiajs/react';
import {
    Activity,
    ArrowRight,
    ArrowUpRight,
    Award,
    Bot,
    FileText,
    FolderGit2,
    FolderOpen,
    LayoutTemplate,
    Mail,
    Settings2,
} from 'lucide-react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Button } from '@/components/ui/button';
import type { PageProps } from '@/types';

const destinations = [
    {
        title: 'Homepage sections',
        description: 'Edit sections and publishing order.',
        href: '/dashboard/sections',
        icon: LayoutTemplate,
    },
    {
        title: 'Projects & case studies',
        description: 'Update projects, tech stacks and live demos.',
        href: '/dashboard/projects',
        icon: FolderGit2,
    },
    {
        title: 'Articles & blog',
        description: 'Write and publish engineering articles.',
        href: '/dashboard/posts',
        icon: FileText,
    },
    {
        title: 'Certificates',
        description: 'Manage certificates and their files.',
        href: '/dashboard/certificates',
        icon: Award,
    },
    {
        title: 'Contact inquiries',
        description: 'Read messages from visitors.',
        href: '/dashboard/messages',
        icon: Mail,
    },
    {
        title: 'AI assistant logs',
        description: 'Review visitor questions and answers.',
        href: '/dashboard/assistant-logs',
        icon: Bot,
    },
    {
        title: 'Media library',
        description: 'Upload and assign images or documents.',
        href: '/dashboard/media',
        icon: FolderOpen,
    },
    {
        title: 'Site settings',
        description: 'Update identity, links and appearance.',
        href: '/dashboard/settings',
        icon: Settings2,
    },
    {
        title: 'Traffic analytics',
        description: 'See visits and page activity.',
        href: '/dashboard/analytics',
        icon: Activity,
    },
];

export default function Dashboard() {
    const { sidebarItems, backgroundImage, branding } =
        usePage<PageProps>().props;

    return (
        <>
            <Head title="Workspace" />
            <AdminLayout
                sidebarItems={sidebarItems}
                backgroundUrl={
                    branding?.backgroundImage?.url || backgroundImage?.url
                }
                branding={branding}
            >
                <div className="admin-page admin-overview flex w-full flex-col gap-4">
                    <AdminPageHeader
                        icon={<LayoutTemplate className="size-4" />}
                        title="Workspace"
                        description="Manage your public portfolio, its assets, and the details visitors see."
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                <Button size="sm" variant="outline" asChild>
                                    <Link href="/dashboard/sections">
                                        Edit homepage
                                    </Link>
                                </Button>
                                <Button size="sm" asChild>
                                    <Link
                                        href="/"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        View portfolio
                                        <ArrowUpRight className="size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        }
                    />

                    <section
                        aria-labelledby="manage-heading"
                        className="admin-manage-section space-y-3"
                    >
                        <div className="admin-section-heading">
                            <div>
                                <h2 id="manage-heading">Manage portfolio</h2>
                            </div>
                            <span className="font-mono text-xs text-muted-foreground">
                                {destinations.length} areas
                            </span>
                        </div>
                        <div className="admin-destination-grid">
                            {destinations.map(
                                ({ title, description, href, icon: Icon }) => (
                                    <Link
                                        key={href}
                                        href={href}
                                        className="admin-destination glass-card group"
                                    >
                                        <span className="admin-destination-icon">
                                            <Icon
                                                className="size-4"
                                                aria-hidden="true"
                                            />
                                        </span>
                                        <span className="admin-destination-body min-w-0 flex-1">
                                            <strong>{title}</strong>
                                            <small>{description}</small>
                                        </span>
                                        <ArrowRight
                                            className="admin-destination-arrow size-4"
                                            aria-hidden="true"
                                        />
                                    </Link>
                                ),
                            )}
                        </div>
                    </section>
                </div>
            </AdminLayout>
        </>
    );
}
