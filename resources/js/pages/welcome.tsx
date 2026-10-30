import { Head, Link } from '@inertiajs/react';
import { House } from 'lucide-react';

import { Button } from '@/components/ui/button';

export default function Welcome() {
    return (
        <>
            <Head title="Page not found" />
            <main className="grid min-h-dvh place-items-center bg-background px-5 text-foreground">
                <section className="w-full max-w-xl border-y border-border py-10 sm:py-14" aria-labelledby="not-found-title">
                    <p className="eyebrow mb-4">404 / Not found</p>
                    <h1 id="not-found-title" className="font-display text-5xl font-medium tracking-tight sm:text-6xl">This page is unavailable.</h1>
                    <p className="mt-5 max-w-md text-sm leading-6 text-muted-foreground">The address may have changed, or the page may have been removed.</p>
                    <Button asChild className="mt-7"><Link href="/"><House className="size-4" />Return to portfolio</Link></Button>
                </section>
            </main>
        </>
    );
}
