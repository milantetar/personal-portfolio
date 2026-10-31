import { useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { Bot, MessageSquare, Search, Trash2, Users } from 'lucide-react';
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
    AssistantStats,
    PageProps,
    PaginatedAssistantLogs,
    PortfolioAssistantLog,
} from '@/types';

interface AssistantLogsPageProps extends PageProps {
    logs: PaginatedAssistantLogs;
    stats: AssistantStats;
    filters: {
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

export default function AssistantLogsPage() {
    const { logs, stats, filters, sidebarItems, branding } =
        usePage<AssistantLogsPageProps>().props;
    const [search, setSearch] = useState(filters.search || '');
    const [activeLog, setActiveLog] = useState<PortfolioAssistantLog | null>(
        null,
    );
    const [isClearing, setIsClearing] = useState(false);
    const [isClearDialogOpen, setIsClearDialogOpen] = useState(false);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        router.get(
            '/dashboard/assistant-logs',
            { search },
            { preserveState: true, replace: true },
        );
    };

    const deleteLog = (log: PortfolioAssistantLog) => {
        if (!window.confirm('Delete this conversation log?')) return;
        router.delete(`/dashboard/assistant-logs/${log.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Log deleted.');
                if (activeLog?.id === log.id) setActiveLog(null);
            },
        });
    };

    const handleClearAll = () => {
        setIsClearing(true);
        router.post(
            '/dashboard/assistant-logs/clear-all',
            {},
            {
                preserveScroll: true,
                onSuccess: () => {
                    setActiveLog(null);
                    setIsClearDialogOpen(false);
                    toast.success('All assistant logs cleared.');
                },
                onFinish: () => setIsClearing(false),
            },
        );
    };

    return (
        <>
            <Head title="AI Assistant Logs" />
            <AdminLayout
                sidebarItems={sidebarItems || []}
                backgroundUrl={branding?.backgroundImage?.url}
                branding={branding}
            >
                <div className="admin-page flex h-full flex-col gap-4 overflow-hidden">
                    <AdminPageHeader
                        icon={<Bot className="size-4" />}
                        title="AI Assistant Logs"
                        description="Audit visitor prompts, recruiter queries, and automated AI portfolio responses."
                        actions={
                            logs.total > 0 && (
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setIsClearDialogOpen(true)}
                                    disabled={isClearing}
                                    className="text-destructive hover:text-destructive"
                                >
                                    <Trash2 className="size-3.5" />
                                    {isClearing
                                        ? 'Clearing...'
                                        : 'Clear All Logs'}
                                </Button>
                            )
                        }
                    />

                    {/* KPI Metrics Strip */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                        <div className="rounded-lg border border-border/70 bg-card p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                    Total Inquiries
                                </span>
                                <MessageSquare className="size-4 text-muted-foreground/70" />
                            </div>
                            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                                {stats.total_queries}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Lifetime AI conversations
                            </p>
                        </div>

                        <div className="rounded-lg border border-border/70 bg-card p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                    Today's Queries
                                </span>
                                <Bot className="size-4 text-primary/70" />
                            </div>
                            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                                {stats.queries_today}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Prompts answered today
                            </p>
                        </div>

                        <div className="rounded-lg border border-border/70 bg-card p-4">
                            <div className="flex items-center justify-between">
                                <span className="font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                    Unique Visitors
                                </span>
                                <Users className="size-4 text-muted-foreground/70" />
                            </div>
                            <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-foreground">
                                {stats.unique_visitors}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                                Unique hashed visitor IPs
                            </p>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="flex flex-col gap-3 rounded-lg border border-border/70 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                        <p className="text-xs text-muted-foreground">
                            {logs.total} {logs.total === 1 ? 'log' : 'logs'}{' '}
                            recorded
                        </p>
                        <form
                            onSubmit={handleSearchSubmit}
                            className="relative w-full max-w-xs"
                        >
                            <Search className="pointer-events-none absolute top-2.5 left-2.5 size-3.5 text-muted-foreground" />
                            <Input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Search visitor questions or answers..."
                                className="h-8 pl-8 text-xs"
                            />
                        </form>
                    </div>

                    {/* Logs Table */}
                    <section className="flex flex-1 flex-col overflow-hidden rounded-lg border border-border/40 bg-background/30">
                        <div className="flex-1 overflow-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="w-40">
                                            Time
                                        </TableHead>
                                        <TableHead className="w-28">
                                            Visitor Hash
                                        </TableHead>
                                        <TableHead>User Question</TableHead>
                                        <TableHead className="w-24">
                                            Status
                                        </TableHead>
                                        <TableHead className="text-right">
                                            Actions
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {logs.data.length ? (
                                        logs.data.map((log) => (
                                            <TableRow
                                                key={log.id}
                                                className="cursor-pointer transition-colors hover:bg-accent/40"
                                                onClick={() =>
                                                    setActiveLog(log)
                                                }
                                            >
                                                <TableCell className="text-xs whitespace-nowrap text-muted-foreground">
                                                    {formatDate(log.created_at)}
                                                </TableCell>
                                                <TableCell className="font-mono text-xs text-muted-foreground">
                                                    {log.ip_hash.slice(0, 10)}
                                                    ...
                                                </TableCell>
                                                <TableCell>
                                                    <p className="max-w-md truncate text-sm font-medium text-foreground sm:max-w-lg">
                                                        {log.user_question}
                                                    </p>
                                                    <p className="max-w-md truncate text-xs text-muted-foreground sm:max-w-lg">
                                                        {log.assistant_answer}
                                                    </p>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant={
                                                            log.status ===
                                                            'success'
                                                                ? 'default'
                                                                : log.status ===
                                                                    'rate_limited'
                                                                  ? 'secondary'
                                                                  : 'destructive'
                                                        }
                                                        className="text-[10px]"
                                                    >
                                                        {log.status}
                                                    </Badge>
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
                                                            className="size-7 text-destructive hover:text-destructive"
                                                            title="Delete log"
                                                            onClick={() =>
                                                                deleteLog(log)
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
                                                colSpan={5}
                                                className="py-12 text-center text-sm text-muted-foreground"
                                            >
                                                No assistant conversation logs
                                                found.
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        {logs.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-border/40 p-2 text-xs text-muted-foreground">
                                <span>
                                    Page {logs.current_page} of {logs.last_page}{' '}
                                    ({logs.total} entries)
                                </span>
                                <div className="flex items-center gap-1">
                                    {logs.links.map((link, idx) => (
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

            {/* Conversation Detail Modal */}
            <Dialog
                open={!!activeLog}
                onOpenChange={(open) => !open && setActiveLog(null)}
            >
                <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
                    {activeLog && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center justify-between gap-2">
                                    <DialogTitle className="text-lg font-semibold">
                                        AI Interaction Details
                                    </DialogTitle>
                                    <Badge
                                        variant={
                                            activeLog.status === 'success'
                                                ? 'default'
                                                : activeLog.status ===
                                                    'rate_limited'
                                                  ? 'secondary'
                                                  : 'destructive'
                                        }
                                    >
                                        {activeLog.status}
                                    </Badge>
                                </div>
                                <DialogDescription className="text-xs text-muted-foreground">
                                    Logged on {formatDate(activeLog.created_at)}{' '}
                                    • Visitor {activeLog.ip_hash.slice(0, 12)}
                                </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4 pt-2">
                                <div>
                                    <p className="mb-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                        Visitor Prompt
                                    </p>
                                    <div className="rounded-md border border-border/60 bg-muted/20 p-3 text-sm text-foreground">
                                        {activeLog.user_question}
                                    </div>
                                </div>

                                <div>
                                    <p className="mb-1 font-mono text-xs tracking-wider text-muted-foreground uppercase">
                                        Assistant Response
                                    </p>
                                    <div className="rounded-md border border-border/50 bg-card p-4 font-sans text-sm leading-relaxed whitespace-pre-wrap text-foreground">
                                        {activeLog.assistant_answer}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between border-t border-border/40 pt-4">
                                    <span className="font-mono text-[11px] text-muted-foreground">
                                        Session:{' '}
                                        {activeLog.session_id || 'anonymous'}
                                    </span>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => deleteLog(activeLog)}
                                    >
                                        <Trash2 className="size-3.5" />
                                        Delete Log Entry
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>

            <Dialog
                open={isClearDialogOpen}
                onOpenChange={(open) =>
                    !isClearing && setIsClearDialogOpen(open)
                }
            >
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Clear all assistant logs?</DialogTitle>
                        <DialogDescription>
                            This permanently deletes {stats.total_queries}{' '}
                            {stats.total_queries === 1
                                ? 'conversation'
                                : 'conversations'}{' '}
                            from the assistant log. This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            disabled={isClearing}
                            onClick={() => setIsClearDialogOpen(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            disabled={isClearing || stats.total_queries === 0}
                            onClick={handleClearAll}
                        >
                            <Trash2 className="size-3.5" />
                            {isClearing ? 'Clearing…' : 'Clear all logs'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
