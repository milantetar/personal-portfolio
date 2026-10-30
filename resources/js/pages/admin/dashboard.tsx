import { Head, Link, usePage } from '@inertiajs/react';
import { Activity, ArrowRight, ArrowUpRight, Award, FolderOpen, LayoutTemplate, Settings2 } from 'lucide-react';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PageProps } from '@/types';

const groups = [
    {
        title: 'Workspace',
        description: 'Understand site activity and move into the areas you use most.',
        items: [
            { title: 'Traffic analytics', description: 'Review visits, sessions, popular pages, and referral sources.', href: '/dashboard/analytics', icon: Activity, action: 'Open analytics' },
        ],
    },
    {
        title: 'Portfolio content',
        description: 'Shape what visitors see and how the portfolio is organized.',
        items: [
            { title: 'Homepage sections', description: 'Edit section order, visibility, and page content.', href: '/dashboard/sections', icon: LayoutTemplate, action: 'Manage sections' },
            { title: 'Certificates', description: 'Maintain certificates and achievements shown on the site.', href: '/dashboard/certificates', icon: Award, action: 'Manage certificates' },
        ],
    },
    {
        title: 'Assets & configuration',
        description: 'Manage reusable files and the global portfolio identity.',
        items: [
            { title: 'Media library', description: 'Upload and manage images, documents, and portfolio assets.', href: '/dashboard/media', icon: FolderOpen, action: 'Browse media' },
            { title: 'Site settings', description: 'Update branding, contact details, theme, and social links.', href: '/dashboard/settings', icon: Settings2, action: 'Edit settings' },
        ],
    },
];

export default function Dashboard() {
    const { sidebarItems, backgroundImage, branding } = usePage<PageProps>().props;

    return (
        <>
            <Head title="Overview" />
            <AdminLayout sidebarItems={sidebarItems} backgroundUrl={branding?.backgroundImage?.url || backgroundImage?.url} branding={branding}>
                <div className="mx-auto flex w-full max-w-7xl flex-col gap-8">
                    <AdminPageHeader
                        icon={<LayoutTemplate className="size-4" />}
                        title="Overview"
                        description="A clear starting point for managing your portfolio and monitoring its public presence."
                        actions={<Button size="sm" variant="outline" asChild><Link href="/" target="_blank" rel="noreferrer" className="inline-flex items-center gap-2">View live site <ArrowUpRight className="size-3.5" /></Link></Button>}
                    />

                    {groups.map((group) => (
                        <section key={group.title} className="space-y-3">
                            <div className="flex flex-col gap-1 border-b border-border/70 pb-3 sm:flex-row sm:items-end sm:justify-between">
                                <h2 className="text-sm font-semibold tracking-tight">{group.title}</h2>
                                <p className="text-xs text-muted-foreground">{group.description}</p>
                            </div>
                            <div className="dashboard-link-grid gap-3">
                                {group.items.map(({ title, description, href, icon: Icon, action }) => (
                                    <Link key={href} href={href} className="group rounded-lg focus-visible:outline-none">
                                        <Card className="h-full border-border/80 bg-card/90 transition-colors group-hover:border-primary/40 group-hover:bg-accent/30 group-focus-visible:ring-2 group-focus-visible:ring-ring">
                                            <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
                                                <div className="space-y-1.5">
                                                    <CardTitle className="text-sm font-semibold">{title}</CardTitle>
                                                    <CardDescription className="max-w-lg text-xs leading-5">{description}</CardDescription>
                                                </div>
                                                <span className="flex size-9 shrink-0 items-center justify-center border border-border bg-background text-muted-foreground transition-colors group-hover:text-primary"><Icon className="size-4" /></span>
                                            </CardHeader>
                                            <CardContent className="flex items-center gap-1 text-xs font-medium text-primary">
                                                {action}<ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                                            </CardContent>
                                        </Card>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>
            </AdminLayout>
        </>
    );
}
