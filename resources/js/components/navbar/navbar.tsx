import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Home as HomeIcon, LogOut } from 'lucide-react';
import { route } from 'ziggy-js';

import type { PageProps } from '@/types';
import { ThemeToggle } from '@/components/theme-toggle';
import { isInternalPortfolioHref, portfolioHref } from '@/lib/portfolio-routing';

export function Navbar({ showNavigationLinks = true }: { showNavigationLinks?: boolean }) {
    const { auth, branding, navBars = [] } = usePage<PageProps>().props;

    const isDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');
    const activeNavbar = navBars.find((navbar) => navbar.name === (isDashboard ? 'Dashboard Navbar' : 'Homepage Navbar'));
    const items = activeNavbar?.items ?? [];
    const hasHomeItem = items.some((item) => item.label.toLowerCase() === 'home');
    const visibleItems = items;
    const currentPage = typeof window === 'undefined' ? '' : window.location.pathname;
    const pageLabel = currentPage === '/dashboard' ? 'Overview'
        : currentPage.startsWith('/dashboard/analytics') ? 'Analytics'
        : currentPage.startsWith('/dashboard/sections') ? 'Portfolio sections'
        : currentPage.startsWith('/dashboard/certificates') ? 'Certificates'
        : currentPage.startsWith('/dashboard/media') ? 'Media library'
        : currentPage.startsWith('/dashboard/settings') ? 'Site settings'
        : currentPage.startsWith('/dashboard/navigation') ? 'Navigation'
        : 'Workspace';

    return (
        <header className={`app-topbar sticky top-0 z-50 w-full border-b border-border/80 bg-background/90 ${isDashboard ? 'app-topbar--admin' : 'app-topbar--public'}`}>
            <div className="app-topbar-inner flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-4">
                    <Link href="/" prefetch="hover" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-75">
                        {branding?.logo ? (
                            <img
                                alt={branding.logo.alt_text || branding.siteName || "Portfolio"}
                                className="h-6 w-6 object-contain"
                                src={branding.logo.url}
                            />
                        ) : null}
                        <span className="font-display text-lg font-semibold tracking-tight">
                            {activeNavbar?.brand_title?.trim() || branding?.siteName || "Portfolio"}
                        </span>
                    </Link>
                    {isDashboard ? <span className="hidden border-l border-border pl-4 text-xs font-medium text-muted-foreground sm:inline">{pageLabel}</span> : null}
                    {showNavigationLinks ? <nav aria-label={isDashboard ? 'Dashboard header navigation' : 'Portfolio navigation'} className="hidden max-w-[48vw] items-center gap-5 overflow-x-auto md:flex">
                        {visibleItems.map((item) => {
                            const href = portfolioHref(item.url, [], item.label);
                            const className = 'whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors duration-150 hover:text-foreground focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring';

                            return isInternalPortfolioHref(href)
                                ? <Link key={item.id} href={href} prefetch="hover" className={className}>{item.label}</Link>
                                : <a key={item.id} href={href} className={className}>{item.label}</a>;
                        })}
                    </nav> : null}
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <ThemeToggle />
                    {auth.user ? (
                        <>
                            {isDashboard ? (
                                <Link href={route('home')} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent" aria-label="Open public portfolio">
                                    <HomeIcon className="size-3.5" /> <span className="hidden sm:inline">View site</span><ArrowUpRight className="hidden size-3 sm:inline" />
                                </Link>
                            ) : null}
                            {!hasHomeItem && !isDashboard && (
                                <Link href={route('home')} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                                    Home
                                </Link>
                            )}
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-xs font-semibold text-background transition-opacity hover:opacity-85"
                            >
                                <LogOut className="size-3.5" /><span className="hidden sm:inline">Log out</span>
                            </Link>
                        </>
                        ) : showNavigationLinks && !hasHomeItem && !isDashboard ? (
                        <Link href={route('home')} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                            Home
                        </Link>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
