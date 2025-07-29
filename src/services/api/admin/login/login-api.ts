import { API_ROUTES } from '../../../../const/urls/main-api';
import { AuthResponse, Credentials } from '../../../../types/admin/auth';
import { AuthClient } from '../../../auth/auth-client';

export const loginRequest = async (creds: Credentials): Promise<string> => {
    const response = await AuthClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, creds);
    return response.data.accessToken;
};

export const tokenRefreshRequest = async (): Promise<string> => {
    const response = await AuthClient.post<AuthResponse>(API_ROUTES.AUTH.REFRESH_TOKEN);
    return response.data.accessToken;
};
