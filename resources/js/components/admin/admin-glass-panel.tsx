import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export function AdminGlassPanel({ className, ...props }: HTMLAttributes<HTMLElement>) {
    return <section className={cn('admin-panel min-w-0', className)} {...props} />;
}
