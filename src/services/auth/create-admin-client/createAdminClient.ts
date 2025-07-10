import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { resolveWithNewTokenConcurrent } from '../resolve-with-new-token/resolveWithNewToken';

export function CreateAdminClient(
    baseURL: string,
    checkIsAuthenticated: () => boolean,
    getAccessToken: () => string,
    refreshAccessToken: () => Promise<void>,
    logout: () => void,
    refreshHandler = resolveWithNewTokenConcurrent(refreshAccessToken, getAccessToken, logout),
): AxiosInstance {
    const client = axios.create({
        baseURL: baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    client.interceptors.request.use((config: InternalAxiosRequestConfig) => {
        if (checkIsAuthenticated()) {
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            return config;
        }

        return refreshHandler(config);
    });

    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError & { config: AxiosRequestConfig }) => {
            const { response, config } = error;

            if (response?.status === 401) {
                return refreshHandler(config).then((newConfig) => client.request(newConfig));
            }

            return Promise.reject(error);
        },
    );

    return client;
}
