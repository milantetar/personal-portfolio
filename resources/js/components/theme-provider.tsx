import { createContext, useContext, useEffect, useState } from 'react';
import { type Theme, THEME_STORAGE_KEY, resolveTheme } from '@/lib/theme';

interface ThemeProviderState {
    theme: Theme;
    setTheme: (theme: Theme) => void;
}

const ThemeProviderContext = createContext<ThemeProviderState>({
    theme: 'system',
    setTheme: () => null,
});

interface ThemeProviderProps {
    children: React.ReactNode;
    defaultTheme?: Theme;
}

const VALID_THEMES: Theme[] = [
    'light',
    'dark',
    'instagram',
    'discord',
    'system',
];

export function ThemeProvider({
    children,
    defaultTheme = 'system',
}: ThemeProviderProps) {
    const [theme, setThemeState] = useState<Theme>(() => {
        // Keep the first render identical on the server and in the browser.
        return defaultTheme;
    });

    useEffect(() => {
        try {
            const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

            if (storedTheme && VALID_THEMES.includes(storedTheme as Theme)) {
                setThemeState(storedTheme as Theme);
            }
        } catch {
            // Storage may be unavailable; use the configured default theme.
        }
    }, []);

    // Apply theme whenever it changes
    useEffect(() => {
        const root = document.documentElement;

        const apply = () => {
            const prefersDark = window.matchMedia(
                '(prefers-color-scheme: dark)',
            ).matches;

            const { mode, dataTheme } = resolveTheme(theme, prefersDark);

            root.classList.remove('light', 'dark');
            root.classList.add(mode);

            if (dataTheme) {
                root.setAttribute('data-theme', dataTheme);
            } else {
                root.removeAttribute('data-theme');
            }
        };

        apply();

        // React to OS theme changes only in system mode
        if (theme !== 'system') return;

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', apply);

        return () => mql.removeEventListener('change', apply);
    }, [theme]);

    const value: ThemeProviderState = {
        theme,
        setTheme: (next) => {
            // Update React state even if storage is unavailable
            setThemeState(next);

            if (typeof window !== 'undefined') {
                try {
                    localStorage.setItem(THEME_STORAGE_KEY, next);
                } catch {
                    // Storage may be blocked or unavailable
                }
            }
        },
    };

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeProviderContext);
