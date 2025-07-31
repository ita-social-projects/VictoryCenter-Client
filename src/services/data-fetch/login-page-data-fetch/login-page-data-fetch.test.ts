import { loginRequest, logoutRequest, tokenRefreshRequest } from './login-page-data-fetch';
import { AuthResponse, Credentials } from '../../../types/admin/Auth';
import { AuthClient } from '../../auth/AuthClient';
import { AxiosResponse } from 'axios';
import { API_ROUTES } from '../../../const/urls/main-api';

jest.mock('../../auth/AuthClient', () => ({
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
        const mockToken = 'mock-access-token';
        const mockResponse = { data: { accessToken: mockToken } } as { data: AuthResponse };

        (AuthClient.post as jest.Mock).mockResolvedValueOnce(mockResponse);

        const token = await loginRequest(creds);

        expect(token).toBe(mockToken);
    });

    it('tokenRefreshRequest throws on error', async () => {
        (AuthClient.post as jest.Mock).mockRejectedValueOnce(new Error('fail'));
        await expect(tokenRefreshRequest()).rejects.toThrow('fail');
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
});
