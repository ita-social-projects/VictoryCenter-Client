import { AuthResponse, Credentials } from '../../../types/admin/Auth';
import { API_ROUTES } from '../../../const/urls/main-api';
import { AuthClient } from '../../auth/AuthClient';
import { AxiosResponse } from 'axios';

export const loginRequest = async (creds: Credentials): Promise<string> => {
    const response = await AuthClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, creds);
    return response.data.accessToken;
};

export const logoutRequest = async (): Promise<AxiosResponse<any>> => {
    const response = await AuthClient.post(`${API_ROUTES.AUTH.LOGOUT}`);
    return response;
};

export const tokenRefreshRequest = async (): Promise<string> => {
    const response = await AuthClient.post<AuthResponse>(API_ROUTES.AUTH.REFRESH_TOKEN);
    return response.data.accessToken;
};
