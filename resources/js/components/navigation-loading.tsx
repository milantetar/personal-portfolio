import { router } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { useEffect, useState } from 'react';

export function NavigationLoading() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        let pending = 0;
        let timer: ReturnType<typeof setTimeout> | undefined;
        const stopStart = router.on('start', () => {
            pending += 1;
            if (pending === 1) {
                timer = setTimeout(() => setVisible(true), 180);
            }
        });
        const stopFinish = router.on('finish', () => {
            pending = Math.max(0, pending - 1);
            if (pending === 0) {
                clearTimeout(timer);
                setVisible(false);
            }
        });

        return () => {
            stopStart();
            stopFinish();
            clearTimeout(timer);
        };
    }, []);

    return (
        <div role="status" aria-live="polite" aria-atomic="true">
            {visible ? (
                <div className="pointer-events-none fixed right-4 bottom-4 z-[100] flex max-w-[calc(100vw-2rem)] items-center gap-2 rounded-lg border border-border bg-popover px-4 py-3 text-sm font-medium text-popover-foreground shadow-sm">
                    <LoaderCircle
                        aria-hidden="true"
                        className="size-4 animate-spin motion-reduce:animate-none"
                    />
                    Loading…
                </div>
            ) : null}
        </div>
    );
}
