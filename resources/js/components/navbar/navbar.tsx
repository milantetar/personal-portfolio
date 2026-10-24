import { Link, usePage } from '@inertiajs/react';
import { route } from 'ziggy-js';
import type { NavbarType, PageProps } from '../../types/index';
import { ThemeToggle } from '@/components/theme-toggle';

export function Navbar() {
    const { auth, branding, navBars = [] } = usePage<PageProps>().props;

    const headerNavbar = navBars.find((n) => n.name === 'Header Navbar');
    const items = headerNavbar ? headerNavbar.items : [];

    return (
        <nav className="sticky top-0 z-50 w-full px-6 py-3 border-b border-white/10 bg-black/25 backdrop-blur-xl shadow-[0_4px_30px_rgba(0,0,0,0.15)]">
            {/* Logo */}
            <div className="mx-auto flex w-full max-w-auto items-center justify-between">
                <div className="text-lg font-bold text-white">
                    <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                        {branding?.logo ? (
                            <img
                                alt={branding.logo.alt_text || branding.siteName}
                                className="h-8 w-8 object-contain drop-shadow"
                                src={branding.logo.url}
                            />
                        ) : null}
                        <span className="tracking-tight">{branding?.siteName || "Milan's Portfolio"}</span>
                    </Link>
                </div>

                {/* Dynamic nav links */}
                <div className="hidden md:flex space-x-1">
                    {items.map((item) => (
                        <Link
                            key={item.id}
                            href={item.url}
                            className="
                                px-3.5 py-1.5 rounded-full text-sm font-medium
                                text-white/80 hover:text-white
                                hover:bg-white/10
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
                            {branding?.avatar?.url ? (
                                <div
                                    className="h-8 w-8 rounded-full border border-white/20 overflow-hidden shadow-sm"
                                    title="Active Portfolio Avatar"
                                >
                                    <img
                                        src={branding.avatar.url}
                                        alt={branding.avatar.alt_text || "Milan"}
                                        className="h-full w-full object-cover"
                                    />
                                </div>
                            ) : null}
                            <Link
                                href={route('home')}
                                className="
                                    rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium
                                    text-white/90 bg-white/5 backdrop-blur-md transition-colors
                                    hover:bg-white/15 hover:text-white
                                "
                            >
                                Home
                            </Link>
                            <Link
                                href={route('logout')}
                                method="post"
                                as="button"
                                className="
                                    rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium
                                    text-white bg-white/10 backdrop-blur-md transition-all
                                    hover:bg-white/20
                                "
                            >
                                Log Out
                            </Link>
                        </div>
                    ) : (
                        <Link
                            href={route('home')}
                            className="
                                rounded-full border border-white/15 px-4 py-1.5 text-sm font-medium
                                text-white/90 bg-white/5 backdrop-blur-md transition-colors
                                hover:bg-white/15 hover:text-white
                            "
                        >
                            Home
                        </Link>
                    )}
                </div>
            </div>
        </nav>
    );
}
