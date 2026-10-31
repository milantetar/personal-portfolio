import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight } from 'lucide-react';

import { Navbar } from '@/components/navbar/navbar';
import { absoluteSiteUrl, canonicalSiteUrl, metaDescription } from '@/lib/seo';
import type { PageProps, PaginatedPosts, Post, SiteSettings } from '@/types';

interface BlogIndexProps extends PageProps {
    settings: SiteSettings | null;
    posts: PaginatedPosts;
}

function formatDate(value: string | null): string {
    if (!value) return 'Unpublished';

    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function PostCard({ post }: { post: Post }) {
    return (
        <article className="group grid gap-5 border-b border-border py-8 first:pt-0 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start">
            <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    <time dateTime={post.published_at ?? undefined}>
                        {formatDate(post.published_at)}
                    </time>
                    <span aria-hidden="true">·</span>
                    <span>{post.read_time_minutes} min read</span>
                </div>

                <h2 className="font-display text-2xl font-medium tracking-tight text-foreground sm:text-3xl">
                    <Link
                        href={`/blog/${post.slug}`}
                        className="transition-colors hover:text-primary"
                    >
                        {post.title}
                    </Link>
                </h2>

                {post.excerpt ? (
                    <p className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                        {post.excerpt}
                    </p>
                ) : null}

                {post.tags?.length ? (
                    <ul className="mt-4 flex flex-wrap gap-2" aria-label="Tags">
                        {post.tags.map((tag) => (
                            <li
                                key={tag}
                                className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground"
                            >
                                {tag}
                            </li>
                        ))}
                    </ul>
                ) : null}
            </div>

            <Link
                href={`/blog/${post.slug}`}
                className="inline-flex items-center gap-2 self-start rounded-md border border-border px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
                Read
                <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
        </article>
    );
}

export default function BlogIndex({ settings, posts }: BlogIndexProps) {
    const page = usePage<PageProps>();
    const { branding, seo } = page.props;
    const siteName = branding?.siteName || settings?.site_name || 'Portfolio';
    const siteUrl = seo?.siteUrl || 'https://mtportfolio.tech';
    const title =
        posts.current_page > 1
            ? `Writing — ${siteName} (Page ${posts.current_page})`
            : `Writing — ${siteName}`;
    const description = metaDescription(
        `Articles on PHP, Laravel, backend engineering, and software projects by ${siteName}.`,
        `Writing and project notes from ${siteName}.`,
    );
    const canonicalUrl = canonicalSiteUrl(siteUrl, page.url, {
        preservePage: true,
    });
    const faviconUrl = branding?.favicon?.url
        ? absoluteSiteUrl(siteUrl, branding.favicon.url)
        : absoluteSiteUrl(siteUrl, '/favicon.ico');
    const socialImage = branding?.backgroundImage?.url
        ? absoluteSiteUrl(siteUrl, branding.backgroundImage.url)
        : undefined;
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Blog',
        name: `${siteName} — Writing`,
        description,
        url: canonicalUrl,
        publisher: { '@type': 'Person', name: siteName },
    };

    return (
        <>
            <Head title={title}>
                <meta name="description" content={description} />
                <meta name="robots" content="index,follow" />
                <link rel="canonical" href={canonicalUrl} />
                <link head-key="icon" rel="icon" href={faviconUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                {socialImage ? (
                    <meta property="og:image" content={socialImage} />
                ) : null}
                <meta
                    name="twitter:card"
                    content={socialImage ? 'summary_large_image' : 'summary'}
                />
                <meta name="twitter:title" content={title} />
                <meta name="twitter:description" content={description} />
                {socialImage ? (
                    <meta name="twitter:image" content={socialImage} />
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

            <div className="flex min-h-dvh flex-col bg-background text-foreground">
                <Navbar />

                <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-16 sm:px-6">
                    <p className="eyebrow mb-3">Writing</p>
                    <h1 className="font-display text-4xl font-medium tracking-tight sm:text-5xl">
                        Notes and articles
                    </h1>
                    <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
                        Thoughts on building software, design decisions, and the
                        occasional lesson learned the hard way.
                    </p>

                    <div className="mt-12">
                        {posts.data.length ? (
                            posts.data.map((post) => (
                                <PostCard key={post.id} post={post} />
                            ))
                        ) : (
                            <div className="border border-dashed border-border px-6 py-16 text-center">
                                <p className="font-display text-2xl font-medium">
                                    Nothing published yet
                                </p>
                                <p className="mt-2 text-sm text-muted-foreground">
                                    New writing will appear here as soon as it
                                    is ready.
                                </p>
                                <Link
                                    href="/"
                                    className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                                >
                                    Back to the portfolio
                                    <ArrowRight
                                        className="size-4"
                                        aria-hidden="true"
                                    />
                                </Link>
                            </div>
                        )}
                    </div>

                    {posts.last_page > 1 ? (
                        <nav
                            aria-label="Blog pagination"
                            className="mt-12 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6 text-sm"
                        >
                            {posts.links.map((link, index) => {
                                if (!link.url) {
                                    return (
                                        <span
                                            key={`${link.label}-${index}`}
                                            className="text-muted-foreground/60"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    );
                                }

                                return (
                                    <Link
                                        key={`${link.label}-${index}`}
                                        href={link.url}
                                        preserveScroll
                                        className={`rounded-md px-3 py-2 transition-colors ${link.active ? 'bg-foreground text-background' : 'text-muted-foreground hover:bg-accent hover:text-foreground'}`}
                                        aria-current={
                                            link.active ? 'page' : undefined
                                        }
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                );
                            })}
                        </nav>
                    ) : null}
                </main>
            </div>
        </>
    );
}
