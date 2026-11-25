import { AxiosResponse } from 'axios';
import { Credentials, AuthResponse } from '@/types/admin/auth';
import { AuthClient } from '@/services/auth/auth-client';
import { loginRequest, tokenRefreshRequest, logoutRequest } from './login-api';
import { API_ROUTES } from '@/const/common/api-routes/main-api';

jest.mock('@/services/auth/auth-client', () => ({
    AuthClient: {
        post: jest.fn(),
    },
}));

describe('login-page-data-fetch', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    const mockToken = 'mock-access-token';

    it('loginRequest returns accessToken on success', async () => {
        const creds: Credentials = { email: 'test@test.com', password: 'password' };
        const mockResponse = { data: { accessToken: mockToken } } as { data: AuthResponse };

        (AuthClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const token = await loginRequest(creds);

        expect(token).toBe(mockToken);
        expect(AuthClient.post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGIN, creds);
    });

    it('tokenRefreshRequest throws on error', async () => {
        (AuthClient.post as jest.Mock).mockRejectedValueOnce(new Error('fail'));
        await expect(tokenRefreshRequest()).rejects.toThrow('fail');
    });

    it('tokenRefreshRequest returns accessToken on success', async () => {
        const mockResponse = { data: { accessToken: mockToken } } as { data: AuthResponse };

        (AuthClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const token = await tokenRefreshRequest();

        expect(token).toBe(mockToken);
        expect(AuthClient.post).toHaveBeenCalledWith(API_ROUTES.AUTH.REFRESH_TOKEN);
    });

    it('logoutRequest success', async () => {
        const mockResponse = { status: 200, data: {} } as AxiosResponse;

        (AuthClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const response = await logoutRequest(mockToken);

        expect(response).toBe(mockResponse);
        expect(AuthClient.post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGOUT, null, {
            headers: {
                Authorization: `Bearer ${mockToken}`,
            },
        });
    });

    it('logoutRequest error', async () => {
        const errorMessage = 'Вихід не вдався';

        (AuthClient.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(logoutRequest(mockToken)).rejects.toThrow(errorMessage);
        expect(AuthClient.post).toHaveBeenCalledWith(API_ROUTES.AUTH.LOGOUT, null, {
            headers: {
                Authorization: `Bearer ${mockToken}`,
            },
        });
    });

    it('logoutRequest without a token does not send the Authorization header', async () => {
        const mockResponse = { status: 200, data: {} } as AxiosResponse;

        (AuthClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const response = await logoutRequest();

        expect(response).toBe(mockResponse);
        expect(AuthClient.post).toHaveBeenCalledTimes(1);

        const config = (AuthClient.post as jest.Mock).mock.calls[0][2];
        expect(config?.headers?.Authorization).toBeUndefined();
    });

    it('logoutRequest without a token still posts to the logout endpoint', async () => {
        (AuthClient.post as jest.Mock).mockResolvedValueOnce({ status: 200, data: {} } as AxiosResponse);

        await logoutRequest();

        expect((AuthClient.post as jest.Mock).mock.calls[0].slice(0, 2)).toEqual([API_ROUTES.AUTH.LOGOUT, null]);
    });

    it('logoutRequest without a token rejects when the request fails', async () => {
        const errorMessage = 'Вихід не вдався';

        (AuthClient.post as jest.Mock).mockRejectedValueOnce(new Error(errorMessage));

        await expect(logoutRequest()).rejects.toThrow(errorMessage);
    });
});
