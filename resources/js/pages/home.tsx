import { Head, Link, usePage } from '@inertiajs/react';
import { useReducedMotion } from 'motion/react';
import { Mail, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import { PortfolioAssistant } from '@/components/portfolio/portfolio-assistant';
import { GitHubIcon, LinkedInIcon } from '@/components/portfolio/brand-icons';
import { PortfolioSectionRenderer } from '@/components/portfolio/portfolio-section-renderer';
import { PortfolioThemePicker, type PortfolioTheme } from '@/components/portfolio/portfolio-theme-picker';
import { FALLBACK_BACKDROP } from '@/config/theme';
import { isInternalPortfolioHref, portfolioHref } from '@/lib/portfolio-routing';
import type { Certificate, GitHubProject, PageProps, PortfolioSection, SiteSettings } from '@/types';

interface HomeProps {
    settings: SiteSettings | null;
    certificates: Certificate[];
    sections: PortfolioSection[];
    activeSectionSlug: string;
    projects: GitHubProject[];
    githubProfileUrl: string | null;
    assistantEnabled: boolean;
}

function navigationLabel(label: string): string {
    return label
        .toLowerCase()
        .replace(/\b\w/g, (character) => character.toUpperCase())
        .replace(/\bAi\b/g, 'AI')
        .replace(/\bGithub\b/g, 'GitHub');
}

function isPortfolioTheme(value: string | null): value is PortfolioTheme {
    return value === 'midnight' || value === 'forest' || value === 'ocean' || value === 'instagram';
}

export default function Home({ settings, certificates, sections, activeSectionSlug, projects, githubProfileUrl, assistantEnabled }: HomeProps) {
    const { navBars = [], flash } = usePage<HomeProps & PageProps & { flash?: { success?: string; error?: string } }>().props;
    const homepageNavbar = navBars.find((navbar) => navbar.name === 'Homepage Navbar');
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const activeSection = sections.find((section) => section.slug === activeSectionSlug);
    const site = settings ?? ({} as SiteSettings);
    const initialTheme: PortfolioTheme = isPortfolioTheme(site.theme_preset) ? site.theme_preset : 'midnight';
    const [portfolioTheme, setPortfolioTheme] = useState<PortfolioTheme>(initialTheme);

    useEffect(() => {
        try {
            const savedTheme = window.localStorage.getItem('portfolio-home-theme');
            if (isPortfolioTheme(savedTheme)) setPortfolioTheme(savedTheme);
        } catch {
            // Keep the CMS theme when storage is unavailable.
        }
    }, [initialTheme]);

    useEffect(() => {
        document.documentElement.classList.remove('portfolio-snap-page');
    }, []);
    const reduceMotion = useReducedMotion() ?? false;
    const logo = settings?.logo_media?.url;
    const backdrop = settings?.background_media?.url || FALLBACK_BACKDROP;
    const backdropIntensity = Math.min(100, Math.max(0, Number(site.glass_opacity ?? 72)));
    const backdropScrimOpacity = Math.min(0.86, 0.58 + backdropIntensity * 0.0028);

    const changePortfolioTheme = (theme: PortfolioTheme) => {
        setPortfolioTheme(theme);
        try {
            window.localStorage.setItem('portfolio-home-theme', theme);
        } catch {
            // The selected theme still applies for this page when storage is unavailable.
        }
    };

    return (
        <>
            <Head title={activeSection?.title || (activeSectionSlug === 'assistant' ? 'Ask about my work' : site.site_name || 'Portfolio')} />
            <div
                data-theme={portfolioTheme}
                className="portfolio-site relative isolate min-h-screen overflow-clip bg-transparent text-foreground"
                style={{ '--portfolio-scrim-opacity': `${backdropScrimOpacity}` } as CSSProperties}
            >
                <div
                    className="portfolio-backdrop fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${backdrop}")` }}
                    aria-hidden="true"
                />
                <div className="portfolio-backdrop-scrim pointer-events-none fixed inset-0 -z-10" aria-hidden="true" />

                <header className="portfolio-nav-glass sticky top-0 z-40">
                    <nav className="portfolio-wrap flex min-h-16 items-center justify-between gap-5" aria-label="Main navigation">
                        <Link href="/" prefetch="hover" className="flex shrink-0 items-center gap-2.5 text-foreground transition-opacity hover:opacity-75">
                            {logo ? <img src={logo} alt="" width="32" height="32" className="size-8 object-contain" /> : null}
                            <span className="font-display text-xl font-semibold tracking-tight">{site.site_name || 'Portfolio'}</span>
                        </Link>

                        <div className="hidden items-center gap-6 md:flex lg:gap-8">
                            {homepageNavbar?.items.map((item) => {
                                const href = portfolioHref(item.url, sections, item.label);
                                const className = 'whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-foreground';

                                return isInternalPortfolioHref(href)
                                    ? <Link key={item.id} href={href} prefetch="hover" className={className}>{navigationLabel(item.label)}</Link>
                                    : <a key={item.id} href={href} className={className}>{navigationLabel(item.label)}</a>;
                            })}
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <PortfolioThemePicker value={portfolioTheme} onChange={changePortfolioTheme} />
                            <div className="hidden items-center gap-4 md:flex">
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
                                className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring md:hidden"
                            >
                                {isMenuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
                            </button>
                        </div>
                    </nav>
                    {isMenuOpen ? (
                        <nav id="portfolio-mobile-navigation" aria-label="Portfolio navigation" className="portfolio-mobile-navigation portfolio-wrap grid gap-1 border-t border-border py-2 md:hidden">
                            {homepageNavbar?.items.map((item) => {
                                const href = portfolioHref(item.url, sections, item.label);
                                const className = 'rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground';
                                const closeMenu = () => setIsMenuOpen(false);

                                return isInternalPortfolioHref(href)
                                    ? <Link key={item.id} href={href} prefetch="hover" onClick={closeMenu} className={className}>{navigationLabel(item.label)}</Link>
                                    : <a key={item.id} href={href} onClick={closeMenu} className={className}>{navigationLabel(item.label)}</a>;
                            })}
                        </nav>
                    ) : null}
                </header>

                <main className="portfolio-wrap relative z-0">
                    {activeSectionSlug === 'assistant' ? <PortfolioAssistant enabled={assistantEnabled} /> : null}
                    {sections.filter((section) => section.slug === activeSectionSlug).map((section) => (
                        <PortfolioSectionRenderer
                            key={section.id}
                            section={section}
                            sections={sections}
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
                </main>
            </div>
        </>
    );
}
