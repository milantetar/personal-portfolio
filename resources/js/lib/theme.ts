
export type Theme =
    | 'light'
    | 'dark'
    | 'instagram'
    | 'discord'
    | 'system';

export interface ThemeOption {
    value: Theme;
    label: string;
    /** Hex swatch shown in the dropdown */
    swatch: string;
    /** Optional second color for a gradient swatch */
    swatchSecondary?: string;
}

export const THEMES: ThemeOption[] = [
    {
        value: 'light',
        label: 'Light',
        swatch: '#F8FAFC',
    },
    {
        value: 'dark',
        label: 'Dark',
        swatch: '#0B1120',
    },
    {
        value: 'instagram',
        label: 'Instagram',
        swatch: '#EE2A7B',
        swatchSecondary: '#6228D7',
    },
    {
        value: 'discord',
        label: 'Discord',
        swatch: '#5865F2',
    },
    {
        value: 'system',
        label: 'System',
        swatch: '#94A3B8',
    },
];

export const THEME_STORAGE_KEY = 'portfolio-theme';

/**
 * Maps a theme choice to:
 * - the `.light` / `.dark` class to apply on <html>
 * - the `data-theme` attribute value (or null to remove it)
 */
export function resolveTheme(
    theme: Theme,
    systemPrefersDark: boolean,
) {
    switch (theme) {
        case 'light':
            return { mode: 'light' as const, dataTheme: null };

        case 'dark':
            return { mode: 'dark' as const, dataTheme: null };

        case 'instagram':
            return {
                mode: 'dark' as const,
                dataTheme: 'instagram',
            };

        case 'discord':
            return {
                mode: 'dark' as const,
                dataTheme: 'discord',
            };

        case 'system':
            return {
                mode: systemPrefersDark ? ('dark' as const) : ('light' as const),
                dataTheme: null,
            };
    }
}
