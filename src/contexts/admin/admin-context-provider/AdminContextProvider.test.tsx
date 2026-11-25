import '@testing-library/jest-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import { AxiosInstance, CanceledError } from 'axios';
import { useAdminContext, AdminContextProvider } from './AdminContextProvider';
import { loginRequest, tokenRefreshRequest, logoutRequest } from '@/services/api/admin/login/login-api';
import { isAccessTokenValid } from '@/services/auth/auth-service/auth-service';
import { CreateAdminClient } from '@/services/auth/create-admin-client/create-admin-client';
import { Credentials } from '@/types/admin/auth';
import { ADMIN_ROUTES } from '@/const/admin/routes';

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

type LogoutResponse = Awaited<ReturnType<typeof logoutRequest>>;

const loginRequestMock = loginRequest as jest.Mock<Promise<string>, [Credentials]>;
const logoutRequestMock = logoutRequest as jest.MockedFunction<typeof logoutRequest>;
const tokenRefreshMock = tokenRefreshRequest as jest.Mock<Promise<string>, []>;
const isValidMock = isAccessTokenValid as jest.Mock<boolean, [string]>;
const CreateAdminClientMock = CreateAdminClient as jest.MockedFunction<typeof CreateAdminClient>;

const fakeClient = {} as AxiosInstance;
const logoutResponse = {} as LogoutResponse;
const credentials: Credentials = { email: 'e', password: 'p' };

let consoleErrorMock: jest.SpyInstance | undefined;
let ctx: ReturnType<typeof useAdminContext>;

const Consumer = () => {
    const { isLoading, isAuthenticated, isLogoutRevocationFailed, client } = useAdminContext();
    ctx = useAdminContext();

    return (
        <div>
            <span data-testid="loading">{String(isLoading)}</span>
            <span data-testid="auth">{String(isAuthenticated)}</span>
            <span data-testid="revocation-failed">{String(isLogoutRevocationFailed)}</span>
            <span data-testid="client-marker">{String(client === fakeClient)}</span>
        </div>
    );
};

const renderProvider = () =>
    render(
        <AdminContextProvider>
            <Consumer />
        </AdminContextProvider>,
    );

const setPathname = (pathname: string) => {
    window.location.pathname = pathname;
};

const silenceConsoleError = () => {
    consoleErrorMock ??= jest.spyOn(console, 'error').mockImplementation(() => undefined);
    return consoleErrorMock;
};

const expireAccessToken = () => isValidMock.mockReturnValue(false);

const failRefreshOnMount = () => {
    tokenRefreshMock.mockRejectedValueOnce(new Error('fail'));
    expireAccessToken();
};

const failNextLogout = (error = new Error('logout failed')) => {
    silenceConsoleError();
    logoutRequestMock.mockRejectedValueOnce(error);
    return error;
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

const startPendingRefresh = () => {
    const pending = deferred<string>();
    tokenRefreshMock.mockReturnValueOnce(pending.promise);
    return { pending, refreshPromise: ctx.refreshAccessToken() };
};

const waitForLoaded = () => waitFor(() => expect(screen.getByTestId('loading')).toHaveTextContent('false'));

const renderSignedIn = async () => {
    renderProvider();
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));
};

const renderSignedOut = async () => {
    failRefreshOnMount();
    renderProvider();
    await waitForLoaded();
};

const triggerLogout = () =>
    act(async () => {
        ctx.logout();
    });

const triggerLogin = () =>
    act(async () => {
        await ctx.login(credentials);
    });

const failRefreshManually = async (error = new Error('refresh failed')) => {
    tokenRefreshMock.mockRejectedValueOnce(error);
    await act(async () => {
        await expect(ctx.refreshAccessToken()).rejects.toBe(error);
    });
};

const settleAsCancelled = (settle: () => void, refreshPromise: Promise<void>) =>
    act(async () => {
        settle();
        await expect(refreshPromise).rejects.toThrow(CanceledError);
    });

const expectAuth = (value: boolean) => expect(screen.getByTestId('auth')).toHaveTextContent(String(value));
const expectRevocationFailed = (value: boolean) =>
    expect(screen.getByTestId('revocation-failed')).toHaveTextContent(String(value));
const getClientToken = () => CreateAdminClientMock.mock.calls[0][2]();

const expectSignedOut = () => {
    expectAuth(false);
    expect(getClientToken()).toBe('');
};

describe('<AdminContextProvider />', () => {
    beforeEach(() => {
        jest.clearAllMocks();

        Object.defineProperty(window, 'location', {
            value: { pathname: ADMIN_ROUTES.LOGIN.FULL },
            writable: true,
        });

        loginRequestMock.mockResolvedValue('login_token');
        logoutRequestMock.mockResolvedValue(logoutResponse);
        tokenRefreshMock.mockResolvedValue('initial_token');

        isValidMock.mockImplementation((t: string) => t === 'initial_token' || t === 'login_token');
        CreateAdminClientMock.mockReturnValue(fakeClient);
    });

    afterEach(() => {
        consoleErrorMock?.mockRestore();
        consoleErrorMock = undefined;
    });

    describe('silent refresh on mount', () => {
        it('toggles loading, sets auth=true and wires the client', async () => {
            renderProvider();

            expect(screen.getByTestId('loading')).toHaveTextContent('true');
            expect(tokenRefreshMock).toHaveBeenCalledTimes(1);

            await waitForLoaded();

            expectAuth(true);
            expect(screen.getByTestId('client-marker')).toHaveTextContent('true');

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

        it('on failure: finishes loading, stays signed out, handles the rejection and does not call logoutRequest', async () => {
            const unhandled = jest.fn();
            process.on('unhandledRejection', unhandled);

            await renderSignedOut();

            expectAuth(false);
            expect(logoutRequestMock).not.toHaveBeenCalled();

            await new Promise((resolve) => setTimeout(resolve, 0));
            process.off('unhandledRejection', unhandled);
            expect(unhandled).not.toHaveBeenCalled();
        });

        it.each([ADMIN_ROUTES.ROOT, ADMIN_ROUTES.LOGIN.FULL])('runs on admin path %s', async (path) => {
            setPathname(path);
            renderProvider();

            await waitForLoaded();

            expect(tokenRefreshMock).toHaveBeenCalledTimes(1);
            expectAuth(true);
        });

        it.each(['/', '/programs', '/login', '/administrator', '/admin-panelx'])(
            'is skipped on non-admin path %s',
            async (path) => {
                setPathname(path);
                renderProvider();

                await waitForLoaded();

                expect(tokenRefreshMock).not.toHaveBeenCalled();
                expectAuth(false);
            },
        );
    });

    describe('login()', () => {
        it('calls loginRequest and flips auth to true', async () => {
            await renderSignedOut();
            isValidMock.mockImplementation((t: string) => t === 'login_token');

            await triggerLogin();

            expect(loginRequestMock).toHaveBeenCalledWith(credentials);
            expectAuth(true);
        });

        it('clears a previous logout revocation failure', async () => {
            await renderSignedIn();
            failNextLogout();
            await triggerLogout();
            expectRevocationFailed(true);

            await triggerLogin();

            expectRevocationFailed(false);
            expectAuth(true);
        });

        it('that resolves after logout() does not restore the session', async () => {
            await renderSignedIn();
            const loginResponse = deferred<string>();
            loginRequestMock.mockReturnValueOnce(loginResponse.promise);
            const loginPromise = ctx.login(credentials);

            await act(async () => {
                ctx.logout();
                loginResponse.resolve('login_token');
                await loginPromise;
            });

            expectSignedOut();
        });
    });

    describe('logout()', () => {
        it('with a valid access token sends it to logoutRequest and signs out locally', async () => {
            await renderSignedIn();

            await triggerLogout();

            expect(logoutRequestMock).toHaveBeenCalledWith('initial_token');
            expect(tokenRefreshMock).toHaveBeenCalledTimes(1);
            expectSignedOut();
            expectRevocationFailed(false);
        });

        it('with an expired access token does not refresh and relies on the refresh cookie (no token sent)', async () => {
            await renderSignedIn();
            expireAccessToken();

            await triggerLogout();

            expect(logoutRequestMock).toHaveBeenCalledTimes(1);
            expect(logoutRequestMock).toHaveBeenCalledWith(undefined);
            expect(tokenRefreshMock).toHaveBeenCalledTimes(1); // mount only
            expectSignedOut();
            expectRevocationFailed(false);
        });

        it('without any access token still calls logoutRequest so the refresh cookie is revoked', async () => {
            await renderSignedOut();

            await triggerLogout();

            expect(logoutRequestMock).toHaveBeenCalledWith(undefined);
            expectAuth(false);
        });

        it('after a failed refresh does not refresh again and still calls logoutRequest without a token', async () => {
            await renderSignedIn();
            await failRefreshManually();

            await triggerLogout();

            expect(tokenRefreshMock).toHaveBeenCalledTimes(2); // mount + manual
            expect(logoutRequestMock).toHaveBeenCalledWith(undefined);
            expectSignedOut();
        });

        it('keeps the local session cleared, logs the error and flags the failure when logoutRequest rejects', async () => {
            const logoutError = failNextLogout();
            await renderSignedIn();

            await triggerLogout();

            expect(logoutRequestMock).toHaveBeenCalledWith('initial_token');
            expect(silenceConsoleError()).toHaveBeenCalledWith('Server-side logout failed:', logoutError);
            expectSignedOut();
            expectRevocationFailed(true);
            expect(screen.getByTestId('loading')).toHaveTextContent('false');
        });

        it('resets the failure flag when a later logout request succeeds', async () => {
            await renderSignedIn();
            failNextLogout();
            await triggerLogout();
            expectRevocationFailed(true);

            await triggerLogout();

            expect(logoutRequestMock).toHaveBeenCalledTimes(2);
            expectRevocationFailed(false);
        });

        it('sends a cookie-only request when called again after local state is cleared', async () => {
            await renderSignedIn();

            await triggerLogout();
            await triggerLogout();

            expect(logoutRequestMock).toHaveBeenNthCalledWith(1, 'initial_token');
            expect(logoutRequestMock).toHaveBeenNthCalledWith(2, undefined);
        });
    });

    describe('refreshAccessToken()', () => {
        it('that fails without a logout rejects with the original error and ends the local session', async () => {
            await renderSignedIn();

            await failRefreshManually();

            expectSignedOut();
        });

        it('that resolves after logout() is cancelled and does not restore the session', async () => {
            await renderSignedIn();
            const { pending, refreshPromise } = startPendingRefresh();

            await triggerLogout();
            await settleAsCancelled(() => pending.resolve('initial_token'), refreshPromise);

            expectSignedOut();
        });

        it('that fails after logout() and a new login is cancelled and keeps the new session', async () => {
            await renderSignedIn();
            const { pending, refreshPromise } = startPendingRefresh();

            await act(async () => {
                ctx.logout();
                await ctx.login(credentials);
            });
            await settleAsCancelled(() => pending.reject(new Error('refresh failed')), refreshPromise);

            expectAuth(true);
            expect(getClientToken()).toBe('login_token');
        });

        it('that resolves while logoutRequest is pending does not restore the session', async () => {
            await renderSignedIn();
            const pendingLogout = deferred<LogoutResponse>();
            logoutRequestMock.mockReturnValueOnce(pendingLogout.promise);
            const { pending, refreshPromise } = startPendingRefresh();

            await act(async () => {
                ctx.logout();
                pending.resolve('initial_token');
                await expect(refreshPromise).rejects.toThrow(CanceledError);
                expect(getClientToken()).toBe('');
                pendingLogout.resolve(logoutResponse);
            });

            expect(logoutRequestMock).toHaveBeenCalledWith('initial_token');
            expectSignedOut();
        });
    });

    it('ignores a late logout failure after a new login has started a new session', async () => {
        silenceConsoleError();
        await renderSignedIn();
        const pendingLogout = deferred<LogoutResponse>();
        logoutRequestMock.mockReturnValueOnce(pendingLogout.promise);

        await triggerLogout();
        await triggerLogin();
        await act(async () => {
            pendingLogout.reject(new Error('late failure'));
        });

        expectRevocationFailed(false);
        expectAuth(true);
    });

    it('ignores a late logout success when a newer logout has already failed', async () => {
        await renderSignedIn();
        const firstLogout = deferred<LogoutResponse>();
        logoutRequestMock.mockReturnValueOnce(firstLogout.promise);
        await triggerLogout();

        failNextLogout();
        await triggerLogout();
        expectRevocationFailed(true);

        await act(async () => {
            firstLogout.resolve(logoutResponse);
        });

        expectRevocationFailed(true); // the latest logout decides, not the stale one
    });
});
