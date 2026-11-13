import { Head, Link, usePage } from '@inertiajs/react';
import { useReducedMotion } from 'motion/react';
import { Mail, Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

import { PortfolioAssistant } from '@/components/portfolio/portfolio-assistant';
import { GitHubIcon, LinkedInIcon } from '@/components/portfolio/brand-icons';
import { PortfolioSectionRenderer } from '@/components/portfolio/portfolio-section-renderer';
import {
    PortfolioThemePicker,
    type PortfolioTheme,
} from '@/components/portfolio/portfolio-theme-picker';
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

function isPortfolioTheme(value: string | null): value is PortfolioTheme {
    return (
        value === 'midnight' ||
        value === 'forest' ||
        value === 'ocean' ||
        value === 'instagram'
    );
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
    const activeSection = sections.find(
        (section) => section.slug === activeSectionSlug,
    );
    const site = settings ?? ({} as SiteSettings);
    const initialTheme: PortfolioTheme = isPortfolioTheme(site.theme_preset)
        ? site.theme_preset
        : 'midnight';
    const [portfolioTheme, setPortfolioTheme] =
        useState<PortfolioTheme>(initialTheme);

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
        pageTitle === siteName ? siteName : `${pageTitle} — ${siteName}`;
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
        try {
            const savedTheme = window.localStorage.getItem(
                'portfolio-home-theme',
            );
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
    const backdropIntensity = Math.min(
        100,
        Math.max(0, Number(site.glass_opacity ?? 72)),
    );
    const backdropScrimOpacity = Math.min(
        0.68,
        0.34 + backdropIntensity * 0.002,
    );

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
                data-theme={portfolioTheme}
                className="portfolio-site relative isolate min-h-screen overflow-clip bg-transparent text-foreground"
                style={
                    {
                        '--portfolio-scrim-opacity': `${backdropScrimOpacity}`,
                    } as CSSProperties
                }
            >
                <div
                    className="portfolio-backdrop fixed inset-0 -z-20 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url("${backdrop}")` }}
                    aria-hidden="true"
                />
                <div
                    className="portfolio-backdrop-scrim pointer-events-none fixed inset-0 -z-10"
                    aria-hidden="true"
                />

                <header className="portfolio-nav-glass sticky top-0 z-40">
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
                                <img
                                    src={logo}
                                    alt=""
                                    width="32"
                                    height="32"
                                    className="size-8 object-contain"
                                />
                            ) : null}
                            <span className="font-display text-xl font-semibold tracking-tight">
                                {site.site_name || 'Portfolio'}
                            </span>
                        </Link>

                        <div className="hidden items-center gap-6 md:flex lg:gap-8">
                            {homepageNavbar?.items.map((item) => {
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
                        </div>

                        <div className="flex items-center gap-3 text-muted-foreground">
                            <PortfolioThemePicker
                                value={portfolioTheme}
                                onChange={changePortfolioTheme}
                            />
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
                            className="portfolio-mobile-navigation portfolio-wrap grid gap-1 border-t border-border py-2 md:hidden"
                        >
                            {homepageNavbar?.items.map((item) => {
                                const href = portfolioHref(
                                    item.url,
                                    sections,
                                    item.label,
                                );
                                const className =
                                    'rounded-lg px-3 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent/70 hover:text-foreground';
                                const closeMenu = () => setIsMenuOpen(false);

                                return isInternalPortfolioHref(href) ? (
                                    <Link
                                        key={item.id}
                                        href={href}
                                        prefetch="hover"
                                        onClick={closeMenu}
                                        className={className}
                                    >
                                        {navigationLabel(item.label)}
                                    </Link>
                                ) : (
                                    <a
                                        key={item.id}
                                        href={href}
                                        onClick={closeMenu}
                                        className={className}
                                    >
                                        {navigationLabel(item.label)}
                                    </a>
                                );
                            })}
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
