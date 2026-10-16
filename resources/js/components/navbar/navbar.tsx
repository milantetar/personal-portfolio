import { Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { NavbarType , PageProps } from '../../types/index';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
    const { auth, navBars = [] } = usePage<PageProps>().props;

    const headerNavbar = navBars.find((n) => n.name === 'Header Navbar');
    const items = headerNavbar ? headerNavbar.items : [];

    return (
        <nav
            className="
                sticky top-0 z-50 w-full
                px-6 py-3
                backdrop-blur-xl backdrop-saturate-150
                border-b
                shadow-[0_4px_30px_rgba(0,0,0,0.05)]
            "
            style={{
                backgroundColor:
                    'hsl(var(--glass-bg) / var(--glass-bg-opacity))',
                borderColor:
                    'hsl(var(--glass-border) / var(--glass-border-opacity))',
            }}
        >
            {/* Logo */}
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between">
                <div className="text-lg font-bold text-foreground">
                    <Link href="/" className="hover:opacity-80 transition-opacity">
                        Milan's Portfolio
                    </Link>
                </div>

                {/* Dynamic nav links */}
                <div className="hidden md:flex space-x-1">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.url}
                            className="
                                px-3 py-2 rounded-full text-sm
                                text-foreground/80 hover:text-foreground
                                hover:bg-foreground/5
                                transition-colors
                            "
                        >
                            {item.label}
                        </Link>
                    ))}
                </div>

                {/* Theme toggle + Auth */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {auth.user ? (
                        <div className="flex items-center gap-3">
                            <Link
                                href={route('home')}
                                className="
                                    rounded-full border px-4 py-1.5 text-sm
                                    backdrop-blur-md transition-colors
                                    hover:bg-foreground/5
                                "
                                style={{
                                    borderColor:
                                        'hsl(var(--glass-border) / var(--glass-border-opacity))',
                                }}
                            >
                                Home
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="
                                    rounded-full px-4 py-1.5 text-sm
                                    bg-primary text-primary-foreground
                                    hover:opacity-90
                                    backdrop-blur-md transition-all
                                "
                            >
                                Log Out
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href={route('login')}
                            className="
                                rounded-full border px-4 py-1.5 text-sm
                                backdrop-blur-md transition-colors
                                hover:bg-foreground/5
                            "
                            style={{
                                borderColor:
                                    'hsl(var(--glass-border) / var(--glass-border-opacity))',
                            }}
                        >
                            Admin Login
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}