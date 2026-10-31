import type { ReactNode } from 'react';

interface AdminPageHeaderProps {
    icon: ReactNode;
    title: string;
    description: string;
    actions?: ReactNode;
}

export function AdminPageHeader({ icon, title, description, actions }: AdminPageHeaderProps) {
    return (
        <header className="admin-page-header mb-6 flex flex-col gap-4 border-b border-border/80 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="flex min-w-0 items-start gap-3">
                <div className="admin-page-header-icon flex size-10 shrink-0 items-center justify-center border border-border bg-card text-primary" aria-hidden="true">
                    {icon}
                </div>
                <div>
                    <h1 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h1>
                    <p className="mt-1 max-w-2xl text-xs text-muted-foreground sm:text-sm">{description}</p>
                </div>
            </div>
            {actions ? <div className="flex flex-wrap gap-2 sm:shrink-0">{actions}</div> : null}
        </header>
    );
}
