import { Head, router, useForm, usePage } from '@inertiajs/react';
import { Award, Eye, FileText, FileUp, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import { type ChangeEvent, type FormEvent, useMemo, useState } from 'react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import type { Certificate, CertificateForm, Media, PageProps } from '@/types';

interface CertificatesPageProps extends PageProps {
    certificates: Certificate[];
    mediaItems: Media[];
}

const emptyForm: CertificateForm = {
    title: '', issuer: '', description: '', issued_at: '', credential_url: '',
    media_id: null, sort_order: 0, is_visible: true,
};

function CertificatePreview({ media, title }: { media?: Media | null; title: string }) {
    if (!media) return <span className="text-xs text-muted-foreground">No file</span>;

    const isImage = media.mime_type.startsWith('image/');

    return (
        <a href={media.url} target="_blank" rel="noreferrer" className="group flex items-center gap-2 text-primary hover:underline" title={`Preview ${title}`}>
            <span className="flex size-10 items-center justify-center overflow-hidden rounded-lg border bg-muted/40">
                {isImage ? <img src={media.url} alt={title} className="size-full object-contain p-1" /> : <FileText className="size-5 text-muted-foreground" />}
            </span>
            <span className="hidden items-center gap-1 text-xs sm:flex"><Eye className="size-3.5" />Preview</span>
        </a>
    );
}

export default function CertificatesPage() {
    const { certificates, mediaItems, sidebarItems, branding } = usePage<CertificatesPageProps>().props;
    const [editing, setEditing] = useState<Certificate | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isDeletingAll, setIsDeletingAll] = useState(false);
    const [page, setPage] = useState(1);
    const perPage = 5;
    const { data, setData, post, put, processing, reset, errors } = useForm<CertificateForm>(emptyForm);

    const filteredCertificates = useMemo(() => {
        const term = search.trim().toLowerCase();
        if (!term) return certificates;
        return certificates.filter((certificate) => [certificate.title, certificate.issuer, certificate.description || ''].some((value) => value.toLowerCase().includes(term)));
    }, [certificates, search]);

    const paginatedCertificates = useMemo(() => {
        const start = (page - 1) * perPage;
        return filteredCertificates.slice(start, start + perPage);
    }, [filteredCertificates, page]);

    const totalPages = Math.max(1, Math.ceil(filteredCertificates.length / perPage));

    const update = <K extends keyof CertificateForm>(key: K, value: CertificateForm[K]) => setData((current) => ({ ...current, [key]: value }));

    const openForm = (certificate?: Certificate) => {
        setEditing(certificate || null);
        setIsFormOpen(true);
        setData(certificate ? {
            title: certificate.title,
            issuer: certificate.issuer,
            description: certificate.description || '',
            issued_at: certificate.issued_at || '',
            credential_url: certificate.credential_url || '',
            media_id: certificate.media_id,
            sort_order: certificate.sort_order,
            is_visible: certificate.is_visible,
        } : emptyForm);
    };

    const closeForm = () => { setEditing(null); setIsFormOpen(false); reset(); };

    const submit = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const options = { preserveScroll: true, onSuccess: () => { closeForm(); toast.success(editing ? 'Certificate updated.' : 'Certificate added.'); } };
        if (editing) put(`/dashboard/certificates/${editing.id}`, options);
        else post('/dashboard/certificates', options);
    };

    const importCertificates = () => {
        if (!selectedFiles.length) { toast.error('Choose one or more certificate files first.'); return; }
        const formData = new FormData();
        selectedFiles.forEach((file) => formData.append('files[]', file));
        router.post('/dashboard/certificates/bulk-store', formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => { setSelectedFiles([]); toast.success('Certificates imported successfully.'); },
            onError: () => toast.error('Certificate import failed. Check the selected files.'),
        });
    };

    const visibleIds = paginatedCertificates.map((certificate) => certificate.id);
    const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));

    const toggleSelect = (id: number) => {
        setSelectedIds((current) => current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id]);
    };

    const toggleSelectAll = () => {
        setSelectedIds((current) => allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...current, ...visibleIds])));
    };

    const deleteSelected = () => {
        if (!selectedIds.length || !window.confirm(`Delete ${selectedIds.length} selected certificate${selectedIds.length === 1 ? '' : 's'}? This will remove certificate records but keep uploaded files in Media Library.`)) return;
        setIsDeletingAll(true);
        router.delete('/dashboard/certificates/bulk-destroy', {
            data: { ids: selectedIds },
            preserveScroll: true,
            onSuccess: () => { setSelectedIds([]); toast.success('Selected certificates deleted.'); },
            onFinish: () => setIsDeletingAll(false),
        });
    };

    const remove = (certificate: Certificate) => {
        if (!window.confirm(`Delete "${certificate.title}"?`)) return;
        router.delete(`/dashboard/certificates/${certificate.id}`, { preserveScroll: true, onSuccess: () => toast.success('Certificate deleted.') });
    };

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => setSelectedFiles(Array.from(event.target.files || []));

    return (
        <>
            <Head title="Certificates" />
            <AdminLayout sidebarItems={sidebarItems || []} backgroundUrl={branding?.backgroundImage?.url} branding={branding}>
                <div className="admin-page admin-certificates-page flex h-full flex-col gap-4 overflow-hidden">
                    <AdminPageHeader icon={<Award className="size-4" />} title="Certificates" description="Manage certificates displayed on your portfolio." actions={<><Button variant="destructive" size="sm" onClick={deleteSelected} disabled={!selectedIds.length || isDeletingAll}><Trash2 className="size-3.5" />{isDeletingAll ? 'Deleting...' : selectedIds.length ? `Delete (${selectedIds.length})` : 'Delete'}</Button><Button size="sm" onClick={() => openForm()}><Plus className="size-3.5" /> Add</Button></>} />

                    <section className="admin-import-panel rounded-lg border border-border/70 bg-card p-4"><div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"><div className="flex items-start gap-3"><span className="admin-import-icon"><FileUp className="size-4" aria-hidden="true" /></span><div><h2 className="text-sm font-semibold">Import certificates</h2><p className="mt-1 max-w-xl text-xs leading-5 text-muted-foreground">Select PDF or image files. The importer creates certificate entries from their filenames; review the details after import.</p></div></div><div className="flex flex-wrap items-center gap-2"><Input aria-label="Choose certificate files" type="file" multiple accept=".pdf,image/*" onChange={handleFileChange} className="max-w-xs" /><Button type="button" size="sm" onClick={importCertificates} disabled={!selectedFiles.length}><FileUp className="size-3.5" /> Import{selectedFiles.length ? ` ${selectedFiles.length}` : ''}</Button></div></div></section>

                    <section className="flex-1 flex flex-col overflow-hidden rounded-lg border border-border/40 bg-background/30 backdrop-blur-none"><div className="flex items-center justify-between gap-2 border-b border-border/40 p-3"><div className="relative w-full max-w-xs"><Search className="pointer-events-none absolute left-2.5 top-2 size-3.5 text-muted-foreground" /><Input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search..." className="h-8 pl-8" /></div><p className="text-xs text-muted-foreground">{filteredCertificates.length} total</p></div><div className="flex-1 overflow-auto"><Table><TableHeader><TableRow><TableHead className="w-10"><input type="checkbox" checked={allVisibleSelected} onChange={toggleSelectAll} aria-label="Select all" /></TableHead><TableHead>Preview</TableHead><TableHead>Certificate</TableHead><TableHead>Issuer</TableHead><TableHead>Issued</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader><TableBody>{paginatedCertificates.map((certificate) => <TableRow key={certificate.id}><TableCell><input type="checkbox" checked={selectedIds.includes(certificate.id)} onChange={() => toggleSelect(certificate.id)} aria-label={`Select ${certificate.title}`} /></TableCell><TableCell><CertificatePreview media={certificate.media} title={certificate.title} /></TableCell><TableCell><div className="min-w-0"><p className="text-sm font-medium">{certificate.title}</p>{certificate.description ? <p className="max-w-xs truncate text-xs text-muted-foreground">{certificate.description}</p> : null}</div></TableCell><TableCell className="text-sm">{certificate.issuer}</TableCell><TableCell className="text-sm text-muted-foreground">{certificate.issued_at || '—'}</TableCell><TableCell><Badge variant={certificate.is_visible ? 'default' : 'secondary'} className="text-xs">{certificate.is_visible ? 'Visible' : 'Hidden'}</Badge></TableCell><TableCell><div className="flex justify-end gap-1"><Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => openForm(certificate)} title="Edit"><Pencil className="size-3.5" /></Button><Button size="icon" variant="ghost" onClick={() => remove(certificate)} title="Delete" className="h-7 w-7 text-destructive hover:text-destructive"><Trash2 className="size-3.5" /></Button></div></TableCell></TableRow>)}</TableBody></Table></div><div className="flex items-center justify-between border-t border-border/40 p-2"><p className="text-xs text-muted-foreground">Page {page} of {totalPages}</p><div className="flex gap-1"><Button size="sm" variant="ghost" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Button><Button size="sm" variant="ghost" disabled={page === totalPages} onClick={() => setPage(page + 1)}>Next</Button></div></div>                    </section>
                </div>
            </AdminLayout>
            <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) closeForm(); }}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editing ? 'Edit certificate' : 'New certificate'}</DialogTitle>
                        <DialogDescription>Update the metadata shown on the public portfolio.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submit} className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2"><Label>Title</Label><Input value={data.title} onChange={(e) => update('title', e.target.value)} />{errors.title && <p className="text-xs text-destructive">{errors.title}</p>}</div>
                            <div className="space-y-2"><Label>Issuer</Label><Input value={data.issuer} onChange={(e) => update('issuer', e.target.value)} />{errors.issuer && <p className="text-xs text-destructive">{errors.issuer}</p>}</div>
                            <div className="space-y-2"><Label>Issued date</Label><Input type="date" value={data.issued_at} onChange={(e) => update('issued_at', e.target.value)} /></div>
                            <div className="space-y-2"><Label>Credential URL</Label><Input type="url" value={data.credential_url} onChange={(e) => update('credential_url', e.target.value)} placeholder="https://..." /></div>
                            <div className="space-y-2"><Label>Certificate file</Label><select value={data.media_id ?? ''} onChange={(e) => update('media_id', e.target.value ? Number(e.target.value) : null)} className="h-9 w-full rounded-md border px-2 text-sm"><option value="">No file attached</option>{mediaItems.map((media) => <option key={media.id} value={media.id}>{media.title || media.original_name}</option>)}</select></div>
                            <div className="space-y-2"><Label>Display order</Label><Input type="number" min="0" value={data.sort_order} onChange={(e) => update('sort_order', Number(e.target.value))} /></div>
                            <div className="space-y-2 md:col-span-2"><Label>Description</Label><textarea value={data.description} onChange={(e) => update('description', e.target.value)} className="min-h-24 w-full rounded-md border px-3 py-2 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring" /></div>
                        </div>
                        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={data.is_visible} onChange={(e) => update('is_visible', e.target.checked)} /> Show on public portfolio</label>
                        <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={closeForm}>Cancel</Button><Button type="submit" disabled={processing}>{processing ? 'Saving...' : editing ? 'Save' : 'Add'}</Button></div>
                    </form>
                </DialogContent>
            </Dialog>
        </>
    );
}
