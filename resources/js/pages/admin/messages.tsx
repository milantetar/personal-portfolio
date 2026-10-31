import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import {
    CheckCheck,
    ExternalLink,
    Mail,
    MailOpen,
    RefreshCw,
    Search,
    Trash2,
} from 'lucide-react';
import { toast } from 'sonner';

import { AdminLayout } from '@/components/admin/admin-layout';
import { AdminPageHeader } from '@/components/admin/admin-page-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type {
    ContactMessage,
    PageProps,
    PaginatedContactMessages,
} from '@/types';

interface MessagesPageProps extends PageProps {
    messages: PaginatedContactMessages;
    unreadCount: number;
    filters: {
        status: string;
        search: string;
    };
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

export default function MessagesPage() {
    const { messages, unreadCount, filters, sidebarItems, branding } =
        usePage<MessagesPageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(
        null,
    );
    const [selectedIds, setSelectedIds] = useState<number[]>([]);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);
    const [isBulkMarking, setIsBulkMarking] = useState(false);

    const visibleIds = messages.data.map((m) => m.id);
    const allVisibleSelected =
        visibleIds.length > 0 &&
        visibleIds.every((id) => selectedIds.includes(id));

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/dashboard/messages',
            { search, status: filters.status },
            { preserveState: true, replace: true },
        );
    };

    const handleFilterStatus = (status: string) => {
        router.get(
            '/dashboard/messages',
            { search: filters.search, status },
            { preserveState: true, replace: true },
        );
    };

    const toggleSelect = (id: number) => {
        setSelectedIds((curr) =>
            curr.includes(id)
                ? curr.filter((item) => item !== id)
                : [...curr, id],
        );
    };

    const toggleSelectAll = () => {
        setSelectedIds((curr) =>
            allVisibleSelected
                ? curr.filter((id) => !visibleIds.includes(id))
                : Array.from(new Set([...curr, ...visibleIds])),
        );
    };

    const toggleReadStatus = (message: ContactMessage) => {
        router.put(
            `/dashboard/messages/${message.id}`,
            { is_read: !message.is_read },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        message.is_read
                            ? 'Marked as unread.'
                            : 'Marked as read.',
                    );
                    if (activeMessage && activeMessage.id === message.id) {
                        setActiveMessage({
                            ...activeMessage,
                            is_read: !message.is_read,
                        });
                    }
                },
            },
        );
    };

    const deleteMessage = (message: ContactMessage) => {
        if (!window.confirm(`Delete message from ${message.name}?`)) return;
        router.delete(`/dashboard/messages/${message.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Message deleted.');
                if (activeMessage?.id === message.id) setActiveMessage(null);
            },
        });
    };

    const handleBulkDelete = () => {
        if (
            !selectedIds.length ||
            !window.confirm(`Delete ${selectedIds.length} selected message(s)?`)
        )
            return;
        setIsBulkDeleting(true);
        router.post(
            '/dashboard/messages/bulk-destroy',
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    toast.success('Messages deleted.');
                },
                onFinish: () => setIsBulkDeleting(false),
            },
        );
    };

    const handleBulkMarkRead = () => {
        if (!selectedIds.length) return;
        setIsBulkMarking(true);
        router.post(
            '/dashboard/messages/bulk-mark-read',
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    setSelectedIds([]);
                    toast.success('Messages marked as read.');
                },
                onFinish: () => setIsBulkMarking(false),
            },
        );
    };

    return (
        <>
            <Head title="Contact Inquiries" />
            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={branding?.backgroundImage?.url}
                branding={branding}
            >
                <div className="admin-page flex h-full flex-col gap-4 overflow-hidden">
                    <AdminPageHeader
                        icon={<Mail className="size-4" />}
                        title="Contact Inquiries"
                        description="Review client outreach, recruiter inquiries, and inbound messages."
                        actions={
                            <div className="flex flex-wrap items-center gap-2">
                                {selectedIds.length > 0 && (
                                    <>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={handleBulkMarkRead}
                                            disabled={isBulkMarking}
                                        >
                                            <CheckCheck className="size-3.5" />
                                            {isBulkMarking
                                                ? 'Updating...'
                                                : `Mark Read (${selectedIds.length})`}
                                        </Button>
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={handleBulkDelete}
                                            disabled={isBulkDeleting}
                                        >
                                            <Trash2 className="size-3.5" />
                                            {isBulkDeleting
                                                ? 'Deleting...'
                                                : `Delete (${selectedIds.length})`}
                                        </Button>
                                    </>
                                )}
                            </div>
                        }
                    />

                    {/* Filter Bar */}
                    <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex flex-wrap items-center gap-1.5">
                            <Button
                                variant={
                                    filters.status === 'all' || !filters.status
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                onClick={() => handleFilterStatus('all')}
                            >
                                All ({messages.total})
                            </Button>
                            <Button
                                variant={
                                    filters.status === 'unread'
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                onClick={() => handleFilterStatus('unread')}
                                className="relative"
                            >
                                Unread
                                {unreadCount > 0 && (
                                    <span className="py-0.2 ml-1.5 rounded-full bg-primary/20 px-1.5 font-mono text-[10px] text-primary">
                                        {unreadCount}
                                    </span>
                                )}
                            </Button>
                            <Button
                                variant={
                                    filters.status === 'read'
                                        ? 'default'
                                        : 'ghost'
                                }
                                size="sm"
                                onClick={() => handleFilterStatus('read')}
                            >
                                Read
                            </Button>
                        </div>

                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full max-w-xs"
                        >
                            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search sender, email, subject..."
                                className="h-8 pl-8 text-xs"
                            />
                        </form>
                    </div>

                    {/* Table View */}
                    <section className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border/40 bg-background/30">
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-10">
                                            <input
                                                type="checkbox"
                                                checked={allVisibleSelected}
                                                onChange={toggleSelectAll}
                                                aria-label="Select all messages"
                                            />
                                        </TableHead>
                                        <TableHead className="w-16">
                                            Status
                                        </TableHead>
                                        <TableHead>Sender</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead className="w-40">
                                            Received
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {messages.data.length ? (
                                        messages.data.map((msg) => (
                                            <TableRow
                                                key={msg.id}
                                                className={`cursor-pointer transition-colors ${!msg.is_read ? 'bg-primary/5 font-medium' : ''}`}
                                                onClick={() =>
                                                    setActiveMessage(msg)
                                                }
                                            >
                                                <TableCell
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={selectedIds.includes(
                                                            msg.id,
                                                        )}
                                                        onChange={() =>
                                                            toggleSelect(msg.id)
                                                        }
                                                        aria-label={`Select message from ${msg.name}`}
                                                    />
                                                </TableCell>
                                                <TableCell>
                                                    {msg.is_read ? (
                                                        <Badge
                                                            variant="secondary"
                                                            className="text-[10px]"
                                                        >
                                                            Read
                                                        </Badge>
                                                    ) : (
                                                        <Badge
                                                            variant="default"
                                                            className="text-[10px]"
                                                        >
                                                            New
                                                        </Badge>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold text-foreground">
                                                            {msg.name}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {msg.email}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="max-w-md min-w-0">
                                                        <p className="truncate text-sm text-foreground">
                                                            {msg.subject}
                                                        </p>
                                                        <p className="truncate text-xs text-muted-foreground">
                                                            {msg.message}
                                                        </p>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                    {formatDate(msg.created_at)}
                                                </TableCell>
                                                <TableCell
                                                    className="text-right"
                                                    onClick={(e) =>
                                                        e.stopPropagation()
                                                    }
                                                >
                                                    <div className="flex items-center justify-end gap-1">
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-7"
                                                            title={
                                                                msg.is_read
                                                                    ? 'Mark unread'
                                                                    : 'Mark read'
                                                            }
                                                            onClick={() =>
                                                                toggleReadStatus(
                                                                    msg,
                                                                )
                                                            }
                                                        >
                                                            {msg.is_read ? (
                                                                <Mail className="size-3.5" />
                                                            ) : (
                                                                <MailOpen className="size-3.5" />
                                                            )}
                                                        </Button>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="size-7 text-destructive hover:text-destructive"
                                                            title="Delete"
                                                            onClick={() =>
                                                                deleteMessage(
                                                                    msg,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="size-3.5" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell
                                                colSpan={6}
                                                className="py-12 text-center text-sm text-muted-foreground"
                                            >
                                                No contact messages found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {messages.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border/40 p-2 text-xs text-muted-foreground">
                                <span>
                                    Page {messages.current_page} of{' '}
                                    {messages.last_page} ({messages.total}{' '}
                                    messages)
                                </span>
                                <div className="flex items-center gap-1">
                                    {messages.links.map((link, idx) => (
                                        <Button
                                            key={idx}
                                            variant={
                                                link.active
                                                    ? 'default'
                                                    : 'ghost'
                                            }
                                            size="sm"
                                            disabled={!link.url}
                                            onClick={() =>
                                                link.url &&
                                                router.get(
                                                    link.url,
                                                    {},
                                                    { preserveState: true },
                                                )
                                            }
                                            className="h-7 px-2.5 text-xs"
                                            dangerouslySetInnerHTML={{
                                                __html: link.label,
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>
                </div>
            </AdminLayout>

            {/* Message Detail Dialog */}
            <Dialog
                open={!!activeMessage}
                onOpenChange={(open) => !open && setActiveMessage(null)}
            >
                <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                    {activeMessage && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <DialogTitle className="text-xl font-semibold">
                                        {activeMessage.subject}
                                    </DialogTitle>
                                    <Badge
                                        variant={
                                            activeMessage.is_read
                                                ? 'secondary'
                                                : 'default'
                                        }
                                    >
                                        {activeMessage.is_read
                                            ? 'Read'
                                            : 'Unread'}
                                    </Badge>
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Received on{' '}
                                    {formatDate(activeMessage.created_at)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 pt-2">
                                <div className="space-y-1 rounded-md border border-border/60 bg-muted/20 p-3 text-xs">
                                    <p>
                                        <strong>From:</strong>{' '}
                                        {activeMessage.name} &lt;
                                        {activeMessage.email}&gt;
                                    </p>
                                    {activeMessage.ip_address && (
                                        <p className="text-muted-foreground">
                                            <strong>IP:</strong>{' '}
                                            {activeMessage.ip_address}
                                        </p>
                                    )}
                                    {activeMessage.user_agent && (
                                        <p className="truncate text-muted-foreground">
                                            <strong>Client:</strong>{' '}
                                            {activeMessage.user_agent}
                                        </p>
                                    )}
                                </div>

                                <div className="min-h-36 rounded-md border border-border/50 bg-card p-4 text-sm leading-relaxed whitespace-pre-wrap">
                                    {activeMessage.message}
                                </div>

                                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() =>
                                            toggleReadStatus(activeMessage)
                                        }
                                    >
                                        <RefreshCw className="size-3.5" />
                                        {activeMessage.is_read
                                            ? 'Mark as Unread'
                                            : 'Mark as Read'}
                                    </Button>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="destructive"
                                            size="sm"
                                            onClick={() =>
                                                deleteMessage(activeMessage)
                                            }
                                        >
                                            <Trash2 className="size-3.5" />
                                            Delete
                                        </Button>
                                        <Button size="sm" asChild>
                                            <a
                                                href={`mailto:${activeMessage.email}?subject=Re: ${encodeURIComponent(activeMessage.subject)}`}
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Reply via Email
                                                <ExternalLink className="ml-1 size-3.5" />
                                            </a>
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
}
