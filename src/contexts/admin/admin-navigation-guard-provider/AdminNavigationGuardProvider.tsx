import { createContext, useContext, useMemo, useState, ReactNode } from 'react';

interface AdminNavigationGuardContextValue {
    isBlocked: boolean;
    blockMessage: string | null;
    setBlocked: (blocked: boolean, message?: string) => void;
}

const AdminNavigationGuardContext = createContext<AdminNavigationGuardContextValue>({
    isBlocked: false,
    blockMessage: null,
    setBlocked: () => {},
});

export const AdminNavigationGuardProvider = ({ children }: { children: ReactNode }) => {
    const [isBlocked, setIsBlocked] = useState(false);
    const [blockMessage, setBlockMessage] = useState<string | null>(null);

    const setBlocked = (blocked: boolean, message?: string) => {
        setIsBlocked(blocked);
        setBlockMessage(blocked ? (message ?? null) : null);
    };

    const value = useMemo(() => ({ isBlocked, blockMessage, setBlocked }), [isBlocked, blockMessage]);

    return <AdminNavigationGuardContext.Provider value={value}>{children}</AdminNavigationGuardContext.Provider>;
};

export const useAdminNavigationGuard = () => useContext(AdminNavigationGuardContext);
