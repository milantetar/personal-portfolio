import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { Image, LayoutTemplate, Save, Settings2 } from 'lucide-react';
import { type FormEvent, useEffect } from 'react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type {
    Media,
    PageProps,
    SiteSettings,
    SiteSettingsForm,
    SidebarItem,
} from '@/types';

interface SiteSettingsPageProps extends PageProps {
    settings: SiteSettings;
    mediaItems: Media[];
    settingsSidebarItem: SidebarItem;
}

function FieldError({ message }: { message?: string }) {
    return message ? (
        <p className="text-xs text-destructive">{message}</p>
    ) : null;
}

const sectionLinks = [
    ['identity', 'Identity'],
    ['media-icon', 'Settings icon'],
    ['contact', 'Contact and social'],
    ['appearance', 'Appearance'],
    ['media-slots', 'Media slots'],
    ['security', 'Security'],
] as const;

export default function SiteSettingsPage() {
    const {
        settings,
        mediaItems,
        settingsSidebarItem,
        sidebarItems,
        branding,
    } = usePage<SiteSettingsPageProps>().props;
    const { data, setData, put, processing, errors } =
        useForm<SiteSettingsForm>({
            site_name: settings.site_name || "Milan's Portfolio",
            email: settings.email || '',
            github_url: settings.github_url || '',
            linkedin_url: settings.linkedin_url || '',
            is_available: settings.is_available,
            theme_preset: settings.theme_preset || 'midnight',
            glass_blur: settings.glass_blur || 'xl',
            glass_opacity: settings.glass_opacity || '75',
            settings_icon_media_id: settingsSidebarItem.icon_media_id,
            resume_media_id: settings.resume_media?.id || null,
        });
    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    useEffect(() => {
        if (Object.keys(errors).length > 0)
            toast.error('Please correct the highlighted fields.');
    }, [errors]);

    const update = <K extends keyof SiteSettingsForm>(
        key: K,
        value: SiteSettingsForm[K],
    ) => setData((current) => ({ ...current, [key]: value }));

    const submit = (event: FormEvent) => {
        event.preventDefault();
        put('/dashboard/settings', {
            preserveScroll: true,
            onSuccess: () => toast.success('Site settings saved.'),
        });
    };

    const changePassword = (event: FormEvent) => {
        event.preventDefault();
        passwordForm.put('/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                toast.success('Password updated.');
            },
            onError: () =>
                toast.error('Please correct the highlighted password fields.'),
        });
    };

    return (
        <>
            <Head title="Site Settings" />
            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={
                    branding?.backgroundImage?.url ||
                    settings.background_media?.url
                }
                branding={branding}
            >
                <div className="admin-page admin-site-settings-page mx-auto w-full max-w-7xl space-y-6">
                    <header className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                        <div className="flex items-start gap-3">
                            <div className="rounded-lg bg-primary/15 p-2 text-primary">
                                <Settings2 className="size-5" />
                            </div>
                            <div>
                                <h1 className="font-display text-2xl font-semibold tracking-tight">
                                    Site Settings
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    Manage global identity, appearance, contact
                                    details, and media assignments.
                                </p>
                            </div>
                        </div>
                        <Link
                            href="/dashboard/sections"
                            className="inline-flex items-center gap-2 self-start rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-sm font-medium text-primary transition hover:bg-primary/20"
                        >
                            <LayoutTemplate className="size-4" />
                            Edit homepage sections
                        </Link>
                    </header>

                    <div className="admin-settings-layout">
                        <nav
                            aria-label="Site settings sections"
                            className="admin-settings-nav"
                        >
                            <p className="eyebrow px-3 pb-2">Settings</p>
                            {sectionLinks.map(([id, label], index) => (
                                <a
                                    key={id}
                                    href={'#' + id}
                                    className="admin-settings-nav-link"
                                >
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    {label}
                                </a>
                            ))}
                            <p className="mt-4 border-t border-border px-3 pt-4 text-xs leading-5 text-muted-foreground">
                                Use these controls for site-wide settings. Edit
                                the content and order of homepage sections
                                separately.
                            </p>
                        </nav>

                        <div className="min-w-0">
                            <form
                                onSubmit={submit}
                                className="admin-settings-form space-y-5"
                            >
                                <section
                                    id="identity"
                                    className="admin-settings-section scroll-mt-24 rounded-lg border border-border bg-card p-5 md:p-6"
                                >
                                    <h2 className="text-lg font-semibold">
                                        Identity
                                    </h2>
                                    <p className="mb-5 text-sm text-muted-foreground">
                                        This appears in the browser, navbar, and
                                        portfolio branding.
                                    </p>
                                    <div className="space-y-2">
                                        <Label htmlFor="site_name">
                                            Site name
                                        </Label>
                                        <Input
                                            id="site_name"
                                            value={data.site_name}
                                            onChange={(event) =>
                                                update(
                                                    'site_name',
                                                    event.target.value,
                                                )
                                            }
                                        />
                                        <FieldError
                                            message={errors.site_name}
                                        />
                                    </div>
                                </section>

                                <section
                                    id="media-icon"
                                    className="admin-settings-section scroll-mt-24 rounded-lg border border-border bg-card p-5 md:p-6"
                                >
                                    <h2 className="text-lg font-semibold">
                                        Settings menu icon
                                    </h2>
                                    <p className="mb-5 text-sm text-muted-foreground">
                                        Choose the icon displayed beside Site
                                        Settings in the admin sidebar.
                                    </p>
                                    <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 md:grid-cols-8">
                                        <button
                                            type="button"
                                            onClick={() =>
                                                update(
                                                    'settings_icon_media_id',
                                                    null,
                                                )
                                            }
                                            className={
                                                'flex aspect-square items-center justify-center rounded-lg border text-xs transition ' +
                                                (data.settings_icon_media_id ===
                                                null
                                                    ? 'border-primary ring-2 ring-primary/30'
                                                    : 'border-border hover:border-primary/50')
                                            }
                                        >
                                            None
                                        </button>
                                        {mediaItems
                                            .filter((media) =>
                                                media.mime_type.startsWith(
                                                    'image/',
                                                ),
                                            )
                                            .map((media) => (
                                                <button
                                                    key={media.id}
                                                    type="button"
                                                    onClick={() =>
                                                        update(
                                                            'settings_icon_media_id',
                                                            media.id,
                                                        )
                                                    }
                                                    className={
                                                        'overflow-hidden rounded-lg border bg-background p-2 transition ' +
                                                        (data.settings_icon_media_id ===
                                                        media.id
                                                            ? 'border-primary ring-2 ring-primary/30'
                                                            : 'border-border hover:border-primary/50')
                                                    }
                                                    title={
                                                        media.title ||
                                                        media.original_name
                                                    }
                                                >
                                                    <img
                                                        src={media.url}
                                                        alt={
                                                            media.alt_text ||
                                                            media.original_name
                                                        }
                                                        className="aspect-square size-full object-contain"
                                                    />
                                                </button>
                                            ))}
                                    </div>
                                    <FieldError
                                        message={errors.settings_icon_media_id}
                                    />
                                </section>

                                <section
                                    id="contact"
                                    className="admin-settings-section scroll-mt-24 rounded-lg border border-border bg-card p-5 md:p-6"
                                >
                                    <h2 className="text-lg font-semibold">
                                        Contact and social
                                    </h2>
                                    <p className="mb-5 text-sm text-muted-foreground">
                                        These details are used by the public
                                        contact section. Empty fields remain
                                        hidden.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Email</Label>
                                            <Input
                                                type="email"
                                                value={data.email}
                                                onChange={(event) =>
                                                    update(
                                                        'email',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <FieldError
                                                message={errors.email}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>GitHub URL</Label>
                                            <Input
                                                type="url"
                                                value={data.github_url}
                                                onChange={(event) =>
                                                    update(
                                                        'github_url',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="https://github.com/..."
                                            />
                                            <FieldError
                                                message={errors.github_url}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>LinkedIn URL</Label>
                                            <Input
                                                type="url"
                                                value={data.linkedin_url}
                                                onChange={(event) =>
                                                    update(
                                                        'linkedin_url',
                                                        event.target.value,
                                                    )
                                                }
                                                placeholder="https://linkedin.com/in/..."
                                            />
                                            <FieldError
                                                message={errors.linkedin_url}
                                            />
                                        </div>
                                    </div>
                                    <label className="mt-5 flex cursor-pointer items-center gap-3 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={data.is_available}
                                            onChange={(event) =>
                                                update(
                                                    'is_available',
                                                    event.target.checked,
                                                )
                                            }
                                            className="size-4 accent-primary"
                                        />{' '}
                                        Available for new opportunities
                                    </label>
                                </section>

                                <section
                                    id="appearance"
                                    className="admin-settings-section scroll-mt-24 rounded-lg border border-border bg-card p-5 md:p-6"
                                >
                                    <h2 className="text-lg font-semibold">
                                        Appearance
                                    </h2>
                                    <p className="mb-5 text-sm text-muted-foreground">
                                        Control the visual language used by the
                                        dashboard shell.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label>Theme preset</Label>
                                            <select
                                                value={data.theme_preset}
                                                onChange={(event) =>
                                                    update(
                                                        'theme_preset',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                                            >
                                                <option value="instagram">
                                                    Instagram
                                                </option>
                                                <option value="ocean">
                                                    Ocean
                                                </option>
                                                <option value="midnight">
                                                    Midnight
                                                </option>
                                                <option value="forest">
                                                    Forest
                                                </option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Glass blur</Label>
                                            <select
                                                value={data.glass_blur}
                                                onChange={(event) =>
                                                    update(
                                                        'glass_blur',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                                            >
                                                <option value="none">
                                                    None
                                                </option>
                                                <option value="sm">
                                                    Small
                                                </option>
                                                <option value="md">
                                                    Medium
                                                </option>
                                                <option value="lg">
                                                    Large
                                                </option>
                                                <option value="xl">
                                                    Extra large
                                                </option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Glass opacity</Label>
                                            <select
                                                value={data.glass_opacity}
                                                onChange={(event) =>
                                                    update(
                                                        'glass_opacity',
                                                        event.target.value,
                                                    )
                                                }
                                                className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"
                                            >
                                                <option value="25">25%</option>
                                                <option value="50">50%</option>
                                                <option value="75">75%</option>
                                                <option value="90">90%</option>
                                            </select>
                                        </div>
                                    </div>
                                </section>

                                <section
                                    id="media-slots"
                                    className="admin-settings-section scroll-mt-24 rounded-lg border border-border bg-card p-5 md:p-6"
                                >
                                    <div className="flex items-start gap-3">
                                        <Image className="mt-0.5 size-5 text-primary" />
                                        <div>
                                            <h2 className="text-lg font-semibold">
                                                Media slots
                                            </h2>
                                            <p className="text-sm text-muted-foreground">
                                                Logo, backdrop, avatar, favicon,
                                                and resume are assigned from
                                                Media Library.
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                                        {(
                                            [
                                                'logo_media',
                                                'background_media',
                                                'avatar_media',
                                                'favicon_media',
                                                'resume_media',
                                            ] as const
                                        ).map((slot) => {
                                            const media = settings[slot];
                                            return (
                                                <div
                                                    key={slot}
                                                    className="overflow-hidden rounded-lg border bg-muted/30"
                                                >
                                                    <div className="flex h-28 items-center justify-center bg-background">
                                                        {media?.url ? (
                                                            <img
                                                                src={media.url}
                                                                alt={
                                                                    media.alt_text ||
                                                                    slot
                                                                }
                                                                className="h-full w-full object-contain p-3"
                                                            />
                                                        ) : (
                                                            <Image className="size-8 text-muted-foreground" />
                                                        )}
                                                    </div>
                                                    <p className="border-t px-3 py-2 text-xs font-medium capitalize">
                                                        {slot
                                                            .replace(
                                                                '_media',
                                                                '',
                                                            )
                                                            .replace(
                                                                'background',
                                                                'backdrop',
                                                            )
                                                            .replace(
                                                                'resume',
                                                                'CV',
                                                            )}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <p className="mt-4 text-xs text-muted-foreground">
                                        Use Media Library to assign or replace
                                        these files. The favicon appears in the
                                        browser tab; the active resume is
                                        downloadable from the homepage.
                                    </p>
                                </section>

                                <div className="admin-settings-save flex justify-end">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={processing}
                                    >
                                        <Save className="size-4" />
                                        {processing
                                            ? 'Saving...'
                                            : 'Save site settings'}
                                    </Button>
                                </div>
                            </form>

                            <form
                                onSubmit={changePassword}
                                className="admin-settings-form mt-5 space-y-5"
                            >
                                <section
                                    id="security"
                                    className="admin-settings-section scroll-mt-24 rounded-lg border border-border bg-card p-5 md:p-6"
                                >
                                    <h2 className="text-lg font-semibold">
                                        Security
                                    </h2>
                                    <p className="mb-5 text-sm text-muted-foreground">
                                        Change the password used to sign in to
                                        this dashboard.
                                    </p>
                                    <div className="grid gap-4 md:grid-cols-3">
                                        <div className="space-y-2">
                                            <Label htmlFor="current_password">
                                                Current password
                                            </Label>
                                            <Input
                                                id="current_password"
                                                type="password"
                                                autoComplete="current-password"
                                                value={
                                                    passwordForm.data
                                                        .current_password
                                                }
                                                onChange={(event) =>
                                                    passwordForm.setData(
                                                        'current_password',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <FieldError
                                                message={
                                                    passwordForm.errors
                                                        .current_password
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="new_password">
                                                New password
                                            </Label>
                                            <Input
                                                id="new_password"
                                                type="password"
                                                autoComplete="new-password"
                                                value={
                                                    passwordForm.data.password
                                                }
                                                onChange={(event) =>
                                                    passwordForm.setData(
                                                        'password',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                            <FieldError
                                                message={
                                                    passwordForm.errors.password
                                                }
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="password_confirmation">
                                                Confirm new password
                                            </Label>
                                            <Input
                                                id="password_confirmation"
                                                type="password"
                                                autoComplete="new-password"
                                                value={
                                                    passwordForm.data
                                                        .password_confirmation
                                                }
                                                onChange={(event) =>
                                                    passwordForm.setData(
                                                        'password_confirmation',
                                                        event.target.value,
                                                    )
                                                }
                                            />
                                        </div>
                                    </div>
                                </section>

                                <div className="admin-settings-save flex justify-end">
                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={passwordForm.processing}
                                    >
                                        <Save className="size-4" />
                                        {passwordForm.processing
                                            ? 'Updating...'
                                            : 'Update password'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </AdminLayout>
        </>
    );
}
