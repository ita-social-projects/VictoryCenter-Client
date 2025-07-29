import { createContext, useContext, useMemo, ReactNode, useState, useCallback, useRef } from 'react';
import { loginRequest, tokenRefreshRequest } from '../../services/api/admin/login/login-api';
import { AxiosInstance } from 'axios';
import { useOnMountUnsafe } from '../../hooks/common/use-on-mount-unsafe/useOnMountUnsafe';
import { API_ROUTES } from '../../const/urls/main-api';
import { Credentials } from '../../types/admin/auth';
import { isAccessTokenValid } from '../../services/auth/auth-service/auth-service';
import { CreateAdminClient } from '../../services/auth/create-admin-client/create-admin-client';

type Props = {
    children: ReactNode;
};

type ContextType = {
    client: AxiosInstance;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (creds: Credentials) => Promise<void>;
    logout: () => void;
    refreshAccessToken: () => Promise<void>;
};

export const AdminContext = createContext<ContextType | undefined>(undefined);

export const AdminContextProvider = ({ children }: Props) => {
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isAuthenticated = isAccessTokenValid(token);

    const tokenRef = useRef<string>(token);

    const updateToken = useCallback((newToken: string) => {
        tokenRef.current = newToken;
        setToken(newToken);
    }, []);

    const login = useCallback(
        async (creds: Credentials) => {
            const newToken = await loginRequest(creds);
            updateToken(newToken);
        },
        [updateToken],
    );

    const logout = useCallback(() => {
        updateToken('');
    }, [updateToken]);

    const refreshAccessToken = useCallback(async () => {
        const newToken = await tokenRefreshRequest();
        updateToken(newToken);
    }, [updateToken]);

    // silent refresh on mount
    useOnMountUnsafe(() => {
        (async () => {
            try {
                await refreshAccessToken();
            } catch {
                logout();
            } finally {
                setIsLoading(false);
            }
        })();
    });

    // axios client for admin page requests
    const client = useMemo(
        () =>
            CreateAdminClient(
                API_ROUTES.BASE,
                () => isAccessTokenValid(tokenRef.current),
                () => tokenRef.current,
                refreshAccessToken,
                logout,
            ),
        [logout, refreshAccessToken],
    );

    const contextValue = useMemo(
        () => ({ client, isAuthenticated, isLoading, login, logout, refreshAccessToken }),
        [client, isAuthenticated, isLoading, login, logout, refreshAccessToken],
    );

    return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => useContext(AdminContext) as ContextType;
