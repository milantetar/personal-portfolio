import '../css/app.css';
import '@fontsource-variable/geist';
import '@fontsource-variable/newsreader/wght.css';
import '@fontsource/ibm-plex-mono/400.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import type { ComponentType } from 'react';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from 'sonner';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name) => {
        const pages = import.meta.glob<{ default: ComponentType }>('./pages/**/*.tsx', { eager: false });
        const importer = pages[`./pages/${name}.tsx`];
        
        if (!importer) {
            throw new Error(`Page not found: ${name}`);
        }
        
        return importer().then((module) => module.default);
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider defaultTheme="dark">
                <App {...props} />
                <Toaster position="bottom-right" richColors /> 
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});
