import { Head, useForm, usePage } from '@inertiajs/react';
import { Image, Save, Settings2 } from 'lucide-react';
import { FormEvent, useEffect } from 'react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Media, PageProps, SiteSettings, SiteSettingsForm, SidebarItem } from '@/types';

interface SiteSettingsPageProps extends PageProps {
    settings: SiteSettings;
    mediaItems: Media[];
    settingsSidebarItem: SidebarItem;
}

function FieldError({ message }: { message?: string }) {
    return message ? <p className="text-xs text-destructive">{message}</p> : null;
}

export default function SiteSettingsPage() {
    const { settings, mediaItems, settingsSidebarItem, sidebarItems, branding } = usePage<SiteSettingsPageProps>().props;
    const { data, setData, put, processing, errors } = useForm<SiteSettingsForm>({
        site_name: settings.site_name || "Milan's Portfolio",
        hero_title: settings.hero_title || '',
        hero_subtitle: settings.hero_subtitle || '',
        hero_description: settings.hero_description || '',
        about_title: settings.about_title || 'About me',
        about_description: settings.about_description || '',
        skills_content: settings.skills_content || '',
        projects_content: settings.projects_content || '',
        experience_content: settings.experience_content || '',
        contact_content: settings.contact_content || '',
        primary_cta_label: settings.primary_cta_label || 'View my work',
        primary_cta_url: settings.primary_cta_url || '#projects',
        secondary_cta_label: settings.secondary_cta_label || 'Contact me',
        secondary_cta_url: settings.secondary_cta_url || '#contact',
        email: settings.email || '',
        github_url: settings.github_url || '',
        linkedin_url: settings.linkedin_url || '',
        is_available: settings.is_available,
        theme_preset: settings.theme_preset || 'instagram',
        glass_blur: settings.glass_blur || 'xl',
        glass_opacity: settings.glass_opacity || '75',
        settings_icon_media_id: settingsSidebarItem.icon_media_id,
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0) toast.error('Please correct the highlighted fields.');
    }, [errors]);

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put('/dashboard/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('Site settings saved.'),
        });
    };

    const update = <K extends keyof SiteSettingsForm>(key: K, value: SiteSettingsForm[K]) =>
        setData((current) => ({ ...current, [key]: value }));

    return (
        <>
            <Head title="Site Settings" />
            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={branding?.backgroundImage?.url || settings.background_media?.url}
            >
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="rounded-xl bg-primary/15 p-2 text-primary"><Settings2 className="size-5" /></div>
                            <div>
                                <h1 className="text-2xl font-semibold tracking-tight">Site Settings</h1>
                                <p className="text-sm text-muted-foreground">Control your public portfolio from one place.</p>
                            </div>
                        </div>
                    </div>

                    <form onSubmit={submit} className="space-y-6">
                        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
                            <h2 className="text-lg font-semibold">Identity</h2>
                            <p className="mb-5 text-sm text-muted-foreground">This appears in the browser, navbar, and portfolio branding.</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2 md:col-span-2"><Label htmlFor="site_name">Site name</Label><Input id="site_name" value={data.site_name} onChange={(e) => update('site_name', e.target.value)} /><FieldError message={errors.site_name} /></div>
                                <div className="space-y-2"><Label htmlFor="hero_title">Hero title</Label><Input id="hero_title" value={data.hero_title} onChange={(e) => update('hero_title', e.target.value)} placeholder="I build thoughtful digital products." /><FieldError message={errors.hero_title} /></div>
                                <div className="space-y-2"><Label htmlFor="hero_subtitle">Hero subtitle</Label><Input id="hero_subtitle" value={data.hero_subtitle} onChange={(e) => update('hero_subtitle', e.target.value)} placeholder="Laravel & React developer" /><FieldError message={errors.hero_subtitle} /></div>
                                <div className="space-y-2 md:col-span-2"><Label htmlFor="hero_description">Hero description</Label><textarea id="hero_description" value={data.hero_description} onChange={(e) => update('hero_description', e.target.value)} className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none transition focus-visible:ring-3 focus-visible:ring-ring/50" /><FieldError message={errors.hero_description} /></div>
                            </div>
                        </section>

                        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
                            <h2 className="text-lg font-semibold">Portfolio sections</h2>
                            <p className="mb-5 text-sm text-muted-foreground">These sections form the channel-style portfolio layout. Use one item or paragraph per line for clean cards.</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label>About heading</Label><Input value={data.about_title} onChange={(e) => update('about_title', e.target.value)} /><FieldError message={errors.about_title} /></div>
                                <div className="space-y-2"><Label>About content</Label><textarea value={data.about_description} onChange={(e) => update('about_description', e.target.value)} className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /><FieldError message={errors.about_description} /></div>
                                <div className="space-y-2"><Label>Skills</Label><textarea placeholder="Laravel, React, TypeScript..." value={data.skills_content} onChange={(e) => update('skills_content', e.target.value)} className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /><FieldError message={errors.skills_content} /></div>
                                <div className="space-y-2"><Label>Projects</Label><textarea placeholder="Project name — short description" value={data.projects_content} onChange={(e) => update('projects_content', e.target.value)} className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /><FieldError message={errors.projects_content} /></div>
                                <div className="space-y-2"><Label>Experience</Label><textarea value={data.experience_content} onChange={(e) => update('experience_content', e.target.value)} className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /><FieldError message={errors.experience_content} /></div>
                                <div className="space-y-2"><Label>Contact message</Label><textarea value={data.contact_content} onChange={(e) => update('contact_content', e.target.value)} className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /><FieldError message={errors.contact_content} /></div>
                            </div>
                        </section>

                        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
                            <h2 className="text-lg font-semibold">Settings menu icon</h2>
                            <p className="mb-5 text-sm text-muted-foreground">Choose the icon displayed beside Site Settings in the admin sidebar. Upload new icons from Media Library first.</p>
                            <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                                <button type="button" onClick={() => update('settings_icon_media_id', null)} className={`flex aspect-square items-center justify-center rounded-xl border text-xs transition ${data.settings_icon_media_id === null ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'}`}>None</button>
                                {mediaItems.filter((media) => media.mime_type.startsWith('image/')).map((media) => (
                                    <button key={media.id} type="button" onClick={() => update('settings_icon_media_id', media.id)} className={`overflow-hidden rounded-xl border bg-background p-2 transition ${data.settings_icon_media_id === media.id ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'}`} title={media.title || media.original_name}>
                                        <img src={media.url} alt={media.alt_text || media.original_name} className="size-full aspect-square object-contain" />
                                    </button>
                                ))}
                            </div>
                            <FieldError message={errors.settings_icon_media_id} />
                        </section>

                        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
                            <h2 className="text-lg font-semibold">Calls to action</h2>
                            <p className="mb-5 text-sm text-muted-foreground">Choose the labels and destinations shown on your homepage.</p>
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2"><Label>Primary label</Label><Input value={data.primary_cta_label} onChange={(e) => update('primary_cta_label', e.target.value)} /><FieldError message={errors.primary_cta_label} /></div>
                                <div className="space-y-2"><Label>Primary URL</Label><Input value={data.primary_cta_url} onChange={(e) => update('primary_cta_url', e.target.value)} placeholder="#projects or https://..." /><FieldError message={errors.primary_cta_url} /></div>
                                <div className="space-y-2"><Label>Secondary label</Label><Input value={data.secondary_cta_label} onChange={(e) => update('secondary_cta_label', e.target.value)} /><FieldError message={errors.secondary_cta_label} /></div>
                                <div className="space-y-2"><Label>Secondary URL</Label><Input value={data.secondary_cta_url} onChange={(e) => update('secondary_cta_url', e.target.value)} placeholder="#contact or https://..." /><FieldError message={errors.secondary_cta_url} /></div>
                            </div>
                        </section>

                        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
                            <h2 className="text-lg font-semibold">Contact and social</h2>
                            <p className="mb-5 text-sm text-muted-foreground">Empty fields are hidden on the public homepage.</p>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2"><Label>Email</Label><Input type="email" value={data.email} onChange={(e) => update('email', e.target.value)} /><FieldError message={errors.email} /></div>
                                <div className="space-y-2"><Label>GitHub URL</Label><Input type="url" value={data.github_url} onChange={(e) => update('github_url', e.target.value)} /><FieldError message={errors.github_url} /></div>
                                <div className="space-y-2"><Label>LinkedIn URL</Label><Input type="url" value={data.linkedin_url} onChange={(e) => update('linkedin_url', e.target.value)} /><FieldError message={errors.linkedin_url} /></div>
                            </div>
                            <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm"><input type="checkbox" checked={data.is_available} onChange={(e) => update('is_available', e.target.checked)} className="size-4 accent-primary" /> Available for new opportunities</label>
                        </section>

                        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
                            <h2 className="text-lg font-semibold">Appearance</h2>
                            <p className="mb-5 text-sm text-muted-foreground">These values control the visual language used by the admin and public shell.</p>
                            <div className="grid gap-4 md:grid-cols-3">
                                <div className="space-y-2"><Label>Theme preset</Label><select value={data.theme_preset} onChange={(e) => update('theme_preset', e.target.value)} className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"><option value="instagram">Instagram</option><option value="ocean">Ocean</option><option value="midnight">Midnight</option><option value="forest">Forest</option></select></div>
                                <div className="space-y-2"><Label>Glass blur</Label><select value={data.glass_blur} onChange={(e) => update('glass_blur', e.target.value)} className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"><option value="none">None</option><option value="sm">Small</option><option value="md">Medium</option><option value="lg">Large</option><option value="xl">Extra large</option></select></div>
                                <div className="space-y-2"><Label>Glass opacity</Label><select value={data.glass_opacity} onChange={(e) => update('glass_opacity', e.target.value)} className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"><option value="25">25%</option><option value="50">50%</option><option value="75">75%</option><option value="90">90%</option></select></div>
                            </div>
                        </section>

                        <section className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6">
                            <div className="flex items-start gap-3"><Image className="mt-0.5 size-5 text-primary" /><div><h2 className="text-lg font-semibold">Media slots</h2><p className="text-sm text-muted-foreground">Logo, backdrop, and avatar are managed from the Media Library. Current files are shown here.</p></div></div>
                            <div className="mt-5 grid gap-4 sm:grid-cols-3">{(['logo_media', 'background_media', 'avatar_media'] as const).map((slot) => { const media = settings[slot]; return <div key={slot} className="overflow-hidden rounded-xl border bg-muted/30"><div className="flex h-28 items-center justify-center bg-background">{media?.url ? <img src={media.url} alt={media.alt_text || slot} className="h-full w-full object-contain p-3" /> : <Image className="size-8 text-muted-foreground" />}</div><p className="border-t px-3 py-2 text-xs font-medium capitalize">{slot.replace('_media', '').replace('background', 'backdrop')}</p></div>; })}</div>
                            <p className="mt-4 text-xs text-muted-foreground">Need to change an image? Open Media Library and use the Edit action or assign it to a slot.</p>
                        </section>

                        <div className="flex justify-end"><Button type="submit" size="lg" disabled={processing}><Save className="size-4" />{processing ? 'Saving...' : 'Save site settings'}</Button></div>
                    </form>
                </div>
            </AdminLayout>
        </>
    );
}
