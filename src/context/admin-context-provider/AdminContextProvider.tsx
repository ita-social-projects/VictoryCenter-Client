import React, {
    createContext,
    useContext,
    useMemo,
    ReactNode,
    useState,
    useEffect,
    useCallback,
} from 'react';
import { Credentials } from '../../types/AdminContext';
import {
    loginRequest,
    tokenRefreshRequest,
} from '../../services/data-fetch/login-page-data-fetch/login-page-data-fetch';
import { AuthService } from '../../services/authService';
import { CreateAdminClient } from '../../services/apiClients/createAdminClient';
import { AxiosInstance } from 'axios';

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

    const login = useCallback(async (creds: Credentials) => {
        const data = await loginRequest(creds);
        setToken(data);
    }, []);

    const logout = useCallback(() => {
        setToken('');
    }, []);

    const refreshAccessToken = useCallback(async () => {
        const data = await tokenRefreshRequest(token);
        setToken(data);
    }, [token]);

    useEffect(() => {
          // eslint-disable-next-line no-console
          console.log('Here is our token', token);
    }, [token]);

    // silent refresh on mount
    useEffect(() => {
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
                '',
                () => isAuthenticated,
                () => token,
                refreshAccessToken,
                logout
            ),
        [isAuthenticated, token, refreshAccessToken, logout]
    );

    const contextValue = useMemo(
        () => ({ client, isAuthenticated, isLoading, login, logout, refreshAccessToken }),
        [client, isAuthenticated, isLoading, login, logout, refreshAccessToken]
    );

    return <AdminContext.Provider value={contextValue}>{children}</AdminContext.Provider>;
};

export const useAdminContext = () => useContext(AdminContext) as ContextType;
