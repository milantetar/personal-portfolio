import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from 'react';
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
        if (typeof window !== 'undefined') {
            try {
                const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
                if (stored && VALID_THEMES.includes(stored as Theme)) {
                    return stored as Theme;
                }
            } catch {
                // Storage may be unavailable; use the site's default theme.
            }
            const siteDefault = document.documentElement.dataset.defaultTheme;
            if (siteDefault && VALID_THEMES.includes(siteDefault as Theme)) {
                return siteDefault as Theme;
            }
        }
        return defaultTheme;
    });

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

            document
                .querySelector('meta[name="theme-color"]')
                ?.setAttribute(
                    'content',
                    mode === 'dark' ? '#151c1a' : '#f8f6f1',
                );
        };

        apply();

        // React to OS theme changes only in system mode
        if (theme !== 'system') return;

        const mql = window.matchMedia('(prefers-color-scheme: dark)');
        mql.addEventListener('change', apply);

        return () => mql.removeEventListener('change', apply);
    }, [theme]);

    const setTheme = useCallback((next: Theme) => {
        // Update React state even if storage is unavailable.
        setThemeState(next);

        if (typeof window !== 'undefined') {
            try {
                localStorage.setItem(THEME_STORAGE_KEY, next);
            } catch {
                // Storage may be blocked or unavailable.
            }
        }
    }, []);

    const value: ThemeProviderState = { theme, setTheme };

    return (
        <ThemeProviderContext.Provider value={value}>
            {children}
        </ThemeProviderContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeProviderContext);
