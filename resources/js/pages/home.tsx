import { Head } from '@inertiajs/react';
import { ArrowUpRight, ExternalLink, Mail } from 'lucide-react';

import { Button } from '@/components/ui/button';
import type { Certificate, SiteSettings } from '@/types';

interface HomeProps {
    settings: SiteSettings | null;
    certificates: Certificate[];
}

export default function Home({ settings, certificates }: HomeProps) {
    const site = settings ?? {
        site_name: "Milan's Portfolio",
        hero_title: 'I build thoughtful digital products.',
        hero_subtitle: 'Laravel & React developer',
        hero_description: 'I design and build fast, accessible, maintainable web experiences.',
        about_title: 'About me',
        about_description: 'I am a developer focused on building useful, elegant, and maintainable digital products.',
        skills_content: 'Laravel\nReact\nTypeScript\nMySQL\nTailwind CSS',
        projects_content: 'Portfolio platform — an editable Laravel and React showcase.',
        experience_content: 'Full-stack developer — building production-ready web applications.',
        contact_content: "I'd love to hear about your next project.",
        primary_cta_label: 'View my work',
        primary_cta_url: '#projects',
        secondary_cta_label: 'Contact me',
        secondary_cta_url: '#contact',
        email: null,
        github_url: null,
        linkedin_url: null,
        is_available: true,
        theme_preset: 'instagram',
        glass_blur: 'xl',
        glass_opacity: '75',
    } as SiteSettings;

    const background = settings?.background_media?.url;
    const logo = settings?.logo_media?.url;
    const lines = (value: string | null) => (value || '').split('\n').map((line) => line.trim()).filter(Boolean);

    return (
        <>
            <Head title={site.site_name} />
            <main className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
                <div className="absolute inset-0 bg-cover bg-center" style={background ? { backgroundImage: `url(${background})` } : undefined} />
                <div className="absolute inset-0 bg-slate-950/75" />
                <div className="relative mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-6 lg:px-10">
                    <header className="flex items-center justify-between border-b border-white/10 pb-5">
                        <a href="/" className="flex items-center gap-3 font-semibold tracking-tight">
                            {logo ? <img src={logo} alt={site.site_name} className="size-9 rounded-lg object-contain" /> : null}
                            <span>{site.site_name}</span>
                        </a>
                        <div className="flex items-center gap-2 text-sm text-white/70">
                            {site.is_available ? <span className="hidden rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1 text-emerald-200 sm:inline">Available for work</span> : null}
                            {site.email ? <a href={`mailto:${site.email}`} className="rounded-full border border-white/15 px-4 py-2 hover:bg-white/10">Contact</a> : null}
                        </div>
                    </header>

                    <section className="flex flex-1 items-center py-24">
                        <div className="max-w-3xl">
                            <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-white/60">{site.hero_subtitle}</p>
                            <h1 className="max-w-3xl text-5xl font-semibold tracking-tight sm:text-7xl">{site.hero_title}</h1>
                            <p className="mt-7 max-w-2xl text-lg leading-8 text-white/70">{site.hero_description}</p>
                            <div className="mt-9 flex flex-wrap gap-3">
                                <Button render={<a href={site.primary_cta_url}>{site.primary_cta_label}<ArrowUpRight className="size-4" /></a>} />
                                <Button variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white" render={<a href={site.secondary_cta_url}>{site.secondary_cta_label}</a>} />
                            </div>
                        </div>
                    </section>

                    <section className="grid gap-5 border-t border-white/10 py-16 md:grid-cols-2">
                        <article id="about" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:col-span-2">
                            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">#about</p>
                            <h2 className="text-2xl font-semibold">{site.about_title}</h2>
                            <p className="mt-4 max-w-3xl whitespace-pre-line leading-7 text-white/70">{site.about_description}</p>
                        </article>
                        <article id="skills" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">#skills</p>
                            <h2 className="text-2xl font-semibold">Technical toolkit</h2>
                            <div className="mt-5 flex flex-wrap gap-2">{lines(site.skills_content).map((item) => <span key={item} className="rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white/75">{item}</span>)}</div>
                        </article>
                        <article id="experience" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl">
                            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">#experience</p>
                            <h2 className="text-2xl font-semibold">Journey</h2>
                            <div className="mt-5 space-y-3 text-white/70">{lines(site.experience_content).map((item) => <p key={item} className="border-l-2 border-white/20 pl-4">{item}</p>)}</div>
                        </article>
                        <article id="projects" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:col-span-2">
                            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">#projects</p>
                            <h2 className="text-2xl font-semibold">Selected work</h2>
                            <div className="mt-5 grid gap-3 md:grid-cols-2">{lines(site.projects_content).map((item) => <div key={item} className="rounded-xl border border-white/10 bg-black/10 p-4 text-white/70">{item}</div>)}</div>
                        </article>
                        <article id="certificates" className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl md:col-span-2">
                            <p className="mb-3 text-xs uppercase tracking-[0.25em] text-white/50">#certificates</p>
                            <h2 className="text-2xl font-semibold">Certificates & achievements</h2>
                            <div className="mt-5 grid gap-3 md:grid-cols-2">{certificates.map((certificate) => <div key={certificate.id} className="flex gap-4 rounded-xl border border-white/10 bg-black/10 p-4">{certificate.media?.url ? <img src={certificate.media.url} alt={certificate.title} className="size-14 shrink-0 rounded-lg object-contain" /> : null}<div><h3 className="font-medium">{certificate.title}</h3><p className="text-sm text-white/60">{certificate.issuer}{certificate.issued_at ? ` · ${certificate.issued_at}` : ''}</p>{certificate.description ? <p className="mt-2 text-sm text-white/60">{certificate.description}</p> : null}{certificate.credential_url ? <a href={certificate.credential_url} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm text-white underline">View credential</a> : null}</div></div>)}</div>
                        </article>
                    </section>

                    <footer id="contact" className="flex flex-wrap items-center gap-4 border-t border-white/10 pt-5 text-sm text-white/60">
                        <span className="basis-full text-white/70">{site.contact_content}</span>
                        {site.email ? <a href={`mailto:${site.email}`} className="flex items-center gap-2 hover:text-white"><Mail className="size-4" />{site.email}</a> : null}
                        {site.github_url ? <a href={site.github_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><ExternalLink className="size-4" />GitHub</a> : null}
                        {site.linkedin_url ? <a href={site.linkedin_url} target="_blank" rel="noreferrer" className="flex items-center gap-2 hover:text-white"><ExternalLink className="size-4" />LinkedIn</a> : null}
                    </footer>
                </div>
            </main>
        </>
    );
}
