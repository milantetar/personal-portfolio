import { useState, type FormEvent, type ReactNode } from 'react';
import { useForm } from '@inertiajs/react';
import { motion } from 'motion/react';
import { ArrowUpRight, ExternalLink, FileText, Mail, Star } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { GitHubIcon, LinkedInIcon } from '@/components/portfolio/brand-icons';
import type { Certificate, GitHubProject, PortfolioSection, SiteSettings } from '@/types';

interface PortfolioSectionRendererProps {
    section: PortfolioSection;
    site: SiteSettings;
    certificates: Certificate[];
    projects: GitHubProject[];
    githubUrl?: string | null;
    resumeUrl?: string | null;
    reduceMotion: boolean;
    contactSuccess?: string;
    contactError?: string;
}

function stringValue(content: Record<string, unknown> | null, key: string, fallback = ''): string {
    const value = content?.[key];
    return typeof value === 'string' ? value : fallback;
}

function lines(value: string | null): string[] {
    return (value || '').split('\n').map((line) => line.trim()).filter(Boolean);
}

function blocks(value: string | null): string[] {
    return (value || '').split(/\n\s*\n/).map((block) => block.trim()).filter(Boolean);
}

function LinkifiedText({ value, className = '' }: { value: string; className?: string }) {
    return (
        <span className={className}>
            {value.split(/(https?:\/\/[^\s]+)/g).map((part, index) =>
                /^https?:\/\//.test(part) ? (
                    <a key={`${part}-${index}`} href={part} target="_blank" rel="noreferrer" className="underline decoration-border underline-offset-4 transition-colors hover:decoration-primary">
                        {part}
                    </a>
                ) : part,
            )}
        </span>
    );
}

function Reveal({ children, className, reduceMotion }: { children: ReactNode; className: string; reduceMotion: boolean }) {
    return (
        <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-48px' }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            className={className}
        >
            {children}
        </motion.div>
    );
}

function SectionIntro({ section, hero = false }: { section: PortfolioSection; hero?: boolean }) {
    return (
        <header className={`min-w-0 ${hero ? 'max-w-5xl text-left' : ''}`}>
            {hero ? (
                <h1 id={`${section.slug}-heading`} className="max-w-4xl font-display text-[clamp(2rem,5.2vw,5rem)] font-semibold leading-[0.98] tracking-tighter text-foreground">
                    {section.title}
                </h1>
            ) : (
                <h2 id={`${section.slug}-heading`} className="font-display text-3xl font-medium leading-tight tracking-tight text-foreground sm:text-4xl">
                    {section.title}
                </h2>
            )}
        </header>
    );
}

function SectionFrame({ section, children, reduceMotion, hero = false }: { section: PortfolioSection; children: ReactNode; reduceMotion: boolean; hero?: boolean }) {
    const frameClassName = hero
        ? 'portfolio-section portfolio-section--hero portfolio-hero px-4 py-12 sm:px-8 sm:py-16 lg:px-12'
        : `portfolio-section portfolio-section--${section.type} portfolio-editorial-section px-5 py-8 sm:px-8 sm:py-10 lg:px-10 lg:py-12`;

    return (
        <section id={section.slug} aria-labelledby={`${section.slug}-heading`} className={`scroll-mt-24 ${frameClassName}`}>
            <Reveal reduceMotion={reduceMotion} className={`portfolio-section-inner ${hero ? 'portfolio-hero-layout' : 'flex flex-col gap-6 sm:gap-8'}`}>
                <div className="portfolio-section-heading">
                    <SectionIntro section={section} hero={hero} />
                </div>
                {children}
            </Reveal>
        </section>
    );
}

function CertificateMedia({ certificate }: { certificate: Certificate }) {
    const [hasError, setHasError] = useState(false);
    const media = certificate.media;

    if (!media || hasError || !media.mime_type.startsWith('image/')) {
        return (
            <span className="flex size-12 shrink-0 items-center justify-center border border-border bg-muted/50 text-muted-foreground" aria-label={media ? 'Certificate document' : 'No certificate preview'}>
                <FileText className="size-4" aria-hidden="true" />
            </span>
        );
    }

    return <img src={media.url} alt={`${certificate.title} certificate`} loading="lazy" width="48" height="48" className="size-12 shrink-0 border border-border bg-muted/40 object-contain p-1" onError={() => setHasError(true)} />;
}

function ContactForm({ success, failure }: { success?: string; failure?: string }) {
    const { data, errors, processing, post, reset, setData } = useForm({
        name: '',
        email: '',
        subject: '',
        message: '',
        website: '',
    });

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        post('/contact', { preserveScroll: true, onSuccess: () => reset() });
    };

    return (
        <form onSubmit={submit} className="portfolio-glass mt-8 grid gap-4 p-4 sm:grid-cols-2 sm:p-5">
            <div className="space-y-1.5">
                <Label htmlFor="contact-name">Name</Label>
                <Input id="contact-name" autoComplete="name" value={data.name} onChange={(event) => setData('name', event.target.value)} aria-invalid={Boolean(errors.name)} />
                {errors.name ? <p className="text-xs text-destructive">{errors.name}</p> : null}
            </div>
            <div className="space-y-1.5">
                <Label htmlFor="contact-email">Email</Label>
                <Input id="contact-email" type="email" autoComplete="email" value={data.email} onChange={(event) => setData('email', event.target.value)} aria-invalid={Boolean(errors.email)} />
                {errors.email ? <p className="text-xs text-destructive">{errors.email}</p> : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="contact-subject">Subject</Label>
                <Input id="contact-subject" value={data.subject} onChange={(event) => setData('subject', event.target.value)} aria-invalid={Boolean(errors.subject)} />
                {errors.subject ? <p className="text-xs text-destructive">{errors.subject}</p> : null}
            </div>
            <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="contact-message">Message</Label>
                <textarea
                    id="contact-message"
                    rows={5}
                    value={data.message}
                    onChange={(event) => setData('message', event.target.value)}
                    aria-invalid={Boolean(errors.message)}
                    className="flex min-h-32 w-full resize-y rounded-md border border-input bg-background/45 px-3 py-2 text-sm leading-6 outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 aria-invalid:border-destructive"
                />
                {errors.message ? <p className="text-xs text-destructive">{errors.message}</p> : null}
            </div>
            <div className="absolute left-[-10000px] size-px overflow-hidden" aria-hidden="true">
                <label htmlFor="contact-website">Leave this field empty</label>
                <input id="contact-website" tabIndex={-1} autoComplete="off" value={data.website} onChange={(event) => setData('website', event.target.value)} />
            </div>
            <div className="flex flex-col items-start gap-3 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
                <p aria-live="polite" className="text-sm text-muted-foreground">{success || failure || 'Your message goes directly to my inbox.'}</p>
                <Button type="submit" disabled={processing}>
                    {processing ? 'Sending…' : 'Send message'}
                    {!processing ? <ArrowUpRight className="size-4" aria-hidden="true" /> : null}
                </Button>
            </div>
        </form>
    );
}

export function PortfolioSectionRenderer({ section, site, certificates, projects, githubUrl, resumeUrl, reduceMotion, contactSuccess, contactError }: PortfolioSectionRendererProps) {
    const content = section.content as Record<string, unknown> | null;
    const title = section.title || '';
    const profileUrl = githubUrl || site.github_url;

    if (section.type === 'hero') {
        const description = stringValue(content, 'description', site.hero_description || '');
        const primaryLabel = stringValue(content, 'primary_cta_label', site.primary_cta_label || 'View projects');
        const primaryUrl = stringValue(content, 'primary_cta_url', site.primary_cta_url || '#projects');
        const secondaryLabel = stringValue(content, 'secondary_cta_label', site.secondary_cta_label || 'Contact');
        const secondaryUrl = stringValue(content, 'secondary_cta_url', site.secondary_cta_url || '#contact');

        return (
            <SectionFrame section={section} reduceMotion={reduceMotion} hero>
                <div className="portfolio-hero-content">
                    {description ? <p className="max-w-2xl whitespace-pre-line text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8">{description}</p> : null}
                    <div className="mt-6 flex flex-wrap items-center gap-3">
                            {primaryUrl && primaryLabel ? <Button asChild size="default"><a href={primaryUrl}>{primaryLabel}<ArrowUpRight className="size-4" /></a></Button> : null}
                            {resumeUrl ? <Button variant="outline" asChild><a href={resumeUrl} download>Download résumé<ArrowUpRight className="size-4" /></a></Button> : secondaryUrl && secondaryLabel ? <Button variant="outline" asChild><a href={secondaryUrl}>{secondaryLabel}</a></Button> : null}
                    </div>
                    {site.is_available ? <p className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground"><span className="size-2 rounded-full bg-primary ring-4 ring-primary/15" />Available for work</p> : null}
                </div>
            </SectionFrame>
        );
    }

    if (section.type === 'about') {
        return (
            <SectionFrame section={section} reduceMotion={reduceMotion}>
                <LinkifiedText value={stringValue(content, 'description', site.about_description || '')} className="block max-w-3xl whitespace-pre-line text-base leading-7 text-muted-foreground sm:text-lg sm:leading-8" />
            </SectionFrame>
        );
    }

    if (section.type === 'skills') {
        const skillGroups = blocks(stringValue(content, 'body', site.skills_content || ''));
        const parseSkill = (item: string) => item
            .replace(/\s*[-:]\s*\d{1,3}%?$/, '')
            .replace(/\s+\(\d{1,3}%\)$/, '')
            .trim();

        return (
            <SectionFrame section={section} reduceMotion={reduceMotion}>
                <div className="grid gap-8 sm:grid-cols-2 xl:grid-cols-3">
                    {skillGroups.map((group) => {
                        const items = lines(group);
                        if (items.length === 1) {
                            return <p key={group} className="col-span-full border-t border-border pt-3 text-xs leading-5 text-muted-foreground">{items[0]}</p>;
                        }

                        return (
                            <div key={group} className="border-t border-border pt-3">
                                <h3 className="mb-4 text-sm font-semibold">{items[0]}</h3>
                                <ul className="flex flex-wrap gap-2">
                                    {items.slice(1).map(parseSkill).filter(Boolean).map((skill) => (
                                        <li key={skill} className="rounded-md border border-border/80 bg-background/35 px-2.5 py-1.5 text-xs font-medium text-foreground/90">
                                            {skill}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        );
                    })}
                </div>
            </SectionFrame>
        );
    }

    if (section.type === 'experience') {
        const experienceItems = lines(stringValue(content, 'body', site.experience_content || ''));

        return (
            <SectionFrame section={section} reduceMotion={reduceMotion}>
                <ol className="max-w-3xl space-y-0">
                    {experienceItems.map((item, index) => {
                        const isRole = /\b(?:trainee|engineer|developer|intern)\b/i.test(item);

                        return (
                        <li key={`${index}-${item}`} className={`relative border-l border-border pl-5 text-sm leading-7 first:pt-0 last:pb-0 ${isRole ? 'pt-4 pb-1' : 'py-1'}`}>
                            <span className={`absolute -left-1 top-2 size-2 rounded-full border ${isRole ? 'border-primary bg-primary' : 'border-border bg-background'}`} aria-hidden="true" />
                            <LinkifiedText value={item} className={isRole ? 'font-medium text-foreground' : 'text-muted-foreground'} />
                        </li>
                        );
                    })}
                </ol>
            </SectionFrame>
        );
    }

    if (section.type === 'projects') {
        const configuredProjects = blocks(stringValue(content, 'body', site.projects_content || ''));
        return (
            <SectionFrame section={section} reduceMotion={reduceMotion}>
                <div className="min-w-0">
                    {configuredProjects.length ? (
                        <>
                            <h3 className="eyebrow mb-3">Featured projects</h3>
                            <div className="divide-y divide-border/80 border-y border-border/80">
                                {configuredProjects.map((project) => {
                                    const [projectTitle, ...details] = project.split('\n');

                                    return (
                                        <article key={project} className="py-4 sm:py-5">
                                            <h4 className="font-semibold text-foreground">{projectTitle}</h4>
                                            {details.length ? <LinkifiedText value={details.join('\n')} className="mt-2 block whitespace-pre-line text-sm leading-7 text-muted-foreground" /> : null}
                                        </article>
                                    );
                                })}
                            </div>
                        </>
                    ) : null}
                    {projects.length ? (
                        <div className="mt-7">
                            {configuredProjects.length ? <h3 className="eyebrow mb-3">Public GitHub repositories</h3> : null}
                            <div className="divide-y divide-border/80 border-y border-border/80">
                            {projects.map((project) => (
                                <article key={project.id} className="grid gap-2 py-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:gap-4">
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                                            <h3 className="font-semibold">{project.name}</h3>
                                            {project.language ? <span className="font-mono text-[11px] text-muted-foreground">{project.language}</span> : null}
                                        </div>
                                        {project.description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{project.description}</p> : null}
                                        {project.topics.length ? <ul className="mt-3 flex flex-wrap gap-x-3 gap-y-1">{project.topics.slice(0, 4).map((topic) => <li key={topic} className="font-mono text-[10px] text-muted-foreground">{topic}</li>)}</ul> : null}
                                    </div>
                                    <div className="flex items-center gap-4 pl-10 text-xs text-muted-foreground sm:pl-0">
                                        <span className="inline-flex items-center gap-1"><Star className="size-3" />{project.stargazers_count}</span>
                                        <a href={project.homepage || project.html_url} target="_blank" rel="noreferrer" aria-label={`Open ${project.name}`} className="inline-flex items-center gap-1 text-foreground transition-colors hover:text-primary">Open<ArrowUpRight className="size-3.5" /></a>
                                    </div>
                                </article>
                            ))}
                            </div>
                        </div>
                    ) : null}
                    {profileUrl ? <a href={profileUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">All repositories<ExternalLink className="size-3.5" /></a> : null}
                </div>
            </SectionFrame>
        );
    }

    if (section.type === 'certifications') {
        return (
            <SectionFrame section={section} reduceMotion={reduceMotion}>
                {certificates.length ? (
                    <div className="divide-y divide-border/80 border-y border-border/80">
                        {certificates.map((certificate) => (
                            <article key={certificate.id} className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-3 py-4 sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:gap-4">
                                <CertificateMedia certificate={certificate} />
                                <div className="min-w-0">
                                    <h3 className="text-sm font-semibold">{certificate.title}</h3>
                                    <p className="mt-1 text-xs text-muted-foreground">{certificate.issuer}{certificate.issued_at ? ` · ${certificate.issued_at}` : ''}</p>
                                    {certificate.description ? <LinkifiedText value={certificate.description} className="mt-2 block text-xs leading-5 text-muted-foreground" /> : null}
                                </div>
                                <div className="col-start-3 flex flex-wrap gap-3 text-xs sm:col-start-auto">
                                    {certificate.media?.url ? <a href={certificate.media.url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">View file<ArrowUpRight className="size-3" /></a> : null}
                                    {certificate.credential_url ? <a href={certificate.credential_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground">Credential<ArrowUpRight className="size-3" /></a> : null}
                                </div>
                            </article>
                        ))}
                    </div>
                ) : null}
            </SectionFrame>
        );
    }

    if (section.type === 'contact') {
        return (
            <SectionFrame section={section} reduceMotion={reduceMotion}>
                <div className="max-w-3xl">
                    {stringValue(content, 'body', site.contact_content || '') ? <p className="max-w-2xl text-base leading-7 text-muted-foreground">{stringValue(content, 'body', site.contact_content || '')}</p> : null}
                    <div className="mt-6 flex flex-wrap gap-x-6 gap-y-3 text-sm">
                        {site.email ? <a href={`mailto:${site.email}`} className="inline-flex items-center gap-2 transition-colors hover:text-primary"><Mail className="size-4" aria-hidden="true" />{site.email}</a> : null}
                        {profileUrl ? <a href={profileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-primary"><GitHubIcon className="size-4" />GitHub</a> : null}
                        {site.linkedin_url ? <a href={site.linkedin_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-primary"><LinkedInIcon className="size-4" />LinkedIn</a> : null}
                    </div>
                    <ContactForm success={contactSuccess} failure={contactError} />
                </div>
            </SectionFrame>
        );
    }

    return (
        <SectionFrame section={section} reduceMotion={reduceMotion}>
            <LinkifiedText value={stringValue(content, 'body')} className="block max-w-3xl whitespace-pre-line text-sm leading-7 text-muted-foreground" />
        </SectionFrame>
    );
}
