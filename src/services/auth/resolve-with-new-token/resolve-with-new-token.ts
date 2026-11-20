import axios, { InternalAxiosRequestConfig } from 'axios';

export type RefreshHandler = (config: InternalAxiosRequestConfig) => Promise<InternalAxiosRequestConfig>;

export const resolveWithNewTokenConcurrent = (
    refreshAccessToken: () => Promise<void>,
    getAccessToken: () => string,
    logout: () => void,
): RefreshHandler => {
    let isRefreshing = false;
    const retryQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

    const takeQueue = () => {
        isRefreshing = false;
        return retryQueue.splice(0);
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
                        const token = getAccessToken();
                        takeQueue().forEach(({ resolve }) => resolve(token));
                    })
                    .catch((error) => {
                        const queue = takeQueue();
                        if (!axios.isCancel(error)) {
                            logout();
                        }
                        queue.forEach(({ reject }) => reject(error));
                    });
            }
        });
    };
};

export const resolveWithNewToken = (
    refreshAccessToken: () => Promise<void>,
    getAccessToken: () => string,
    logout: () => void,
): RefreshHandler => {
    return async function (config: InternalAxiosRequestConfig) {
        try {
            await refreshAccessToken();
            config.headers = config.headers ?? {};
            config.headers['Authorization'] = `Bearer ${getAccessToken()}`;
            return config;
        } catch (err) {
            if (!axios.isCancel(err)) {
                logout();
            }
            throw err;
        }
    };
};
