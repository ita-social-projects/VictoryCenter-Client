import { InternalAxiosRequestConfig } from 'axios';

export type RefreshHandler = (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;

export const resolveWithNewTokenConcurrent = (
    refreshAccessToken: () => Promise<void>,
    getAccessToken: () => string,
    logout: () => void
): RefreshHandler => {
    let isRefreshing = false;
    const retryQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

    const resolveQueue = (token: string) => {
        retryQueue.forEach(({ resolve }) => resolve(token));
        retryQueue.length = 0;
    };

    const rejectQueue = (error: any) => {
        retryQueue.forEach(({ reject }) => reject(error));
        retryQueue.length = 0;
    };

    return function resolveWithNewToken(config: InternalAxiosRequestConfig) {
        return new Promise<InternalAxiosRequestConfig>((resolve, reject) => {
            retryQueue.push({
                resolve: (newToken: string) => {
                    config.headers = config.headers ?? {};
                    config.headers['Authorization'] = `Bearer ${newToken}`;
                    resolve(config);
                },
                reject,
            });

            if (!isRefreshing) {
                isRefreshing = true;
                refreshAccessToken()
                    .then(() => {
                        resolveQueue(getAccessToken());
                    })
                    .catch((error) => {
                        logout();
                        rejectQueue(error);
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
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            return config;
        } catch (err) {
            logout();
            throw err;
        }
    };
};
