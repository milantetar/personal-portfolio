import { useCallback, useEffect, useRef, useState } from 'react';

import type { MediaUploadData, MediaUploadResponse } from '@/types/media';

interface UseMediaUploadOptions {
    endpoint?: string;
}

interface UseMediaUploadResult {
    error: string | null;
    isUploading: boolean;
    previewUrl: string | null;
    upload: (file: File, metadata?: { alt_text?: string; title?: string; usage?: string }) => Promise<MediaUploadData | null>;
    clearPreview: () => void;
}

const getCsrfToken = (): string =>
    document.querySelector<HTMLMetaElement>('meta[name="csrf-token"]')?.content ?? '';

export function useMediaUpload({ endpoint = '/dashboard/media' }: UseMediaUploadOptions = {}): UseMediaUploadResult {
    const [error, setError] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const previewUrlRef = useRef<string | null>(null);

    const clearPreview = useCallback(() => {
        setPreviewUrl((currentUrl) => {
            if (currentUrl?.startsWith('blob:')) {
                URL.revokeObjectURL(currentUrl);
            }

            return null;
        });
        previewUrlRef.current = null;
        setError(null);
    }, []);

    const upload = useCallback(async (file: File, metadata: { alt_text?: string; title?: string; usage?: string } = {}): Promise<MediaUploadData | null> => {
        const temporaryPreviewUrl = URL.createObjectURL(file);
        previewUrlRef.current = temporaryPreviewUrl;
        setPreviewUrl(temporaryPreviewUrl);
        setError(null);
        setIsUploading(true);

        const formData = new FormData();
        formData.append('file', file);
        if (metadata.title) formData.append('title', metadata.title);
        if (metadata.alt_text) formData.append('alt_text', metadata.alt_text);
        if (metadata.usage) formData.append('usage', metadata.usage);

        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                },
                body: formData,
            });
            const result = (await response.json()) as MediaUploadResponse;

            if (!response.ok || !result.success || !result.data) {
                const validationMessage = result.errors
                    ? Object.values(result.errors).flat().join(' ')
                    : null;

                throw new Error(validationMessage || result.message || 'Upload failed.');
            }

            URL.revokeObjectURL(temporaryPreviewUrl);
            previewUrlRef.current = result.data.url;
            setPreviewUrl(result.data.url);

            return result.data;
        } catch (caughtError: unknown) {
            const message = caughtError instanceof Error ? caughtError.message : 'Upload failed.';
            URL.revokeObjectURL(temporaryPreviewUrl);
            previewUrlRef.current = null;
            setPreviewUrl(null);
            setError(message);

            return null;
        } finally {
            setIsUploading(false);
        }
    }, [endpoint]);

    useEffect(() => () => {
        if (previewUrlRef.current?.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrlRef.current);
        }
    }, []);

    return { error, isUploading, previewUrl, upload, clearPreview };
}
