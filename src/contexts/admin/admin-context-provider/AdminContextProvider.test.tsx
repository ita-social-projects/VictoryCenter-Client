import '@testing-library/jest-dom';
import { CanceledError } from 'axios';
import { act, render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useAdminContext, AdminContextProvider } from './AdminContextProvider';
import { loginRequest, tokenRefreshRequest, logoutRequest } from '@/services/api/admin/login/login-api';
import { isAccessTokenValid } from '@/services/auth/auth-service/auth-service';
import { CreateAdminClient } from '@/services/auth/create-admin-client/create-admin-client';

jest.mock('@/services/api/admin/login/login-api', () => ({
    loginRequest: jest.fn(),
    logoutRequest: jest.fn(),
    tokenRefreshRequest: jest.fn(),
}));
jest.mock('@/services/auth/auth-service/auth-service', () => ({
    isAccessTokenValid: jest.fn(),
}));
jest.mock('@/services/auth/create-admin-client/create-admin-client', () => ({
    CreateAdminClient: jest.fn(),
}));
jest.mock('@/const/common/api-routes/main-api', () => ({
    API_ROUTES: { BASE: '/base' },
}));

const loginRequestMock = loginRequest as jest.Mock<Promise<string>, [any]>;
const logoutRequestMock = logoutRequest as unknown as jest.Mock<Promise<void>, [string]>;
const tokenRefreshMock = tokenRefreshRequest as jest.Mock<Promise<string>, []>;
const isValidMock = isAccessTokenValid as jest.Mock<boolean, [string]>;
const CreateAdminClientMock = CreateAdminClient as jest.Mock<any, any>;

const Consumer = () => {
    const { isLoading, isAuthenticated, client, login, logout, refreshAccessToken } = useAdminContext();

    return (
        <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <span data-testid="auth">{String(isAuthenticated)}</span>
            <span data-testid="client-marker">{(client as any)?.marker}</span>

            <button data-testid="login-btn" onClick={() => login({ email: 'e', password: 'p' })}>
                login
            </button>
            <button data-testid="logout-btn" onClick={logout}>
                logout
            </button>
            <button data-testid="refresh-btn" onClick={refreshAccessToken}>
                refresh
            </button>
        </div>
    );
};

let ctx: ReturnType<typeof useAdminContext>;
const Capture = () => {
    ctx = useAdminContext();
    return null;
};

const deferred = <T,>() => {
    let resolve!: (value: T) => void;
    let reject!: (reason: unknown) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
};

const renderWithCapture = () =>
    render(
        <AdminContextProvider>
            <Capture />
            <Consumer />
        </AdminContextProvider>,
    );

const renderSignedIn = async () => {
    renderWithCapture();
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));
};

const getClientToken = () => CreateAdminClientMock.mock.calls[0][2]();

const expectSignedOut = () => {
    expect(screen.getByTestId('auth')).toHaveTextContent('false');
    expect(getClientToken()).toBe('');
};

const startPendingRefresh = () => {
    const refresh = deferred<string>();
    tokenRefreshMock.mockReturnValueOnce(refresh.promise);
    return { refresh, refreshPromise: ctx.refreshAccessToken() };
};

describe('<AdminContextProvider />', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        Object.defineProperty(window, 'location', {
            value: { pathname: '/admin' },
            writable: true,
        });

        loginRequestMock.mockResolvedValue('login_token');
        logoutRequestMock.mockResolvedValue(undefined);
        tokenRefreshMock.mockResolvedValue('initial_token');

        isValidMock.mockImplementation((t: string) => t === 'initial_token' || t === 'login_token');
        CreateAdminClientMock.mockReturnValue({ marker: 'FAKE_CLIENT' });
    });

    it('on silent-refresh on mount: loading toggles, auth=true, client.marker set', async () => {
        render(
            <AdminContextProvider>
                <Consumer />
            </AdminContextProvider>,
        );

        expect(screen.getByTestId('loading')).toHaveTextContent('true');
        expect(tokenRefreshMock).toHaveBeenCalledTimes(1);

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

        expect(screen.getByTestId('auth')).toHaveTextContent('true');
        expect(screen.getByTestId('client-marker')).toHaveTextContent('FAKE_CLIENT');

        const [, isAuthChecker, getTokenFn] = CreateAdminClientMock.mock.calls[0];

        expect(getTokenFn()).toBe('initial_token');
        expect(isAuthChecker()).toBe(true);

        expect(CreateAdminClientMock).toHaveBeenCalledWith(
            '/base',
            expect.any(Function),
            expect.any(Function),
            expect.any(Function),
            expect.any(Function),
        );
    });

    it('on mount failure: loading=false and auth=false', async () => {
        tokenRefreshMock.mockRejectedValueOnce(new Error('fail'));
        isValidMock.mockReturnValue(false);

        render(
            <AdminContextProvider>
                <Consumer />
            </AdminContextProvider>,
        );

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));
        expect(screen.getByTestId('auth')).toHaveTextContent('false');
        expect(logoutRequestMock).not.toHaveBeenCalled();
    });

    it('login() calls loginRequest and flips auth to true', async () => {
        render(
            <AdminContextProvider>
                <Consumer />
            </AdminContextProvider>,
        );

        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

        fireEvent.click(screen.getByTestId('login-btn'));
        await waitFor(() =>
            expect(loginRequestMock).toHaveBeenCalledWith({
                email: 'e',
                password: 'p',
            }),
        );
        expect(screen.getByTestId('auth')).toHaveTextContent('true');
    });

    it('logout() resets auth to false', async () => {
        render(
            <AdminContextProvider>
                <Consumer />
            </AdminContextProvider>,
        );
        await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));

        fireEvent.click(screen.getByTestId('logout-btn'));

        await waitFor(() => expect(logoutRequestMock).toHaveBeenCalledTimes(1));

        isValidMock.mockImplementation(() => false);

        await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'));

        const [, isAuthCheckerFail, getTokenFnFail] = CreateAdminClientMock.mock.calls[0];
        expect(getTokenFnFail()).toBe('');
        expect(isAuthCheckerFail()).toBe(false);
    });

    it('logout() does not call logoutRequest when there is no access token', async () => {
        tokenRefreshMock.mockRejectedValueOnce(new Error('fail'));
        isValidMock.mockReturnValue(false);

        renderWithCapture();
        await waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

        await act(async () => {
            await expect(ctx.logout()).resolves.toBeUndefined();
        });
        expect(logoutRequestMock).not.toHaveBeenCalled();
    });

    it('logout() clears the session without rejecting when logoutRequest fails', async () => {
        logoutRequestMock.mockRejectedValueOnce(new Error('logout failed'));
        await renderSignedIn();

        await act(async () => {
            await expect(ctx.logout()).resolves.toBeUndefined();
        });

        expect(logoutRequestMock).toHaveBeenCalledWith('initial_token');
        expectSignedOut();
    });

    it('logout() with an expired access token refreshes it before calling logoutRequest', async () => {
        await renderSignedIn();
        isValidMock.mockReturnValue(false);
        tokenRefreshMock.mockResolvedValueOnce('fresh_token');

        await act(async () => {
            await ctx.logout();
        });

        expect(tokenRefreshMock).toHaveBeenCalledTimes(2);
        expect(logoutRequestMock).toHaveBeenCalledWith('fresh_token');
        expectSignedOut();
    });

    it('logout() with an expired access token signs out locally when the refresh fails', async () => {
        await renderSignedIn();
        isValidMock.mockReturnValue(false);
        tokenRefreshMock.mockRejectedValueOnce(new Error('refresh failed'));

        await act(async () => {
            await expect(ctx.logout()).resolves.toBeUndefined();
        });

        expect(logoutRequestMock).not.toHaveBeenCalled();
        expectSignedOut();
    });

    it('refresh that resolves after logout() rejects and does not restore the session', async () => {
        await renderSignedIn();
        const { refresh, refreshPromise } = startPendingRefresh();

        await act(async () => {
            await ctx.logout();
        });
        await act(async () => {
            refresh.resolve('initial_token');
            await expect(refreshPromise).rejects.toThrow(CanceledError);
        });

        expectSignedOut();
    });

    it('refresh that fails after logout() and a new login rejects as cancelled and keeps the new session', async () => {
        await renderSignedIn();
        const { refresh, refreshPromise } = startPendingRefresh();

        await act(async () => {
            await ctx.logout();
            await ctx.login({ email: 'e', password: 'p' });
        });
        await act(async () => {
            refresh.reject(new Error('refresh failed'));
            await expect(refreshPromise).rejects.toThrow(CanceledError);
        });

        expect(screen.getByTestId('auth')).toHaveTextContent('true');
        expect(getClientToken()).toBe('login_token');
    });

    it('refresh that fails without a logout rejects with the original error', async () => {
        await renderSignedIn();
        const error = new Error('refresh failed');
        tokenRefreshMock.mockRejectedValueOnce(error);

        await act(async () => {
            await expect(ctx.refreshAccessToken()).rejects.toBe(error);
        });

        expect(getClientToken()).toBe('initial_token');
    });

    it('refresh that resolves while logoutRequest is pending does not restore the session', async () => {
        await renderSignedIn();

        const logoutResponse = deferred<void>();
        logoutRequestMock.mockReturnValueOnce(logoutResponse.promise);
        const { refresh, refreshPromise } = startPendingRefresh();

        await act(async () => {
            const logoutPromise = ctx.logout();

            refresh.resolve('initial_token');
            await expect(refreshPromise).rejects.toThrow(CanceledError);
            expect(getClientToken()).toBe('');

            logoutResponse.resolve();
            await logoutPromise;
        });

        expectSignedOut();
    });

    it('login that resolves after logout() does not restore the session', async () => {
        await renderSignedIn();

        const loginResponse = deferred<string>();
        loginRequestMock.mockReturnValueOnce(loginResponse.promise);
        const loginPromise = ctx.login({ email: 'e', password: 'p' });

        await act(async () => {
            await ctx.logout();
            loginResponse.resolve('login_token');
            await loginPromise;
        });

        expectSignedOut();
    });
});
