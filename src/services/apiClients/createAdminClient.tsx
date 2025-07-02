import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from 'axios';

export function CreateAdminClient(
    baseURL: string,
    checkIsAuthenticated: () => boolean,
    getAccessToken: () => string,
    refreshAccessToken: () => Promise<void>,
    logout: () => void
): AxiosInstance {
    const client = axios.create({ baseURL });

    var isRefreshing = false;
    const retryQueue: Array<(token: string) => void> = [];

    const resolveQueue = (token: string) => {
        retryQueue.forEach((callback) => callback(token));
        retryQueue.length = 0;
    };

    const resolveWithNewToken = (config: InternalAxiosRequestConfig) => {
        return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
            retryQueue.push((newToken: string) => {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${newToken}`;
                resolve(client(config));
            });

            if (!isRefreshing) {
                isRefreshing = true;
                refreshAccessToken()
                    .then(() => {
                        resolveQueue(getAccessToken());
                    })
                    .catch((error) => {
                        logout();
                        reject(error);
                    })
                    .finally(() => {
                        isRefreshing = false;
                    });
            }
        });
    };

    client.interceptors.request.use((config) => {
        if (checkIsAuthenticated()) {
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            return config;
        }

        return resolveWithNewToken(config);
    });

    client.interceptors.response.use(
        (response) => response,
        (error: AxiosError & { config: AxiosRequestConfig }) => {
            const { response, config } = error;

            if (response?.status === 401) {
                return resolveWithNewToken(config);
            }

            return Promise.reject(error);
        }
    );

    return client;
}
