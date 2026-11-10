import { AxiosInstance, CanceledError } from 'axios';
import { createContext, useContext, useMemo, ReactNode, useState, useCallback, useRef } from 'react';
import { loginRequest, tokenRefreshRequest, logoutRequest } from '@/services/api/admin/login/login-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { Credentials } from '@/types/admin/auth';
import { isAccessTokenValid } from '@/services/auth/auth-service/auth-service';
import { CreateAdminClient } from '@/services/auth/create-admin-client/create-admin-client';
import { useOnMountUnsafe } from '@/hooks/common/use-on-mount-unsafe/useOnMountUnsafe';

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
    const logoutCountRef = useRef<number>(0);

    const updateToken = useCallback((newToken: string) => {
        tokenRef.current = newToken;
        setToken(newToken);
    }, []);

    const login = useCallback(
        async (creds: Credentials) => {
            const logoutCount = logoutCountRef.current;
            const newToken = await loginRequest(creds);
            if (logoutCount === logoutCountRef.current) {
                updateToken(newToken);
            }
        },
        [updateToken],
    );

    // local sign-out happens immediately; server-side logout is best effort and runs in the background
    const logout = useCallback(() => {
        logoutCountRef.current += 1;
        const currentToken = tokenRef.current;
        updateToken('');

        if (!currentToken) {
            return;
        }

        void (async () => {
            // an expired access token would be rejected by the logout endpoint, leaving the refresh token unrevoked
            const logoutToken = isAccessTokenValid(currentToken) ? currentToken : await tokenRefreshRequest();
            await logoutRequest(logoutToken);
        })().catch((error: unknown) => {
            // eslint-disable-next-line no-console -- Required diagnostic for a failed best-effort logout request.
            console.error('Server-side logout failed:', error);
        });
    }, [updateToken]);

    const refreshAccessToken = useCallback(async () => {
        const logoutCount = logoutCountRef.current;
        const [refresh] = await Promise.allSettled([tokenRefreshRequest()]);
        if (logoutCount !== logoutCountRef.current) {
            throw new CanceledError('Session ended during token refresh');
        }
        if (refresh.status === 'rejected') {
            // the session can't be renewed, so end it locally; a following logout() then has no token to revoke
            updateToken('');
            throw refresh.reason;
        }
        updateToken(refresh.value);
    }, [updateToken]);

    // silent refresh on mount
    useOnMountUnsafe(() => {
        (async () => {
            if (window.location.pathname.startsWith('/admin')) {
                try {
                    await refreshAccessToken();
                } catch {
                    updateToken('');
                } finally {
                    setIsLoading(false);
                }
            } else {
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
