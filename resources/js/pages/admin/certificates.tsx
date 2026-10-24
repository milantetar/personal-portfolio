import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Award, Pencil, Plus, Trash2 } from 'lucide-react';
import { type FormEvent, useState } from 'react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/admin-layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { Certificate, CertificateForm, Media, PageProps } from '@/types';

interface CertificatesPageProps extends PageProps {
    certificates: Certificate[];
    mediaItems: Media[];
}

const emptyForm: CertificateForm = {
    title: '', issuer: '', description: '', issued_at: '', credential_url: '',
    media_id: null, sort_order: 0, is_visible: true,
};

export default function CertificatesPage() {
    const { certificates, mediaItems, sidebarItems, branding } = usePage<CertificatesPageProps>().props;
    const [editing, setEditing] = useState<Certificate | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const { data, setData, post, put, processing, reset, errors } = useForm<CertificateForm>(emptyForm);

    const update = <K extends keyof CertificateForm>(key: K, value: CertificateForm[K]) => setData((current) => ({ ...current, [key]: value }));
    const openForm = (certificate?: Certificate) => {
        setEditing(certificate || null);
        setIsFormOpen(true);
        setData(certificate ? { title: certificate.title, issuer: certificate.issuer, description: certificate.description || '', issued_at: certificate.issued_at || '', credential_url: certificate.credential_url || '', media_id: certificate.media_id, sort_order: certificate.sort_order, is_visible: certificate.is_visible } : emptyForm);
    };
    const closeForm = () => { setEditing(null); setIsFormOpen(false); reset(); };
    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => { const message = editing ? 'Certificate updated.' : 'Certificate added.'; closeForm(); toast.success(message); } };
        if (editing) put(`/dashboard/certificates/${editing.id}`, options); else post('/dashboard/certificates', options);
    };
    const remove = (certificate: Certificate) => {
        if (!window.confirm(`Delete "${certificate.title}"?`)) return;
        router.delete(`/dashboard/certificates/${certificate.id}`, { preserveScroll: true, onSuccess: () => toast.success('Certificate deleted.') });
    };

    return (
        <>
            <Head title="Certificates" />
            <AdminLayout sidebarItems={sidebarItems || []} backgroundUrl={branding?.backgroundImage?.url}>
                <div className="space-y-6">
                    <div className="flex flex-wrap items-center justify-between gap-4"><div className="flex items-center gap-3"><div className="rounded-xl bg-primary/15 p-2 text-primary"><Award className="size-5" /></div><div><h1 className="text-2xl font-semibold">Certificates & achievements</h1><p className="text-sm text-muted-foreground">Manage the proof of work displayed on your portfolio.</p></div></div><Button onClick={() => openForm()}><Plus className="size-4" /> Add certificate</Button></div>
                    {isFormOpen ? <form onSubmit={submit} className="space-y-5 rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl md:p-6"><div className="flex items-center justify-between"><div><h2 className="text-lg font-semibold">{editing ? 'Edit certificate' : 'New certificate'}</h2><p className="text-sm text-muted-foreground">Attach a PDF or image from Media Library.</p></div><Button type="button" variant="ghost" onClick={closeForm}>Close</Button></div><div className="grid gap-4 md:grid-cols-2"><div className="space-y-2"><Label>Title</Label><Input value={data.title} onChange={(e) => update('title', e.target.value)} />{errors.title && <p className="text-xs text-destructive">{errors.title}</p>}</div><div className="space-y-2"><Label>Issuer</Label><Input value={data.issuer} onChange={(e) => update('issuer', e.target.value)} />{errors.issuer && <p className="text-xs text-destructive">{errors.issuer}</p>}</div><div className="space-y-2"><Label>Issued date</Label><Input type="date" value={data.issued_at} onChange={(e) => update('issued_at', e.target.value)} /></div><div className="space-y-2"><Label>Credential URL</Label><Input type="url" value={data.credential_url} onChange={(e) => update('credential_url', e.target.value)} placeholder="https://..." /></div><div className="space-y-2"><Label>Certificate file</Label><select value={data.media_id ?? ''} onChange={(e) => update('media_id', e.target.value ? Number(e.target.value) : null)} className="h-8 w-full rounded-lg border border-input bg-background px-2 text-sm"><option value="">No file attached</option>{mediaItems.map((media) => <option key={media.id} value={media.id}>{media.title || media.original_name}</option>)}</select></div><div className="space-y-2"><Label>Display order</Label><Input type="number" min="0" value={data.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} /></div><div className="space-y-2 md:col-span-2"><Label>Description</Label><textarea value={data.description} onChange={(e) => update('description', e.target.value)} className="min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50" /></div></div><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.is_visible} onChange={(e) => update('is_visible', e.target.checked)} className="accent-primary" /> Show on public portfolio</label><div className="flex justify-end"><Button type="submit" disabled={processing}>{processing ? 'Saving...' : editing ? 'Save changes' : 'Add certificate'}</Button></div></form> : null}
                    {certificates.length > 0 ? <div className="grid gap-4 md:grid-cols-2">{certificates.map((certificate) => <article key={certificate.id} className="rounded-2xl border bg-card/70 p-5 shadow-sm backdrop-blur-xl"><div className="flex gap-4"><div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-xl border bg-muted/40">{certificate.media?.url ? <img src={certificate.media.url} alt={certificate.title} className="size-full object-contain p-2" /> : <Award className="size-7 text-muted-foreground" />}</div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{certificate.title}</h2><p className="text-sm text-muted-foreground">{certificate.issuer}{certificate.issued_at ? ` · ${certificate.issued_at}` : ''}</p></div><div className="flex gap-1"><Button size="icon-sm" variant="ghost" onClick={() => openForm(certificate)} title="Edit"><Pencil className="size-4" /></Button><Button size="icon-sm" variant="ghost" onClick={() => remove(certificate)} title="Delete" className="text-destructive"><Trash2 className="size-4" /></Button></div></div>{certificate.description ? <p className="mt-3 line-clamp-3 text-sm text-muted-foreground">{certificate.description}</p> : null}{certificate.credential_url ? <a href={certificate.credential_url} target="_blank" rel="noreferrer" className="mt-3 inline-block text-sm text-primary hover:underline">View credential</a> : null}</div></div></article>)}</div> : <div className="rounded-2xl border border-dashed p-12 text-center text-sm text-muted-foreground">No certificates yet. Add your first certificate above.</div>}
                </div>
            </AdminLayout>
        </>
    );
}
