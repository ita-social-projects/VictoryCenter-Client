import '@testing-library/jest-dom';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { useAdminContext, AdminContextProvider } from './AdminContextProvider';
import { loginRequest, tokenRefreshRequest, logoutRequest } from '../../../services/api/admin/login/login-api';
import { isAccessTokenValid } from '../../../services/auth/auth-service/auth-service';
import { CreateAdminClient } from '../../../services/auth/create-admin-client/create-admin-client';

jest.mock('../../../services/api/admin/login/login-api', () => ({
    loginRequest: jest.fn(),
    logoutRequest: jest.fn(),
    tokenRefreshRequest: jest.fn(),
}));
jest.mock('../../../services/auth/auth-service/auth-service', () => ({
    isAccessTokenValid: jest.fn(),
}));
jest.mock('../../../services/auth/create-admin-client/create-admin-client', () => ({
    CreateAdminClient: jest.fn(),
}));
jest.mock('../../../const/common/api-routes/main-api', () => ({
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

describe('<AdminContextProvider />', () => {
    beforeEach(() => {
        jest.clearAllMocks();

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
});
