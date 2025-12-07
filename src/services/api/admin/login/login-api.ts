import { AxiosResponse } from 'axios';
import { API_ROUTES } from '@const/common/api-routes/main-api';
import { Credentials, AuthResponse } from '@app-types/admin/auth';
import { AuthClient } from '@services/auth/auth-client';

export const loginRequest = async (creds: Credentials): Promise<string> => {
    const response = await AuthClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, creds);
    return response.data.accessToken;
};

export const logoutRequest = async (token: string): Promise<AxiosResponse> => {
    const response = await AuthClient.post(API_ROUTES.AUTH.LOGOUT, null, {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    return response;
};

export const tokenRefreshRequest = async (): Promise<string> => {
    const response = await AuthClient.post<AuthResponse>(API_ROUTES.AUTH.REFRESH_TOKEN);
    return response.data.accessToken;
};
