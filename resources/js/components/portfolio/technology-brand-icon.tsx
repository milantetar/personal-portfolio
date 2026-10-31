import { useEffect, useState } from 'react';
import { Code2 } from 'lucide-react';

import { automaticTechnologyIconUrl } from '@/lib/technology-icons';

type LocalBrand = 'css' | 'windows' | 'aws' | 'java';

function localBrandFor(name: string): LocalBrand | null {
    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (['css', 'css3', 'cascadingstylesheets'].includes(key)) return 'css';
    if (['windows', 'microsoftwindows'].includes(key)) return 'windows';
    if (['aws', 'amazonwebservices', 'amazonwebservicesaws'].includes(key)) return 'aws';
    if (['java', 'javaprogramming'].includes(key)) return 'java';
    return null;
}

function LocalBrandMark({ brand }: { brand: LocalBrand }) {
    if (brand === 'windows') {
        return <svg viewBox="0 0 24 24" role="img" aria-label="Windows" className="technology-brand-mark"><path fill="#0078D4" d="M2 5.2 10.5 4v7.4H2V5.2Zm10-1.4L22 2v9.4h-10V3.8ZM2 12.9h8.5v7.3L2 19v-6.1Zm10 0h10v9.3l-10-1.4v-7.9Z" /></svg>;
    }

    if (brand === 'css') {
        return <svg viewBox="0 0 24 24" role="img" aria-label="CSS" className="technology-brand-mark"><path fill="#1572B6" d="m3 2 1.6 18 7.4 2 7.4-2L21 2H3Z" /><path fill="#fff" d="M16.8 6H7.1l.2 2.2h7.1l-.4 2.5H7.6l.2 2.2h5.9l-.4 3.4-2.9.8-2.9-.8-.2-1.8H5.1l.4 3.5 4.9 1.4 4.9-1.4 1.2-8.9.3-3.1Z" /></svg>;
    }

    if (brand === 'aws') {
        return <svg viewBox="0 0 32 24" role="img" aria-label="AWS" className="technology-brand-mark technology-brand-mark--aws"><text x="2" y="15" fill="#FF9900" fontFamily="Arial, sans-serif" fontSize="14" fontWeight="700">aws</text><path d="M5 19c7 4 16 4 23-1" fill="none" stroke="#FF9900" strokeLinecap="round" strokeWidth="2" /><path d="m25 16 3 2-3 2" fill="none" stroke="#FF9900" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" /></svg>;
    }

    return <svg viewBox="0 0 24 24" role="img" aria-label="Java" className="technology-brand-mark"><path d="M12 2c-2 2-2 3 0 4m3-3c-2 2-2 3 0 4" fill="none" stroke="#ED8B00" strokeLinecap="round" strokeWidth="1.4" /><path fill="#ED8B00" d="M6 10h12l-1.2 7.5a2 2 0 0 1-2 1.7h-5.6a2 2 0 0 1-2-1.7L6 10Z" /><path fill="#fff" d="M8 12h8l-.6 4.8a1 1 0 0 1-1 .9h-4.8a1 1 0 0 1-1-.9L8 12Z" /><path d="M18 12h1.3a1.7 1.7 0 0 1 0 3.4H17" fill="none" stroke="#ED8B00" strokeLinecap="round" strokeWidth="1.5" /><path d="M5 21c4 1.3 10 1.3 14 0" fill="none" stroke="#ED8B00" strokeLinecap="round" strokeWidth="1.5" /></svg>;
}

interface TechnologyBrandIconProps {
    name: string;
    iconUrl?: string | null;
    className?: string;
}

export function TechnologyBrandIcon({ name, iconUrl, className = '' }: TechnologyBrandIconProps) {
    const [hasError, setHasError] = useState(false);
    const localBrand = !iconUrl ? localBrandFor(name) : null;
    const source = iconUrl || automaticTechnologyIconUrl(name);

    useEffect(() => setHasError(false), [source]);

    return (
        <span className={`technology-brand-icon ${className}`} aria-hidden="true">
            {localBrand ? <LocalBrandMark brand={localBrand} /> : source && !hasError ? <img src={source} alt="" loading="lazy" onError={() => setHasError(true)} /> : <Code2 className="size-4" />}
        </span>
    );
}
