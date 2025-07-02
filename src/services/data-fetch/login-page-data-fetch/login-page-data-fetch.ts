import axios from 'axios';
import { apiBase, authEndpoints } from '../../../const/urls/main-api';
import { AuthResponse, Credentials } from '../../../types/Auth';

const authClient = axios.create({
    baseURL: apiBase,
    withCredentials: true,
});

export const loginRequest = async (creds: Credentials): Promise<string> => {
    const response = await authClient.post<AuthResponse>(authEndpoints.login, creds);
    return response.data.accessToken;
};

export const tokenRefreshRequest = async (): Promise<string> => {
    const response = await authClient.post<AuthResponse>(authEndpoints.refresh);
    return response.data.accessToken;
};
