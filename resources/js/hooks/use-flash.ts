import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';
import { toast } from 'sonner';

import type { PageProps } from '@/types';

interface FlashProps extends PageProps {
    flash?: {
        success?: string;
        error?: string;
    };
}

export function useFlash() {
    const { flash } = usePage<FlashProps>().props;

    useEffect(() => {
        if (flash?.success) toast.success(flash.success);
        if (flash?.error) toast.error(flash.error);
    }, [flash]);
}
