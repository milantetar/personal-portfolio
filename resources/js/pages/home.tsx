import { Head, Link, usePage } from '@inertiajs/react';
import { useReducedMotion } from 'motion/react';
import { Mail, Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { CSSProperties } from 'react';

import { PortfolioAssistant } from '@/components/portfolio/portfolio-assistant';
import { GitHubIcon, LinkedInIcon } from '@/components/portfolio/brand-icons';
import { PortfolioSectionRenderer } from '@/components/portfolio/portfolio-section-renderer';
import { FALLBACK_BACKDROP } from '@/config/theme';
import type { Certificate, GitHubProject, PageProps, PortfolioSection, SiteSettings } from '@/types';

interface HomeProps {
    settings: SiteSettings | null;
    certificates: Certificate[];
    sections: PortfolioSection[];
    projects: GitHubProject[];
    githubProfileUrl: string | null;
    assistantEnabled: boolean;
}

export default function Home({ settings, certificates, sections, projects, githubProfileUrl, assistantEnabled }: HomeProps) {
    const { navBars = [], flash } = usePage<HomeProps & PageProps & { flash?: { success?: string; error?: string } }>().props;
    const homepageNavbar = navBars.find((navbar) => navbar.name === 'Homepage Navbar');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const site = settings ?? ({} as SiteSettings);
    const reduceMotion = useReducedMotion() ?? false;
    const logo = settings?.logo_media?.url;
    const backdrop = settings?.background_media?.url || FALLBACK_BACKDROP;
    const glassOpacity = Math.min(0.95, Math.max(0.25, Number(site.glass_opacity ?? 72) / 100));
    const glassSurfaceOpacity = Math.min(0.92, Math.max(0.82, glassOpacity * 0.96));
    const backdropScrimOpacity = Math.min(0.58, Math.max(0.46, 0.4 + glassOpacity * 0.18));

    return (
        <>
            <Head title={site.site_name || 'Portfolio'} />
            <div
                data-theme={site.theme_preset || undefined}
                className="portfolio-site relative isolate min-h-screen overflow-clip bg-transparent text-foreground"
                style={{ '--portfolio-opacity': `${glassOpacity}`, '--portfolio-glass-opacity': `${glassSurfaceOpacity}`, '--portfolio-scrim-opacity': `${backdropScrimOpacity}` } as CSSProperties}
            >
                <div
                    className="portfolio-backdrop fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${backdrop}")` }}
                    aria-hidden="true"
                />
                <div className="portfolio-backdrop-scrim pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />

                <header className="portfolio-nav-glass sticky top-0 z-40">
                    <nav className="portfolio-wrap flex min-h-16 items-center justify-between gap-5" aria-label="Main navigation">
                        <Link href="/" className="flex shrink-0 items-center gap-2.5 text-foreground transition-opacity hover:opacity-75">
                            {logo ? <img src={logo} alt="" width="32" height="32" className="size-8 object-contain" /> : null}
                            <span className="font-display text-xl font-semibold tracking-tight">{site.site_name || 'Portfolio'}</span>
                        </Link>

                        <div className="hidden items-center gap-6 md:flex lg:gap-8">
                            {homepageNavbar?.items.map((item) => (
                                <a key={item.id} href={item.url} className="whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
                                    {item.label}
                                </a>
                            ))}
                        </div>

                        <div className="hidden items-center gap-4 text-muted-foreground md:flex">
                            {site.github_url ? <a href={site.github_url} target="_blank" rel="noreferrer" aria-label="GitHub profile" className="transition-colors hover:text-foreground"><GitHubIcon className="size-4" /></a> : null}
                            {site.linkedin_url ? <a href={site.linkedin_url} target="_blank" rel="noreferrer" aria-label="LinkedIn profile" className="transition-colors hover:text-foreground"><LinkedInIcon className="size-4" /></a> : null}
                            {site.email ? <a href={`mailto:${site.email}`} aria-label="Email Milan" className="transition-colors hover:text-foreground"><Mail className="size-4" aria-hidden="true" /></a> : null}
                        </div>

                        <button
                            type="button"
                            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
                            aria-expanded={isMenuOpen}
                            aria-controls="portfolio-mobile-navigation"
                            onClick={() => setIsMenuOpen((open) => !open)}
                            className="inline-flex size-10 items-center justify-center rounded-xl border border-border/70 bg-card/35 text-foreground transition-colors hover:bg-accent/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                        >
                            {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                        </button>
                    </nav>
                    {isMenuOpen ? (
                        <nav id="portfolio-mobile-navigation" aria-label="Portfolio navigation" className="portfolio-mobile-navigation portfolio-wrap grid gap-1 border-t border-border py-2 md:hidden">
                            {homepageNavbar?.items.map((item) => (
                                <a key={item.id} href={item.url} onClick={() => setIsMenuOpen(false)} className="rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground">
                                    {item.label}
                                </a>
                            ))}
                        </nav>
                    ) : null}
                </header>

                <main className="portfolio-wrap relative z-0">
                    <PortfolioAssistant enabled={assistantEnabled} />
                    <div className="portfolio-section-stream pb-8">
                        {sections.map((section) => (
                            <PortfolioSectionRenderer
                                key={section.id}
                                section={section}
                                site={site}
                                certificates={certificates}
                                projects={projects}
                                githubUrl={githubProfileUrl}
                                resumeUrl={settings?.resume_media?.url}
                                reduceMotion={reduceMotion}
                                contactSuccess={flash?.success}
                                contactError={flash?.error}
                            />
                        ))}
                    </div>
                </main>
                <footer className="portfolio-footer portfolio-wrap border-t border-foreground/15 py-6 text-xs text-muted-foreground">
                    © {new Date().getFullYear()} {site.site_name || 'Portfolio'}
                </footer>
            </div>
        </>
    );
}
