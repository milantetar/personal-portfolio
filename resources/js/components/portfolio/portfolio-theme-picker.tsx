import { useState } from 'react';
import { Check, Palette } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export type PortfolioTheme = 'midnight' | 'forest' | 'ocean' | 'instagram';

interface PortfolioThemePickerProps {
    value: PortfolioTheme;
    onChange: (theme: PortfolioTheme) => void;
}

const themes: { value: PortfolioTheme; label: string; swatch: string }[] = [
    { value: 'midnight', label: 'Graphite', swatch: 'var(--portfolio-theme-midnight)' },
    { value: 'forest', label: 'Forest', swatch: 'var(--portfolio-theme-forest)' },
    { value: 'ocean', label: 'Ocean', swatch: 'var(--portfolio-theme-ocean)' },
    { value: 'instagram', label: 'Warm slate', swatch: 'var(--portfolio-theme-warm)' },
];

export function PortfolioThemePicker({ value, onChange }: PortfolioThemePickerProps) {
    const [open, setOpen] = useState(false);

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger
                render={
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Choose portfolio theme"
                        title="Choose portfolio theme"
                        className="size-10 rounded-md border border-border bg-card text-foreground hover:bg-accent"
                    >
                        <Palette className="size-4" aria-hidden="true" />
                    </Button>
                }
            />
            <DropdownMenuContent align="end" sideOffset={8} className="w-48 border-border bg-popover p-1 text-popover-foreground">
                <p className="px-2 py-1.5 text-xs font-medium text-muted-foreground">Portfolio theme</p>
                {themes.map((theme) => (
                    <DropdownMenuItem
                        key={theme.value}
                        onClick={() => {
                            onChange(theme.value);
                            setOpen(false);
                        }}
                        aria-current={value === theme.value ? 'true' : undefined}
                        className="min-h-10 cursor-pointer gap-2 focus:bg-accent focus:text-accent-foreground"
                    >
                        <span className="size-3 rounded-full border border-foreground/20" style={{ backgroundColor: theme.swatch }} aria-hidden="true" />
                        <span>{theme.label}</span>
                        {value === theme.value ? <Check className="ml-auto size-4" aria-hidden="true" /> : null}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
