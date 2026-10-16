import { Head, usePage } from '@inertiajs/react';
import { Navbar } from '@/components/navbar/navbar';
import { GlassCard } from '@/components/glass-card';
import type { PageProps } from '@/types';

const FALLBACK_BG =
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1920&q=80';

export default function Dashboard() {
    const { auth, backgroundImage } = usePage<PageProps>().props;
    const bgUrl = backgroundImage?.url ?? FALLBACK_BG;

    return (
        <>
            <Head title="Admin Dashboard" />

            <div className="relative min-h-screen w-full">
                {/* Background image */}
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{ backgroundImage: `url(${bgUrl})` }}
                    aria-hidden="true"
                />

                {/* Scrim for text contrast */}
                <div className="absolute inset-0 bg-black/30 dark:bg-black/50" aria-hidden="true" />

                {/* Content */}
                <div className="relative z-10 flex min-h-screen flex-col">
                    <Navbar />
                </div>
            </div>
        </>
    );
}