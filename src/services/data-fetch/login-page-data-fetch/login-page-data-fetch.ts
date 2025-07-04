import axios from 'axios';
import { AuthResponse, Credentials } from '../../../types/Auth';
import { API_ROUTES } from '../../../const/urls/main-api';

const authClient = axios.create({
    baseURL: API_ROUTES.BASE,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const loginRequest = async (creds: Credentials): Promise<string> => {
    const response = await authClient.post<AuthResponse>(API_ROUTES.AUTH.LOGIN, creds);
    return response.data.accessToken;
};

export const tokenRefreshRequest = async (): Promise<string> => {
    const response = await authClient.post<AuthResponse>(API_ROUTES.AUTH.REFRESH_TOKEN);
    return response.data.accessToken;
};
