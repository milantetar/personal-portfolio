import { cn } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
        <Card className={cn('rounded-md', className)}>
            <CardHeader>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
                {value !== undefined && (
                    <p className="font-display text-3xl font-medium tracking-tight">
                        {value}
                    </p>
                )}
                {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
                {children}
            </CardContent>
        </Card>
    );
}
