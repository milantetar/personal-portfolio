
import { Check, Palette } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/components/theme-provider';
import { THEMES } from '@/lib/theme';
import { cn } from '@/lib/utils';

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Change theme"
                        className={cn(
                            'rounded-md border border-border bg-card text-foreground',
                            'hover:bg-accent hover:text-accent-foreground'
                        )}
                    >
                        <Palette className="h-5 w-5" />
                        <span className="sr-only">Change theme</span>
                    </Button>
                }
            />

            <DropdownMenuContent
                align="end"
                sideOffset={14}
                className={cn(
                    'w-48 border-border bg-popover text-popover-foreground shadow-sm',
                )}
            >
                {THEMES.map((t) => (
                    <DropdownMenuItem
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={cn(
                            'cursor-pointer gap-2',
                            'focus:bg-accent focus:text-accent-foreground'
                        )}
                    >
                        <span
                            className="inline-block h-4 w-4 shrink-0 rounded-full ring-1 ring-border"
                            style={{
                                background: t.swatch,
                            }}
                        />

                        <span>{t.label}</span>

                        {theme === t.value && (
                            <Check className="ml-auto h-4 w-4 text-primary" />
                        )}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
