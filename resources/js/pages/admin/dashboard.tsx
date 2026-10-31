import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, ArrowRight, ArrowUpRight, Award, FolderOpen, LayoutTemplate, Settings2 } from 'lucide-react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Button } from '@/components/ui/button';
import type { PageProps } from '@/types';

const destinations = [
    { title: 'Homepage sections', description: 'Edit content, visibility, and the order visitors see.', href: '/dashboard/sections', icon: LayoutTemplate, group: 'Content' },
    { title: 'Certificates', description: 'Import files, update details, and manage what is published.', href: '/dashboard/certificates', icon: Award, group: 'Content' },
    { title: 'Media library', description: 'Upload files and assign your logo, backdrop, or resume.', href: '/dashboard/media', icon: FolderOpen, group: 'Assets' },
    { title: 'Site settings', description: 'Edit site identity, contact links, appearance, and media slots.', href: '/dashboard/settings', icon: Settings2, group: 'Configuration' },
    { title: 'Traffic analytics', description: 'Review privacy focused visits and the pages people open.', href: '/dashboard/analytics', icon: Activity, group: 'Insights' },
];

export default function Dashboard() {
    const { sidebarItems, backgroundImage, branding } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Workspace" />
            <AdminLayout sidebarItems={sidebarItems} backgroundUrl={branding?.backgroundImage?.url || backgroundImage?.url} branding={branding}>
                <div className="admin-page admin-overview mx-auto flex w-full max-w-7xl flex-col gap-7">
                    <AdminPageHeader
                        icon={<LayoutTemplate className="size-4" />}
                        title="Workspace"
                        description="Manage your public portfolio, its assets, and the details visitors see."
                        actions={<Button size="sm" asChild><Link href="/" target="_blank" rel="noreferrer">View portfolio <ArrowUpRight className="size-3.5" /></Link></Button>}
                    />

                    <section className="admin-overview-intro" aria-labelledby="overview-intro-title">
                        <div>
                            <p className="eyebrow">Your portfolio workspace</p>
                            <h2 id="overview-intro-title">What would you like to update?</h2>
                            <p>Choose an area to work on. Changes to published content appear on the public portfolio.</p>
                        </div>
                        <Link href="/dashboard/sections" className="admin-overview-primary-link">
                            <span className="admin-overview-primary-icon"><LayoutTemplate className="size-5" aria-hidden="true" /></span>
                            <span><strong>Continue with homepage content</strong><small>Review sections and publishing order</small></span>
                            <ArrowRight className="ml-auto size-4" aria-hidden="true" />
                        </Link>
                    </section>

                    <section aria-labelledby="manage-heading" className="space-y-3">
                        <div className="admin-section-heading">
                            <div><h2 id="manage-heading">Manage</h2><p>All backoffice areas</p></div>
                            <span className="font-mono text-xs text-muted-foreground">{destinations.length} destinations</span>
                        </div>
                        <div className="admin-destination-grid">
                            {destinations.map(({ title, description, href, icon: Icon, group }) => (
                                <Link key={href} href={href} className="admin-destination group">
                                    <span className="admin-destination-icon"><Icon className="size-4" aria-hidden="true" /></span>
                                    <span className="min-w-0 flex-1">
                                        <span className="admin-destination-meta">{group}</span>
                                        <strong>{title}</strong>
                                        <small>{description}</small>
                                    </span>
                                    <ArrowRight className="admin-destination-arrow size-4" aria-hidden="true" />
                                </Link>
                            ))}
                        </div>
                    </section>
                </div>
            </AdminLayout>
        </>
    );
}
