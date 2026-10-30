import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Home as HomeIcon, LogOut } from 'lucide-react';
import { route } from 'ziggy-js';

import type { PageProps } from '@/types';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
    const { auth, branding, navBars = [] } = usePage<PageProps>().props;

    const isDashboard = typeof window !== 'undefined' && window.location.pathname.startsWith('/dashboard');
    const activeNavbar = navBars.find((navbar) => navbar.name === (isDashboard ? 'Dashboard Navbar' : 'Homepage Navbar'));
    const items = activeNavbar?.items ?? [];
    const hasHomeItem = items.some((item) => item.label.toLowerCase() === 'home');
    const visibleItems = isDashboard ? [] : items;

    return (
        <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/90">
            <div className="flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
                <div className="flex min-w-0 items-center gap-6">
                    <Link href="/" className="flex shrink-0 items-center gap-2 transition-opacity hover:opacity-75">
                        {branding?.logo ? (
                            <img
                                alt={branding.logo.alt_text || branding.siteName || "Portfolio"}
                                className="h-6 w-6 object-contain"
                                src={branding.logo.url}
                            />
                        ) : null}
                        <span className="font-display text-lg font-semibold tracking-tight">
                            {branding?.siteName || "Portfolio"}
                        </span>
                    </Link>
                    <nav className="hidden md:flex items-center gap-6">
                        {visibleItems.map((item) => (
                            <Link
                                key={item.id}
                                href={item.url}
                                className="whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                </div>

                <div className="flex shrink-0 items-center gap-2">
                    <ThemeToggle />
                    {auth.user ? (
                        <>
                            {isDashboard ? (
                                <Link href={route('home')} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-foreground transition-colors hover:bg-accent">
                                    <HomeIcon className="size-3.5" /> <span className="hidden sm:inline">Home</span><ArrowUpRight className="hidden size-3 sm:inline" />
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
                    ) : !hasHomeItem && !isDashboard ? (
                        <Link href={route('home')} className="text-xs text-muted-foreground transition-colors hover:text-foreground">
                            Home
                        </Link>
                    ) : null}
                </div>
            </div>
        </header>
    );
}
