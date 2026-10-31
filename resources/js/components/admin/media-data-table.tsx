import { useEffect, useMemo, useState } from 'react';
import { router, useForm } from '@inertiajs/react';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
    type ColumnDef,
    type RowSelectionState,
} from '@tanstack/react-table';
import {
    AppWindow,
    Copy,
    Crown,
    Download,
    Eye,
    FileText,
    Filter,
    FolderPlus,
    ImageIcon,
    MoreHorizontal,
    Pencil,
    Search,
    Trash2,
    User,
    Wallpaper,
} from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { MediaUploadZone } from '@/components/admin/media-upload-zone';
import { useMediaUpload } from '@/hooks/use-media-upload';
import { cn } from '@/lib/utils';
import type { Branding, Media, MediaFilters, PaginatedMedia } from '@/types';

interface MediaEditFormData {
    alt_text: string;
    title: string;
    usage: 'none' | 'logo' | 'background' | 'avatar' | 'resume' | 'favicon';
}

interface MediaCreateFormData {
    alt_text: string;
    title: string;
    usage: 'none' | 'logo' | 'background' | 'avatar' | 'resume' | 'favicon';
}

interface MediaDataTableProps {
    filters: MediaFilters;
    mediaItems: PaginatedMedia;
    branding?: Branding;
}

export function MediaDataTable({
    filters,
    mediaItems,
    branding,
}: MediaDataTableProps) {
    const [search, setSearch] = useState(filters.search);
    const [deleteItem, setDeleteItem] = useState<Media | null>(null);
    const [editItem, setEditItem] = useState<Media | null>(null);
    const [previewItem, setPreviewItem] = useState<Media | null>(null);
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [isBulkUploading, setIsBulkUploading] = useState(false);

    // Multi-selection state
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [isBulkDeleting, setIsBulkDeleting] = useState(false);

    const { clearErrors, data, errors, processing, put, reset, setData } =
        useForm<MediaEditFormData>({
            alt_text: '',
            title: '',
            usage: 'none',
        });

    const {
        data: createData,
        reset: resetCreateData,
        setData: setCreateData,
    } = useForm<MediaCreateFormData>({
        alt_text: '',
        title: '',
        usage: 'none',
    });

    const {
        clearPreview: clearCreatePreview,
        error: uploadError,
        isUploading,
        previewUrl: createPreviewUrl,
        upload,
    } = useMediaUpload();

    useEffect(() => setSearch(filters.search), [filters.search]);

    useEffect(() => {
        const timeout = window.setTimeout(() => {
            if (search !== filters.search) {
                router.get(
                    '/dashboard/media',
                    { ...filters, search, page: 1 },
                    {
                        preserveState: true,
                        replace: true,
                        preserveScroll: true,
                    },
                );
            }
        }, 350);

        return () => window.clearTimeout(timeout);
    }, [filters, search]);

    useEffect(() => {
        if (!editItem) return;

        const currentUsage: MediaEditFormData['usage'] =
            branding?.logo?.id === editItem.id
                ? 'logo'
                : branding?.backgroundImage?.id === editItem.id
                  ? 'background'
                  : branding?.avatar?.id === editItem.id
                    ? 'avatar'
                    : branding?.favicon?.id === editItem.id
                      ? 'favicon'
                      : 'none';

        setData({
            title: editItem.title || '',
            alt_text: editItem.alt_text || '',
            usage: currentUsage,
        });
        clearErrors();
    }, [clearErrors, editItem, setData, branding]);

    // Compute array of selected IDs
    const selectedIds = useMemo(() => {
        return Object.keys(rowSelection)
            .filter((key) => rowSelection[key])
            .map(Number);
    }, [rowSelection]);

    const updateFilter = (
        key: 'mime_type' | 'per_page' | 'sort',
        value: string | null,
    ) => {
        if (!value) return;

        router.get(
            '/dashboard/media',
            {
                ...filters,
                [key]: value === 'all' ? undefined : value,
                page: 1,
            },
            { preserveState: true, replace: true, preserveScroll: true },
        );
    };

    const handleDelete = () => {
        if (!deleteItem) return;

        router.delete(`/dashboard/media/${deleteItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Media deleted permanently.');
                setDeleteItem(null);
                setRowSelection((prev) => {
                    const next = { ...prev };
                    delete next[deleteItem.id.toString()];
                    return next;
                });
            },
            onError: () => toast.error('Failed to delete media.'),
        });
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;

        setIsBulkDeleting(true);
        toast.loading(`Deleting ${selectedIds.length} media files...`, {
            id: 'bulk-delete',
        });

        router.post(
            '/dashboard/media/bulk-destroy',
            { ids: selectedIds },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(
                        `${selectedIds.length} media files deleted successfully.`,
                        { id: 'bulk-delete' },
                    );
                    setRowSelection({});
                    setIsBulkDeleteOpen(false);
                    setIsBulkDeleting(false);
                },
                onError: () => {
                    toast.error('Failed to delete selected media files.', {
                        id: 'bulk-delete',
                    });
                    setIsBulkDeleting(false);
                },
            },
        );
    };

    const handleEditSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!editItem) return;

        put(`/dashboard/media/${editItem.id}`, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Media details updated successfully.');
                setEditItem(null);
                reset();
            },
            onError: () => toast.error('Failed to update media details.'),
        });
    };

    const handleAddFile = async (file: File) => {
        toast.loading('Uploading media file...', { id: 'media-table-upload' });
        const uploaded = await upload(file, {
            alt_text: createData.alt_text,
            title: createData.title,
            usage: createData.usage,
        });
        if (!uploaded) {
            toast.error(uploadError || 'Upload failed.', {
                id: 'media-table-upload',
            });
            return;
        }

        router.reload({
            only: ['mediaItems', 'branding'],
            onSuccess: () => {
                toast.success('Media uploaded successfully.', {
                    id: 'media-table-upload',
                });
                setIsAddOpen(false);
                resetCreateData();
                clearCreatePreview();
            },
        });
    };

    const handleAddFiles = async (files: File[]) => {
        setIsBulkUploading(true);
        toast.loading(`Uploading ${files.length} media files...`, {
            id: 'media-bulk-upload',
        });
        const formData = new FormData();
        files.forEach((file) => formData.append('files[]', file));
        if (createData.title) formData.append('title', createData.title);
        if (createData.alt_text)
            formData.append('alt_text', createData.alt_text);

        try {
            const response = await fetch('/dashboard/media/bulk-store', {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN':
                        document.querySelector<HTMLMetaElement>(
                            'meta[name="csrf-token"]',
                        )?.content ?? '',
                },
                body: formData,
            });
            const result = (await response.json()) as {
                success: boolean;
                message: string;
                errors?: Record<string, string[]>;
            };
            if (!response.ok || !result.success)
                throw new Error(
                    result.errors
                        ? Object.values(result.errors).flat().join(' ')
                        : result.message,
                );

            toast.success(`${files.length} media files uploaded.`, {
                id: 'media-bulk-upload',
            });
            setIsAddOpen(false);
            resetCreateData();
            router.reload({ only: ['mediaItems', 'branding'] });
        } catch (error: unknown) {
            const message =
                error instanceof Error ? error.message : 'Bulk upload failed.';
            toast.error(
                /failed to upload|upload failed|did not receive/i.test(message)
                    ? 'The server could not receive this file. Check that it is a supported type and smaller than 20 MB.'
                    : message,
                { id: 'media-bulk-upload' },
            );
        } finally {
            setIsBulkUploading(false);
        }
    };

    const handleQuickAssign = (
        media: Media,
        slot: 'logo' | 'background' | 'avatar' | 'resume' | 'favicon',
    ) => {
        const slotTitle =
            slot === 'logo'
                ? 'Navbar Logo'
                : slot === 'background'
                  ? 'Backdrop Wallpaper'
                  : slot === 'avatar'
                    ? 'Profile Avatar'
                    : slot === 'resume'
                      ? 'Resume CV'
                      : 'Browser Favicon';
        toast.loading(`Activating ${slotTitle}...`, {
            id: `quick-assign-${media.id}`,
        });

        router.post(
            `/dashboard/media/${media.id}/assign-slot`,
            { slot },
            {
                preserveScroll: true,
                onSuccess: () => {
                    toast.success(`Activated as ${slotTitle}.`, {
                        id: `quick-assign-${media.id}`,
                    });
                },
                onError: () => {
                    toast.error(`Could not activate ${slotTitle}.`, {
                        id: `quick-assign-${media.id}`,
                    });
                },
            },
        );
    };

    const handleCopyUrl = (url: string) => {
        void navigator.clipboard.writeText(url);
        toast.success('Media URL copied to clipboard.');
    };

    // Columns Definition
    const columns = useMemo<ColumnDef<Media>[]>(
        () => [
            {
                id: 'select',
                header: ({ table }) => (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            className="size-4 cursor-pointer accent-primary"
                            checked={table.getIsAllPageRowsSelected()}
                            ref={(input) => {
                                if (input) {
                                    input.indeterminate =
                                        table.getIsSomePageRowsSelected() &&
                                        !table.getIsAllPageRowsSelected();
                                }
                            }}
                            onChange={table.getToggleAllPageRowsSelectedHandler()}
                            aria-label="Select all files on this page"
                        />
                    </div>
                ),
                cell: ({ row }) => (
                    <div className="flex items-center justify-center">
                        <input
                            type="checkbox"
                            className="size-4 cursor-pointer accent-primary"
                            checked={row.getIsSelected()}
                            disabled={!row.getCanSelect()}
                            onChange={row.getToggleSelectedHandler()}
                            aria-label={`Select ${row.original.original_name}`}
                        />
                    </div>
                ),
                enableSorting: false,
                enableHiding: false,
            },
            {
                accessorKey: 'url',
                header: 'Preview',
                cell: ({ row }) => {
                    const isPdf =
                        row.original.mime_type === 'application/pdf' ||
                        row.original.url.toLowerCase().includes('.pdf');

                    return (
                        <Button
                            aria-label={`Preview ${row.original.original_name}`}
                            className="group relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-md border border-border bg-background p-1 transition-colors hover:border-primary/60 hover:bg-accent"
                            onClick={() => setPreviewItem(row.original)}
                            size="icon"
                            type="button"
                            variant="ghost"
                        >
                            {isPdf ? (
                                <FileText className="h-6 w-6 text-destructive" />
                            ) : row.original.url ? (
                                <img
                                    alt={
                                        row.original.alt_text ||
                                        row.original.original_name
                                    }
                                    className="max-h-full max-w-full object-contain"
                                    src={row.original.url}
                                />
                            ) : (
                                <ImageIcon className="h-5 w-5 text-foreground" />
                            )}
                            <span className="absolute inset-0 flex items-center justify-center bg-card opacity-0 transition-opacity group-hover:opacity-100">
                                <Eye className="h-4 w-4 text-foreground" />
                            </span>
                        </Button>
                    );
                },
            },
            {
                accessorKey: 'original_name',
                header: 'Name',
                cell: ({ row }) => {
                    const isLogo = branding?.logo?.id === row.original.id;
                    const isBg =
                        branding?.backgroundImage?.id === row.original.id;
                    const isAvatar = branding?.avatar?.id === row.original.id;

                    return (
                        <div className="space-y-1">
                            <div className="text-sm font-medium text-foreground">
                                {row.original.original_name}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                                {isLogo && (
                                    <Badge variant="amber">
                                        <Crown className="h-3 w-3" /> Active
                                        Logo
                                    </Badge>
                                )}
                                {isBg && (
                                    <Badge variant="blue">
                                        <Wallpaper className="h-3 w-3" /> Active
                                        Backdrop
                                    </Badge>
                                )}
                                {isAvatar && (
                                    <Badge variant="purple">
                                        <User className="h-3 w-3" /> Active
                                        Avatar
                                    </Badge>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                accessorKey: 'mime_type',
                header: 'Type',
                cell: ({ row }) => (
                    <span className="rounded border border-border bg-muted/40 px-2 py-0.5 font-mono text-[11px] text-foreground uppercase">
                        {row.original.mime_type.split('/')[1] ||
                            row.original.mime_type}
                    </span>
                ),
            },
            {
                accessorKey: 'size',
                header: 'Size',
                cell: ({ row }) => (
                    <span className="font-mono text-xs text-foreground">
                        {(row.original.size / 1024).toFixed(1)} KB
                    </span>
                ),
            },
        ],
        [branding],
    );

    const table = useReactTable({
        data: mediaItems.data,
        columns,
        state: {
            rowSelection,
        },
        enableRowSelection: true,
        onRowSelectionChange: setRowSelection,
        getRowId: (row) => row.id.toString(),
        getCoreRowModel: getCoreRowModel(),
    });

    return (
        <div className="admin-media-table space-y-4">
            <div className="admin-media-toolbar flex flex-col gap-3 border-b border-border p-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
                    <Button
                        onClick={() => setIsAddOpen(true)}
                        className="font-medium"
                    >
                        <span className="mr-1 text-base leading-none">+</span>{' '}
                        Add Media
                    </Button>

                    <div className="relative w-full sm:max-w-64">
                        <Search className="absolute top-2.5 left-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            className="pl-9 placeholder:text-muted-foreground"
                            onChange={(event) => setSearch(event.target.value)}
                            aria-label="Search media files"
                            placeholder="Search files..."
                            value={search}
                        />
                    </div>

                    <Select
                        onValueChange={(value) =>
                            updateFilter('mime_type', value)
                        }
                        value={filters.mime_type || 'all'}
                    >
                        <SelectTrigger className="w-32.5">
                            <Filter className="mr-2 h-3.5 w-3.5 text-muted-foreground" />
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Types</SelectItem>
                            <SelectItem value="image">Images</SelectItem>
                            <SelectItem value="svg">SVGs</SelectItem>
                            <SelectItem value="application">
                                Documents
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    <Select
                        onValueChange={(value) => updateFilter('sort', value)}
                        value={filters.sort || 'latest'}
                    >
                        <SelectTrigger className="w-32.5">
                            <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="latest">Newest First</SelectItem>
                            <SelectItem value="oldest">Oldest First</SelectItem>
                            <SelectItem value="largest">
                                Largest Size
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>Show</span>
                    <Select
                        onValueChange={(value) =>
                            updateFilter('per_page', value)
                        }
                        value={filters.per_page.toString()}
                    >
                        <SelectTrigger className="w-18">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="10">10</SelectItem>
                            <SelectItem value="25">25</SelectItem>
                            <SelectItem value="50">50</SelectItem>
                        </SelectContent>
                    </Select>
                    <span>entries</span>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="admin-bulk-toolbar flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card px-3 py-2.5">
                    <div className="flex items-center gap-3">
                        <span className="text-xs font-medium text-foreground">
                            {selectedIds.length}{' '}
                            {selectedIds.length === 1 ? 'file' : 'files'}{' '}
                            selected
                        </span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setRowSelection({})}
                            className="h-7 text-xs text-foreground hover:bg-muted/40 hover:text-foreground"
                        >
                            Deselect all
                        </Button>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                                const allSelected: RowSelectionState = {};
                                mediaItems.data.forEach((item) => {
                                    allSelected[item.id.toString()] = true;
                                });
                                setRowSelection(allSelected);
                            }}
                            className="h-7 text-xs text-foreground hover:bg-muted/40 hover:text-foreground"
                        >
                            Select all on page ({mediaItems.data.length})
                        </Button>
                    </div>

                    <Button
                        size="sm"
                        onClick={() => setIsBulkDeleteOpen(true)}
                        className="h-8 text-xs font-medium"
                        variant="destructive"
                    >
                        <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                        Delete Selected ({selectedIds.length})
                    </Button>
                </div>
            )}

            {/* Pure Minimal Glass Data Table */}
            <div className="overflow-hidden rounded-lg border border-border bg-card">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[46rem] text-left text-sm">
                        <thead className="sticky top-0 z-10 border-b border-border bg-muted text-muted-foreground">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            className="px-3 py-3 font-mono text-[10px] font-medium tracking-wider uppercase"
                                            key={header.id}
                                        >
                                            {flexRender(
                                                header.column.columnDef.header,
                                                header.getContext(),
                                            )}
                                        </th>
                                    ))}
                                    <th className="px-3 py-3 text-right font-mono text-[10px] font-medium tracking-wider uppercase">
                                        Actions
                                    </th>
                                </tr>
                            ))}
                        </thead>
                        <tbody className="divide-y divide-border/70">
                            {table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <tr
                                        className={cn(
                                            'transition-colors',
                                            row.getIsSelected()
                                                ? 'bg-accent/70'
                                                : 'hover:bg-accent/45',
                                        )}
                                        key={row.id}
                                    >
                                        {row.getVisibleCells().map((cell) => (
                                            <td
                                                className="px-3 py-3"
                                                key={cell.id}
                                            >
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext(),
                                                )}
                                            </td>
                                        ))}
                                        <td className="px-3 py-3">
                                            <div className="flex items-center justify-end gap-1">
                                                {/* Quick Slot Assign Dropdown */}
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger
                                                        render={
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 rounded-lg text-foreground hover:bg-muted/40 hover:text-foreground"
                                                                title="Slot Actions"
                                                            >
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        }
                                                    />
                                                    <DropdownMenuContent
                                                        align="end"
                                                        className="w-52 border-border bg-card text-foreground shadow-none backdrop-blur-none"
                                                    >
                                                        <DropdownMenuLabel className="text-xs font-semibold text-foreground">
                                                            Assign Slot
                                                        </DropdownMenuLabel>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 hover:bg-muted/40"
                                                            onClick={() =>
                                                                handleQuickAssign(
                                                                    row.original,
                                                                    'logo',
                                                                )
                                                            }
                                                        >
                                                            <Crown className="h-3.5 w-3.5 text-amber-300" />
                                                            Set as Logo
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 hover:bg-muted/40"
                                                            onClick={() =>
                                                                handleQuickAssign(
                                                                    row.original,
                                                                    'background',
                                                                )
                                                            }
                                                        >
                                                            <Wallpaper className="h-3.5 w-3.5 text-sky-300" />
                                                            Set as Backdrop
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 hover:bg-muted/40"
                                                            onClick={() =>
                                                                handleQuickAssign(
                                                                    row.original,
                                                                    'avatar',
                                                                )
                                                            }
                                                        >
                                                            <User className="h-3.5 w-3.5 text-purple-300" />
                                                            Set as Avatar
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 hover:bg-muted/40"
                                                            disabled={!row.original.mime_type.startsWith('image/')}
                                                            onClick={() =>
                                                                handleQuickAssign(
                                                                    row.original,
                                                                    'favicon',
                                                                )
                                                            }
                                                        >
                                                            <AppWindow className="h-3.5 w-3.5 text-foreground" />
                                                            Set as Favicon
                                                        </DropdownMenuItem>
                                                        <DropdownMenuSeparator className="bg-muted/40" />
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 hover:bg-muted/40"
                                                            onClick={() =>
                                                                handleCopyUrl(
                                                                    row.original
                                                                        .url,
                                                                )
                                                            }
                                                        >
                                                            <Copy className="h-3.5 w-3.5 text-foreground" />
                                                            Copy Direct URL
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 hover:bg-muted/40"
                                                            onClick={() =>
                                                                setEditItem(
                                                                    row.original,
                                                                )
                                                            }
                                                        >
                                                            <Pencil className="h-3.5 w-3.5 text-primary" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="cursor-pointer gap-2 text-destructive hover:bg-red-500/20 focus:text-destructive"
                                                            onClick={() =>
                                                                setDeleteItem(
                                                                    row.original,
                                                                )
                                                            }
                                                        >
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Delete Media
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>

                                                <Button
                                                    aria-label="Edit media"
                                                    className="h-8 w-8 rounded-lg text-foreground hover:bg-muted/40 hover:text-foreground"
                                                    onClick={() =>
                                                        setEditItem(
                                                            row.original,
                                                        )
                                                    }
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </Button>

                                                <Button
                                                    aria-label="Delete media"
                                                    className="h-8 w-8 rounded-lg text-destructive hover:bg-red-500/20 hover:text-destructive"
                                                    onClick={() =>
                                                        setDeleteItem(
                                                            row.original,
                                                        )
                                                    }
                                                    size="icon"
                                                    variant="ghost"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        className="px-4 py-12 text-center text-sm text-muted-foreground"
                                        colSpan={columns.length + 1}
                                    >
                                        No files match this search or filter.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
                <p>
                    Showing{' '}
                    <span className="font-medium text-foreground">
                        {mediaItems.meta.from || 0}
                    </span>{' '}
                    to{' '}
                    <span className="font-medium text-foreground">
                        {mediaItems.meta.to || 0}
                    </span>{' '}
                    of{' '}
                    <span className="font-medium text-foreground">
                        {mediaItems.meta.total}
                    </span>{' '}
                    entries
                </p>
                <div className="flex gap-2">
                    <Button
                        disabled={mediaItems.meta.current_page <= 1}
                        onClick={() =>
                            router.get(
                                '/dashboard/media',
                                {
                                    ...filters,
                                    page: mediaItems.meta.current_page - 1,
                                },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                        size="sm"
                        variant="outline"
                    >
                        Previous
                    </Button>
                    <Button
                        disabled={
                            mediaItems.meta.current_page >=
                            mediaItems.meta.last_page
                        }
                        onClick={() =>
                            router.get(
                                '/dashboard/media',
                                {
                                    ...filters,
                                    page: mediaItems.meta.current_page + 1,
                                },
                                { preserveState: true, preserveScroll: true },
                            )
                        }
                        size="sm"
                        variant="outline"
                    >
                        Next
                    </Button>
                </div>
            </div>

            {/* Single Delete Confirmation Modal */}
            <Dialog
                onOpenChange={(open) => !open && setDeleteItem(null)}
                open={deleteItem !== null}
            >
                <DialogContent className="border-border bg-card text-foreground shadow-none backdrop-blur-none">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Delete Media File
                        </DialogTitle>
                        <DialogDescription className="text-foreground">
                            Are you sure you want to permanently delete{' '}
                            <strong className="text-foreground">
                                {deleteItem?.original_name}
                            </strong>
                            ? Any branding slot using it will be cleared.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setDeleteItem(null)}
                            type="button"
                            variant="outline"
                            className="border-border bg-muted/40 text-foreground hover:bg-muted/40"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            type="button"
                            variant="destructive"
                        >
                            Delete Permanently
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Media preview lightbox */}
            <Dialog
                onOpenChange={(open) => !open && setPreviewItem(null)}
                open={previewItem !== null}
            >
                <DialogContent className="max-w-5xl border-border bg-card text-foreground backdrop-blur-none">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            {previewItem?.title || previewItem?.original_name}
                        </DialogTitle>
                        <DialogDescription className="text-foreground">
                            {previewItem?.mime_type}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex max-h-[70vh] min-h-80 items-center justify-center overflow-hidden rounded-lg border border-border bg-card">
                        {previewItem?.mime_type === 'application/pdf' ||
                        previewItem?.url.toLowerCase().includes('.pdf') ? (
                            <iframe
                                className="h-[70vh] w-full"
                                src={`${previewItem.url}#toolbar=1&view=FitH`}
                                title={
                                    previewItem.title ||
                                    previewItem.original_name
                                }
                            />
                        ) : previewItem?.mime_type.startsWith('image/') ? (
                            <img
                                alt={
                                    previewItem.alt_text ||
                                    previewItem.original_name
                                }
                                className="max-h-[70vh] max-w-full object-contain"
                                src={previewItem.url}
                            />
                        ) : previewItem ? (
                            <div className="flex flex-col items-center gap-4 p-10 text-center">
                                <FileText className="h-16 w-16 text-foreground" />
                                <p className="text-sm text-foreground">
                                    This file type cannot be previewed in the
                                    browser.
                                </p>
                            </div>
                        ) : null}
                    </div>
                    {previewItem && (
                        <DialogFooter>
                            <a
                                className="inline-flex h-8 items-center justify-center rounded-lg border border-border bg-muted/40 px-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted/40"
                                href={previewItem.url}
                                rel="noreferrer"
                                target="_blank"
                            >
                                <Download className="mr-2 h-4 w-4" /> Open /
                                Download
                            </a>
                        </DialogFooter>
                    )}
                </DialogContent>
            </Dialog>

            {/* Bulk Delete Confirmation Modal */}
            <Dialog
                onOpenChange={(open) => !open && setIsBulkDeleteOpen(false)}
                open={isBulkDeleteOpen}
            >
                <DialogContent className="border-border bg-card text-foreground shadow-none backdrop-blur-none">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Delete Selected Media
                        </DialogTitle>
                        <DialogDescription className="text-foreground">
                            Are you sure you want to permanently delete{' '}
                            <strong className="text-foreground">
                                {selectedIds.length}
                            </strong>{' '}
                            selected media{' '}
                            {selectedIds.length === 1 ? 'file' : 'files'}? Any
                            branding slot using them will be cleared.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            onClick={() => setIsBulkDeleteOpen(false)}
                            type="button"
                            variant="outline"
                            className="border-border bg-muted/40 text-foreground hover:bg-muted/40"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleBulkDelete}
                            type="button"
                            variant="destructive"
                            disabled={isBulkDeleting}
                        >
                            {isBulkDeleting
                                ? 'Deleting...'
                                : `Delete ${selectedIds.length} ${selectedIds.length === 1 ? 'File' : 'Files'}`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Metadata & Slot Modal */}
            <Dialog
                onOpenChange={(open) => !open && setEditItem(null)}
                open={editItem !== null}
            >
                <DialogContent className="border-border bg-card text-foreground shadow-none backdrop-blur-none">
                    <DialogHeader>
                        <DialogTitle className="text-foreground">
                            Edit Media Details
                        </DialogTitle>
                        <DialogDescription className="text-foreground">
                            Update metadata and theme slot assignment for{' '}
                            <strong className="text-foreground">
                                {editItem?.original_name}
                            </strong>
                            .
                        </DialogDescription>
                    </DialogHeader>
                    <form
                        className="space-y-4 py-4"
                        onSubmit={handleEditSubmit}
                    >
                        <div className="space-y-2">
                            <Label
                                htmlFor="media-title"
                                className="text-foreground"
                            >
                                Title
                            </Label>
                            <Input
                                id="media-title"
                                onChange={(event) =>
                                    setData('title', event.target.value)
                                }
                                placeholder="Image title"
                                value={data.title}
                                className="border-border bg-card text-foreground placeholder:text-foreground"
                            />
                            {errors.title && (
                                <p className="text-xs text-destructive">
                                    {errors.title}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="media-alt-text"
                                className="text-foreground"
                            >
                                Alt text
                            </Label>
                            <Input
                                id="media-alt-text"
                                onChange={(event) =>
                                    setData('alt_text', event.target.value)
                                }
                                placeholder="Describe this file"
                                value={data.alt_text}
                                className="border-border bg-card text-foreground placeholder:text-foreground"
                            />
                            {errors.alt_text && (
                                <p className="text-xs text-destructive">
                                    {errors.alt_text}
                                </p>
                            )}
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="media-usage"
                                className="text-foreground"
                            >
                                Theme Slot Assignment
                            </Label>
                            <Select
                                onValueChange={(value) =>
                                    value &&
                                    setData(
                                        'usage',
                                        value as MediaEditFormData['usage'],
                                    )
                                }
                                value={data.usage}
                            >
                                <SelectTrigger
                                    id="media-usage"
                                    className="border-border bg-card text-foreground"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-card text-foreground backdrop-blur-none">
                                    <SelectItem value="none">
                                        Regular media only (No slot)
                                    </SelectItem>
                                    <SelectItem value="logo">
                                        Navbar Logo (Header)
                                    </SelectItem>
                                    <SelectItem value="background">
                                        Backdrop Wallpaper (Full View)
                                    </SelectItem>
                                    <SelectItem value="avatar">
                                        Profile Avatar (Personal Image)
                                    </SelectItem>
                                    <SelectItem value="resume">
                                        Resume / CV (Download)
                                    </SelectItem>
                                    <SelectItem value="favicon">
                                        Browser favicon
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <DialogFooter>
                            <Button
                                onClick={() => setEditItem(null)}
                                type="button"
                                variant="outline"
                                className="border-border bg-muted/40 text-foreground hover:bg-muted/40"
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={processing}
                                type="submit"
                                className="border border-border bg-muted text-foreground hover:bg-accent"
                            >
                                {processing ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Add Media Modal with Direct Slot Choice */}
            <Dialog
                onOpenChange={(open) => {
                    setIsAddOpen(open);
                    if (!open) {
                        resetCreateData();
                        clearCreatePreview();
                    }
                }}
                open={isAddOpen}
            >
                <DialogContent className="border-border bg-card text-foreground shadow-none backdrop-blur-none">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2 text-foreground">
                            <FolderPlus className="h-5 w-5 text-foreground" />{' '}
                            Add New Media
                        </DialogTitle>
                        <DialogDescription className="text-foreground">
                            Upload a file to your portfolio and optionally
                            assign it directly to a theme slot.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="new-media-title"
                                className="text-foreground"
                            >
                                Title
                            </Label>
                            <Input
                                id="new-media-title"
                                onChange={(event) =>
                                    setCreateData('title', event.target.value)
                                }
                                placeholder="Optional title"
                                value={createData.title}
                                className="border-border bg-card text-foreground placeholder:text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="new-media-alt"
                                className="text-foreground"
                            >
                                Alt text
                            </Label>
                            <Input
                                id="new-media-alt"
                                onChange={(event) =>
                                    setCreateData(
                                        'alt_text',
                                        event.target.value,
                                    )
                                }
                                placeholder="Describe the image"
                                value={createData.alt_text}
                                className="border-border bg-card text-foreground placeholder:text-foreground"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label
                                htmlFor="new-media-slot"
                                className="text-foreground"
                            >
                                Assign Immediately To Slot
                            </Label>
                            <Select
                                onValueChange={(value) =>
                                    value &&
                                    setCreateData(
                                        'usage',
                                        value as MediaCreateFormData['usage'],
                                    )
                                }
                                value={createData.usage}
                            >
                                <SelectTrigger
                                    id="new-media-slot"
                                    className="border-border bg-card text-foreground"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="border-border bg-card text-foreground backdrop-blur-none">
                                    <SelectItem value="none">
                                        General Media Only
                                    </SelectItem>
                                    <SelectItem value="logo">
                                        Navbar Logo
                                    </SelectItem>
                                    <SelectItem value="background">
                                        Backdrop Wallpaper
                                    </SelectItem>
                                    <SelectItem value="avatar">
                                        Profile Avatar
                                    </SelectItem>
                                    <SelectItem value="resume">
                                        Resume / CV
                                    </SelectItem>
                                    <SelectItem value="favicon">
                                        Browser favicon
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        {createPreviewUrl && (
                            <img
                                alt="Upload preview"
                                className="max-h-40 w-full rounded-lg border border-border bg-card object-contain p-2"
                                src={createPreviewUrl}
                            />
                        )}
                        <MediaUploadZone
                            error={uploadError}
                            id="new-media-file-upload"
                            isUploading={isUploading || isBulkUploading}
                            multiple
                            onFileSelected={handleAddFile}
                            onFilesSelected={handleAddFiles}
                        />
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={() => setIsAddOpen(false)}
                            type="button"
                            variant="outline"
                            className="border-border bg-muted/40 text-foreground hover:bg-muted/40"
                        >
                            Cancel
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
