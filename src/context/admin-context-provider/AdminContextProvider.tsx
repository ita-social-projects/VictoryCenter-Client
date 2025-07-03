import React, {
    createContext,
    useContext,
    useMemo,
    ReactNode,
    useState,
    useCallback,
    useRef,
} from 'react';
import {
    loginRequest,
    tokenRefreshRequest,
} from '../../services/data-fetch/login-page-data-fetch/login-page-data-fetch';
import { AuthService } from '../../services/auth/AuthService';
import { CreateAdminClient } from '../../services/auth/createAdminClient';
import { AxiosInstance } from 'axios';
import { useOnMountUnsafe } from '../../utils/hooks/useOnMountUnsafe';
import { Credentials } from '../../types/Auth';
import { apiBase } from '../../const/urls/main-api';

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

const AdminContext = createContext<ContextType | undefined>(undefined);

export const AdminContextProvider = ({ children }: Props) => {
    const [token, setToken] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const isAuthenticated = AuthService.isAccessTokenValid(token);

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
        [updateToken]
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
                if (!tokenRef.current) await refreshAccessToken();
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
                apiBase,
                () => AuthService.isAccessTokenValid(tokenRef.current),
                () => tokenRef.current,
                refreshAccessToken,
                logout
            ),
        [logout, refreshAccessToken]
    );

    const contextValue = useMemo(
        () => ({ client, isAuthenticated, isLoading, login, logout, refreshAccessToken }),
        [client, isAuthenticated, isLoading, login, logout, refreshAccessToken]
    );

    return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => useContext(AdminContext) as ContextType;
