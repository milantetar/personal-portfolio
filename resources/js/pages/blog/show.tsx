import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';

import { Navbar } from '@/components/navbar/navbar';
import { absoluteSiteUrl, canonicalSiteUrl, metaDescription } from '@/lib/seo';
import type { PageProps, Post, SiteSettings } from '@/types';

interface BlogShowProps extends PageProps {
    settings: SiteSettings | null;
    post: Post;
}

function formatDate(value: string | null): string {
    if (!value) return 'Unpublished';

    return new Date(value).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

function paragraphBlocks(content: string): string[] {
    return content
        .split(/\r?\n{2,}/)
        .map((block) => block.trim())
        .filter((block) => block !== '');
}

export default function BlogShow({ settings, post }: BlogShowProps) {
    const page = usePage<PageProps>();
    const { branding, seo } = page.props;
    const siteName = branding?.siteName || settings?.site_name || 'Portfolio';
    const siteUrl = seo?.siteUrl || 'https://mtportfolio.tech';
    const canonicalUrl = canonicalSiteUrl(siteUrl, page.url);
    const description = metaDescription(
        post.excerpt || contentSummary(post.content),
        `${post.title} — an article by ${siteName}.`,
    );
    const socialImage = post.cover_media?.url
        ? absoluteSiteUrl(siteUrl, post.cover_media.url)
        : branding?.backgroundImage?.url
          ? absoluteSiteUrl(siteUrl, branding.backgroundImage.url)
          : undefined;
    const faviconUrl = branding?.favicon?.url
        ? absoluteSiteUrl(siteUrl, branding.favicon.url)
        : absoluteSiteUrl(siteUrl, '/favicon.ico');
    const structuredData = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: post.title,
        description,
        mainEntityOfPage: canonicalUrl,
        ...(post.published_at ? { datePublished: post.published_at } : {}),
        ...(post.updated_at ? { dateModified: post.updated_at } : {}),
        author: { '@type': 'Person', name: siteName },
        ...(socialImage ? { image: socialImage } : {}),
    };

    return (
        <>
            <Head title={`${post.title} — ${siteName}`}>
                <meta name="description" content={description} />
                <meta name="robots" content="index,follow" />
                <link rel="canonical" href={canonicalUrl} />
                <link head-key="icon" rel="icon" href={faviconUrl} />

                <meta property="og:type" content="article" />
                <meta property="og:site_name" content={siteName} />
                <meta property="og:title" content={post.title} />
                <meta property="og:description" content={description} />
                <meta property="og:url" content={canonicalUrl} />
                {post.published_at ? (
                    <meta
                        property="article:published_time"
                        content={post.published_at}
                    />
                ) : null}
                {socialImage ? (
                    <meta property="og:image" content={socialImage} />
                ) : null}
                {socialImage ? (
                    <meta
                        property="og:image:alt"
                        content={post.cover_media?.alt_text || post.title}
                    />
                ) : null}

                <meta
                    name="twitter:card"
                    content={socialImage ? 'summary_large_image' : 'summary'}
                />
                <meta name="twitter:title" content={post.title} />
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

                <main className="mx-auto w-full max-w-3xl flex-1 px-4 py-16 sm:px-6">
                    <Link
                        href="/blog"
                        className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        <ArrowLeft className="size-4" aria-hidden="true" />
                        All writing
                    </Link>

                    <article className="mt-8">
                        <header className="border-b border-border pb-8">
                            <div className="mb-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                                <time dateTime={post.published_at ?? undefined}>
                                    {formatDate(post.published_at)}
                                </time>
                                <span aria-hidden="true">·</span>
                                <span>{post.read_time_minutes} min read</span>
                            </div>

                            <h1 className="font-display text-4xl font-medium tracking-tight text-balance sm:text-5xl">
                                {post.title}
                            </h1>

                            {post.excerpt ? (
                                <p className="mt-5 text-lg leading-8 text-muted-foreground">
                                    {post.excerpt}
                                </p>
                            ) : null}

                            {post.tags?.length ? (
                                <ul
                                    className="mt-6 flex flex-wrap gap-2"
                                    aria-label="Tags"
                                >
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
                        </header>

                        {post.cover_media?.url ? (
                            <img
                                src={post.cover_media.url}
                                alt={post.cover_media.alt_text || post.title}
                                className="mt-8 w-full border border-border object-cover"
                            />
                        ) : null}

                        <div className="mt-10 space-y-6 text-base leading-8 text-foreground/90">
                            {paragraphBlocks(post.content).map(
                                (block, index) => (
                                    <p
                                        key={index}
                                        className="whitespace-pre-line"
                                    >
                                        {block}
                                    </p>
                                ),
                            )}
                        </div>
                    </article>

                    <footer className="mt-14 border-t border-border pt-8">
                        <Link
                            href="/blog"
                            className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
                        >
                            <ArrowLeft className="size-4" aria-hidden="true" />
                            More from the blog
                        </Link>
                    </footer>
                </main>
            </div>
        </>
    );
}

function contentSummary(content: string): string {
    const plain = content.replace(/\s+/g, ' ').trim();

    return plain.length > 160 ? `${plain.slice(0, 157).trimEnd()}...` : plain;
}
