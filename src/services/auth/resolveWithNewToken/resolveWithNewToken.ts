import { InternalAxiosRequestConfig } from 'axios';

export interface RefreshHandler {
    (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig>;
}

export const resolveWithNewTokenConcurrent = (
    refreshAccessToken: () => Promise<void>,
    getAccessToken: () => string,
    logout: () => void
): RefreshHandler => {
    let isRefreshing = false;
    const retryQueue: Array<(token: string) => void> = [];

    const resolveQueue = (token: string) => {
        retryQueue.forEach((callback) => callback(token));
        retryQueue.length = 0;
    };

    return function resolveWithNewToken(config: InternalAxiosRequestConfig) {
        return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
            retryQueue.push((newToken: string) => {
                config.headers = config.headers || {};
                config.headers['Authorization'] = `Bearer ${newToken}`;
                resolve(config);
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
};

export const resolveWithNewToken = (
    refreshAccessToken: () => Promise<void>,
    getAccessToken: () => string,
    logout: () => void
): RefreshHandler => {
    return async function (config: InternalAxiosRequestConfig) {
        try {
            await refreshAccessToken();
            config.headers = config.headers || {};
            config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            return config;
        } catch (err) {
            logout();
            throw err;
        }
    };
};
