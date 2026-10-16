import '../css/app.css';

import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { ThemeProvider } from '@/components/theme-provider';

const appName = import.meta.env.VITE_APP_NAME || 'Laravel';

createInertiaApp({
    title: (title) => (title ? `${title} - ${appName}` : appName),
    resolve: (name): any => {
        const pages = import.meta.glob('./pages/**/*.tsx', { eager: false });
        const importer = pages[`./pages/${name}.tsx`];
        
        if (!importer) {
            throw new Error(`Page not found: ${name}`);
        }
        
        return importer();
    },
    setup({ el, App, props }) {
        createRoot(el).render(
            <ThemeProvider defaultMode="system" defaultColorScheme="default">
                <App {...props} />
            </ThemeProvider>
        );
    },
    progress: {
        color: '#4B5563',
    },
});