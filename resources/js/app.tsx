import '../css/app.css';
import '@fontsource-variable/geist';
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource/ibm-plex-mono/400.css';

import { config, createInertiaApp, router } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { NavigationLoading } from '@/components/navigation-loading';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

// Keep hover prefetches quick without holding mutable portfolio pages for long.
config.set('prefetch.cacheFor', 5_000);

// A saved edit must not be followed by a prefetched copy of an older page.
const stopClearingPrefetch = router.on('finish', ({ detail: { visit } }) => {
    if (visit.method !== 'get') router.flushAll();
});
import.meta.hot?.dispose(stopClearingPrefetch);

void createInertiaApp({
    title: (title) => title || appName,
    resolve: (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>(
            './pages/**/*.tsx',
            { eager: false },
        );
        const importer = pages[`./pages/${name}.tsx`];

        if (!importer) {
            throw new Error(`Page not found: ${name}`);
        }

        return importer().then((module) => module.default);
    },
    withApp: (app) => (
        <ThemeProvider defaultTheme="dark">
            {app}
            <NavigationLoading />
            <Toaster position="bottom-right" richColors closeButton />
        </ThemeProvider>
    ),
    progress: {
        color: '#7c9f97',
        delay: 100,
        showSpinner: false,
    },
});
