import { cn } from '@/lib/utils';

interface GlassCardProps {
    title: string;
    value?: string | number;
    hint?: string;
    children?: React.ReactNode;
    className?: string;
}

export function GlassCard({
    title,
    value,
    hint,
    children,
    className,
}: GlassCardProps) {
    return (
        <div
            className={cn(
                'rounded-2xl border p-6',
                'text-card-foreground',
                'backdrop-blur-xl backdrop-saturate-150',
                'shadow-[0_8px_32px_rgba(0,0,0,0.12)]',
                'transition-colors',
                className
            )}
            style={{
                backgroundColor: 'hsl(var(--glass-bg) / var(--glass-bg-opacity))',
                borderColor: 'hsl(var(--glass-border) / var(--glass-border-opacity))',
            }}
        >
            <p className="text-sm font-medium tracking-wide text-muted-foreground">
                {title}
            </p>

            {value !== undefined && (
                <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">
                    {value}
                </p>
            )}

            {hint && <p className="mt-2 text-sm text-muted-foreground">{hint}</p>}

            {children}
        </div>
    );
}