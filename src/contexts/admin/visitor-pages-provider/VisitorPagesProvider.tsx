import { createContext, useContext, useMemo, useState } from 'react';
import { VisitorPage } from '../../../types/admin/faq';
import { useOnMountUnsafe } from '../../../hooks/common/use-on-mount-unsafe/useOnMountUnsafe';
import { FaqApi } from '../../../services/api/admin/faq/faq-api';
import { useAdminClient } from '../../../hooks/admin/use-admin-client/useAdminClient';

type Props = {
    children: React.ReactNode;
};

export interface VisitorPagesContextState {
    pages: VisitorPage[];
    isLoading: boolean;
    error: unknown | null;
}

const VisitorPagesContext = createContext<VisitorPagesContextState | undefined>(undefined);

export function VisitorPagesProvider({ children }: Props) {
    const client = useAdminClient();
    const [pages, setPages] = useState<VisitorPage[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<unknown | null>(null);

    useOnMountUnsafe(() => {
        (async () => {
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
        })();
    });

    const value = useMemo(() => ({ pages, isLoading, error }), [pages, isLoading, error]);

    return <VisitorPagesContext.Provider value={value}>{children}</VisitorPagesContext.Provider>;
}

export function useVisitorPages(): VisitorPagesContextState {
    const ctx = useContext(VisitorPagesContext);
    if (!ctx) throw new Error('useVisitorPages must be used within <VisitorPagesProvider>');
    return ctx;
}
