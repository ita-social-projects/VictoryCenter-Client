import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';
import { resolveWithNewTokenConcurrent } from '../resolve-with-new-token/resolve-with-new-token';

type RetriableRequestConfig = InternalAxiosRequestConfig & {
    _authRetry?: boolean;
};

export function CreateAdminClient(
    baseURL: string,
    checkIsAuthenticated: () => boolean,
    getAccessToken: () => string,
    refreshAccessToken: () => Promise<void>,
    logout: (token: string) => void,
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
        (error: AxiosError & { config?: RetriableRequestConfig }) => {
            const { response, config } = error;

            if (response?.status !== 401 || !config) {
                return Promise.reject(error);
            }

            if (config._authRetry) {
                logout(getAccessToken());
                return Promise.reject(error);
            }

            config._authRetry = true;
            return refreshHandler(config).then((newConfig) => client.request(newConfig));
        },
    );

    return client;
}
