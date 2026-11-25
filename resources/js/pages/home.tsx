import { Head, Link, usePage } from '@inertiajs/react';
import { useReducedMotion } from 'motion/react';
import { ArrowUpRight, Mail, Menu, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';

import { PortfolioAssistant } from '@/components/portfolio/portfolio-assistant';
import { GitHubIcon, LinkedInIcon } from '@/components/portfolio/brand-icons';
import { PortfolioSectionRenderer } from '@/components/portfolio/portfolio-section-renderer';
import { OptimizedImage } from '@/components/optimized-image';
import { ResponsiveBackdrop } from '@/components/responsive-backdrop';
import { ThemeToggle } from '@/components/theme-toggle';
import { FALLBACK_BACKDROP } from '@/config/theme';
import {
    isInternalPortfolioHref,
    portfolioHref,
} from '@/lib/portfolio-routing';
import { absoluteSiteUrl, canonicalSiteUrl, metaDescription } from '@/lib/seo';
import type {
    Certificate,
    GitHubProject,
    PageProps,
    PortfolioSection,
    SiteSettings,
} from '@/types';

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

export default function Home({
    settings,
    certificates,
    sections,
    activeSectionSlug,
    projects,
    githubProfileUrl,
    assistantEnabled,
}: HomeProps) {
    const page = usePage<
        HomeProps & PageProps & { flash?: { success?: string; error?: string } }
    >();
    const { navBars = [], flash } = page.props;
    const homepageNavbar = navBars.find(
        (navbar) => navbar.name === 'Homepage Navbar',
    );
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const headerRef = useRef<HTMLElement>(null);
    const menuButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (!isMenuOpen) return;
        const dismissOutside = (event: PointerEvent) => {
            if (
                event.target instanceof Node &&
                !headerRef.current?.contains(event.target)
            ) {
                setIsMenuOpen(false);
            }
        };
        const dismissOnEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsMenuOpen(false);
                menuButtonRef.current?.focus();
            }
        };
        const desktop = window.matchMedia('(min-width: 768px)');
        const dismissOnDesktop = () => {
            if (desktop.matches) setIsMenuOpen(false);
        };
        document.addEventListener('pointerdown', dismissOutside);
        document.addEventListener('keydown', dismissOnEscape);
        desktop.addEventListener('change', dismissOnDesktop);
        return () => {
            document.removeEventListener('pointerdown', dismissOutside);
            document.removeEventListener('keydown', dismissOnEscape);
            desktop.removeEventListener('change', dismissOnDesktop);
        };
    }, [isMenuOpen]);
    const activeSection = sections.find(
        (section) => section.slug === activeSectionSlug,
    );
    const site = settings ?? ({} as SiteSettings);

    const siteUrl =
        page.props.seo?.siteUrl ||
        (typeof window !== 'undefined'
            ? window.location.origin
            : 'http://localhost:8000');
    const siteName = site.site_name || 'Portfolio';
    const pageTitle =
        activeSection?.title ||
        (activeSectionSlug === 'assistant' ? 'Ask about my work' : siteName);
    const documentTitle =
        pageTitle === siteName ? siteName : `${pageTitle} | ${siteName}`;
    const isAssistantPage = activeSectionSlug === 'assistant';
    const sectionContent = activeSection?.content;
    const cmsDescription = [
        sectionContent?.seo_description,
        sectionContent?.description,
        sectionContent?.summary,
        sectionContent?.intro,
    ].find(
        (value): value is string =>
            typeof value === 'string' && value.trim() !== '',
    );
    const sectionFallbacks: Record<string, string> = {
        hero:
            site.hero_description ||
            `${siteName} — PHP and Laravel backend developer.`,
        about:
            site.about_description ||
            `Learn about ${siteName}'s background and approach to backend development.`,
        skills: `Backend and frontend technologies used by ${siteName}, including PHP, Laravel, REST APIs, and MySQL.`,
        experience: `Professional experience and engineering work by ${siteName}.`,
        projects: `Selected software projects built by ${siteName}, featuring backend systems, APIs, and web applications.`,
        certifications: `Professional certificates and technical achievements held by ${siteName}.`,
        contact: `Contact ${siteName} about PHP and Laravel development opportunities.`,
        custom: `Portfolio information and work from ${siteName}.`,
    };
    const description = metaDescription(
        (activeSection?.type === 'hero'
            ? site.hero_description
            : activeSection?.type === 'about'
              ? site.about_description
              : cmsDescription) ||
            cmsDescription ||
            (isAssistantPage
                ? `Ask questions about ${siteName}'s experience, projects, and technical skills.`
                : ''),
        sectionFallbacks[activeSection?.type || 'hero'],
    );
    const canonicalPath = activeSection?.type === 'hero' ? '/' : page.url;
    const canonicalUrl = canonicalSiteUrl(siteUrl, canonicalPath);
    const socialImage =
        site.avatar_media?.url ||
        site.logo_media?.url ||
        site.background_media?.url;
    const socialImageUrl = socialImage
        ? socialImage.startsWith('http')
            ? socialImage
            : absoluteSiteUrl(siteUrl, socialImage)
        : undefined;
    const faviconUrl = page.props.branding?.favicon?.url
        ? absoluteSiteUrl(siteUrl, page.props.branding.favicon.url)
        : absoluteSiteUrl(siteUrl, '/favicon.ico');
    const structuredData = [
        {
            '@context': 'https://schema.org',
            '@type': 'Person',
            name: siteName,
            url: canonicalSiteUrl(siteUrl, '/'),
            ...(site.hero_subtitle ? { jobTitle: site.hero_subtitle } : {}),
            ...(socialImageUrl ? { image: socialImageUrl } : {}),
            ...(site.email ? { email: `mailto:${site.email}` } : {}),
            sameAs: [site.github_url, site.linkedin_url].filter(
                (value): value is string => Boolean(value),
            ),
        },
        {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            name: siteName,
            url: canonicalSiteUrl(siteUrl, '/'),
        },
    ];

    const hasVisibleContent =
        isAssistantPage ||
        sections.some((section) => section.slug === activeSectionSlug);

    useEffect(() => {
        document.documentElement.classList.remove('portfolio-snap-page');
    }, []);
    const reduceMotion = useReducedMotion() ?? false;
    const logo = settings?.logo_media?.url;
    const backdrop = settings?.background_media?.url || FALLBACK_BACKDROP;
    const backdropIntensity = Math.min(
        100,
        Math.max(0, Number(site.glass_opacity ?? 72)),
    );
    const backdropScrimOpacity = Math.min(
        0.42,
        0.18 + backdropIntensity * 0.002,
    );

    return (
        <>
            <Head title={documentTitle}>
                <meta
                    head-key="description"
                    name="description"
                    content={description}
                />
                <meta head-key="robots" name="robots" content="index,follow" />
                <link head-key="icon" rel="icon" href={faviconUrl} />
                <link
                    head-key="canonical"
                    rel="canonical"
                    href={canonicalUrl}
                />

                <meta head-key="og:type" property="og:type" content="website" />
                <meta
                    head-key="og:site_name"
                    property="og:site_name"
                    content={siteName}
                />
                <meta
                    head-key="og:title"
                    property="og:title"
                    content={documentTitle}
                />
                <meta
                    head-key="og:description"
                    property="og:description"
                    content={description}
                />
                <meta
                    head-key="og:url"
                    property="og:url"
                    content={canonicalUrl}
                />
                {socialImageUrl ? (
                    <meta
                        head-key="og:image"
                        property="og:image"
                        content={socialImageUrl}
                    />
                ) : null}
                {socialImageUrl ? (
                    <meta
                        head-key="og:image:alt"
                        property="og:image:alt"
                        content={`${siteName} portfolio`}
                    />
                ) : null}

                <meta
                    head-key="twitter:card"
                    name="twitter:card"
                    content={socialImageUrl ? 'summary_large_image' : 'summary'}
                />
                <meta
                    head-key="twitter:title"
                    name="twitter:title"
                    content={documentTitle}
                />
                <meta
                    head-key="twitter:description"
                    name="twitter:description"
                    content={description}
                />
                {socialImageUrl ? (
                    <meta
                        head-key="twitter:image"
                        name="twitter:image"
                        content={socialImageUrl}
                    />
                ) : null}
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify(structuredData).replace(
                            /</g,
                            '\\u003c',
                        ),
                    }}
                />
            </Head>
            <div
                className="portfolio-site relative isolate min-h-screen overflow-clip bg-transparent text-foreground"
                style={
                    {
                        '--portfolio-scrim-opacity': `${backdropScrimOpacity}`,
                    } as CSSProperties
                }
            >
                <ResponsiveBackdrop
                    source={backdrop}
                    className="portfolio-backdrop pointer-events-none fixed inset-0 -z-20 block overflow-hidden"
                />
                <div
                    className="portfolio-backdrop-scrim pointer-events-none fixed inset-0 -z-10"
                    aria-hidden="true"
                />

                <header
                    ref={headerRef}
                    className="portfolio-nav-glass sticky top-0 z-40"
                >
                    <nav
                        className="portfolio-wrap flex min-h-16 items-center justify-between gap-5"
                        aria-label="Main navigation"
                    >
                        <Link
                            href="/"
                            prefetch="hover"
                            className="flex shrink-0 items-center gap-2.5 text-foreground transition-opacity hover:opacity-75"
                        >
                            {logo ? (
                                <OptimizedImage
                                    src={logo}
                                    alt=""
                                    width={32}
                                    height={32}
                                    className="size-8 object-contain"
                                />
                            ) : null}
                            <span className="font-display text-xl font-semibold tracking-tight">
                                {site.site_name || 'Portfolio'}
                            </span>
                        </Link>

                        <div className="hidden items-center gap-6 md:flex lg:gap-8">
                            {homepageNavbar?.items.slice(0, 4).map((item) => {
                                const href = portfolioHref(
                                    item.url,
                                    sections,
                                    item.label,
                                );
                                const className =
                                    'whitespace-nowrap text-xs font-medium text-muted-foreground transition-colors hover:text-foreground';

                                return isInternalPortfolioHref(href) ? (
                                    <Link
                                        key={item.id}
                                        href={href}
                                        prefetch="hover"
                                        className={className}
                                    >
                                        {navigationLabel(item.label)}
                                    </Link>
                                ) : (
                                    <a
                                        key={item.id}
                                        href={href}
                                        className={className}
                                    >
                                        {navigationLabel(item.label)}
                                    </a>
                                );
                            })}
                            {(homepageNavbar?.items.length || 0) > 4 ? (
                                <details className="portfolio-nav-more relative text-xs text-muted-foreground">
                                    <summary className="cursor-pointer font-medium hover:text-foreground focus-visible:text-foreground">
                                        More
                                    </summary>
                                    <div className="absolute top-full right-0 z-50 mt-3 grid min-w-40 gap-1 rounded-xl border border-border bg-card p-2 shadow-sm">
                                        {homepageNavbar?.items
                                            .slice(4)
                                            .map((item) => {
                                                const href = portfolioHref(
                                                    item.url,
                                                    sections,
                                                    item.label,
                                                );
                                                const className =
                                                    'rounded-md px-3 py-2 font-medium hover:bg-accent hover:text-foreground';
                                                return isInternalPortfolioHref(
                                                    href,
                                                ) ? (
                                                    <Link
                                                        key={item.id}
                                                        href={href}
                                                        prefetch="hover"
                                                        className={className}
                                                    >
                                                        {navigationLabel(
                                                            item.label,
                                                        )}
                                                    </Link>
                                                ) : (
                                                    <a
                                                        key={item.id}
                                                        href={href}
                                                        className={className}
                                                    >
                                                        {navigationLabel(
                                                            item.label,
                                                        )}
                                                    </a>
                                                );
                                            })}
                                    </div>
                                </details>
                            ) : null}
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <ThemeToggle />
                            <div className="hidden items-center gap-4 md:flex">
                                {site.github_url ? (
                                    <a
                                        href={site.github_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="GitHub profile"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        <GitHubIcon className="size-4" />
                                    </a>
                                ) : null}
                                {site.linkedin_url ? (
                                    <a
                                        href={site.linkedin_url}
                                        target="_blank"
                                        rel="noreferrer"
                                        aria-label="LinkedIn profile"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        <LinkedInIcon className="size-4" />
                                    </a>
                                ) : null}
                                {site.email ? (
                                    <a
                                        href={`mailto:${site.email}`}
                                        aria-label="Email Milan"
                                        className="transition-colors hover:text-foreground"
                                    >
                                        <Mail
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                    </a>
                                ) : null}
                            </div>
                            <button
                                ref={menuButtonRef}
                                type="button"
                                aria-label={
                                    isMenuOpen
                                        ? 'Close navigation menu'
                                        : 'Open navigation menu'
                                }
                                aria-expanded={isMenuOpen}
                                aria-controls="portfolio-mobile-navigation"
                                onClick={() => setIsMenuOpen((open) => !open)}
                                className="inline-flex size-10 items-center justify-center rounded-md border border-border bg-card text-foreground transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none md:hidden"
                            >
                                {isMenuOpen ? (
                                    <X className="size-4" />
                                ) : (
                                    <Menu className="size-4" />
                                )}
                            </button>
                        </div>
                    </nav>
                    {isMenuOpen ? (
                        <nav
                            id="portfolio-mobile-navigation"
                            aria-label="Portfolio navigation"
                            className="portfolio-mobile-navigation md:hidden"
                        >
                            <div className="portfolio-mobile-navigation-heading">
                                <span>Explore portfolio</span>
                            </div>
                            <div className="portfolio-mobile-navigation-links">
                                {homepageNavbar?.items.map((item) => {
                                    const href = portfolioHref(
                                        item.url,
                                        sections,
                                        item.label,
                                    );
                                    const isActive =
                                        href.split(/[?#]/)[0] ===
                                        page.url.split(/[?#]/)[0];
                                    const className =
                                        'portfolio-mobile-navigation-link';
                                    const closeMenu = () =>
                                        setIsMenuOpen(false);

                                    return isInternalPortfolioHref(href) ? (
                                        <Link
                                            key={item.id}
                                            href={href}
                                            prefetch="hover"
                                            onClick={closeMenu}
                                            className={className}
                                            aria-current={
                                                isActive ? 'page' : undefined
                                            }
                                        >
                                            <span>
                                                {navigationLabel(item.label)}
                                            </span>
                                            {isActive ? (
                                                <span
                                                    className="portfolio-mobile-current"
                                                    aria-hidden="true"
                                                />
                                            ) : null}
                                        </Link>
                                    ) : (
                                        <a
                                            key={item.id}
                                            href={href}
                                            onClick={closeMenu}
                                            className={className}
                                        >
                                            <span>
                                                {navigationLabel(item.label)}
                                            </span>
                                            <ArrowUpRight
                                                className="size-3.5 shrink-0"
                                                aria-hidden="true"
                                            />
                                        </a>
                                    );
                                })}
                            </div>
                        </nav>
                    ) : null}
                </header>

                <main className="portfolio-wrap relative z-0">
                    {activeSectionSlug === 'assistant' ? (
                        <PortfolioAssistant enabled={assistantEnabled} />
                    ) : null}
                    {sections
                        .filter((section) => section.slug === activeSectionSlug)
                        .map((section) => (
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
                    {!hasVisibleContent ? (
                        <section
                            className="flex min-h-[60vh] items-center py-24"
                            aria-labelledby="empty-portfolio-heading"
                        >
                            <div className="max-w-xl">
                                <p className="eyebrow mb-3">Portfolio</p>
                                <h1
                                    id="empty-portfolio-heading"
                                    className="font-display text-4xl font-medium tracking-tight sm:text-5xl"
                                >
                                    {siteName}
                                </h1>
                                <p className="mt-4 text-base leading-7 text-muted-foreground">
                                    New work is on its way. In the meantime,
                                    feel free to get in touch.
                                </p>
                                {site.email ? (
                                    <a
                                        href={`mailto:${site.email}`}
                                        className="mt-6 inline-flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                                    >
                                        <Mail
                                            className="size-4"
                                            aria-hidden="true"
                                        />
                                        Email {siteName}
                                    </a>
                                ) : null}
                            </div>
                        </section>
                    ) : null}
                </main>
            </div>
        </>
    );
}
