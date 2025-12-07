import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { VisitorPage } from '@app-types/admin/faq';
import { useOnMountUnsafe } from '@hooks/common/use-on-mount-unsafe/useOnMountUnsafe';
import { FaqApi } from '@api/admin/faq/faq-api';
import { useAdminClient } from '@hooks/admin/use-admin-client/useAdminClient';

// interface Props {
// }

export interface VisitorPagesContextState {
    pages: VisitorPage[];
    isLoading: boolean;
    error: unknown;
    refetchPages: () => Promise<void>;
}

const VisitorPagesContext = createContext<VisitorPagesContextState | undefined>(undefined);

export function VisitorPagesProvider({ children }: { children: React.ReactNode }) {
    const client = useAdminClient();
    const [pages, setPages] = useState<VisitorPage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown>(null);

    const refetchPages = useCallback(async () => {
        try {
            setError(null);
            setIsLoading(true);
            const pages = await FaqApi.getPages(client);
            setPages(pages);
        } catch (e: any) {
            setError(e);
        } finally {
            setIsLoading(false);
        }
    }, [client]);

    useOnMountUnsafe(() => {
        refetchPages();
    });

    const value = useMemo(() => ({ pages, isLoading, error, refetchPages }), [pages, isLoading, error, refetchPages]);

    return <VisitorPagesContext.Provider value={value}>{children}</VisitorPagesContext.Provider>;
}

export function useVisitorPages(): VisitorPagesContextState {
    const ctx = useContext(VisitorPagesContext);
    if (!ctx) throw new Error('useVisitorPages must be used within <VisitorPagesProvider>');
    return ctx;
}
