import type { InternalAxiosRequestConfig } from 'axios';
import { resolveWithNewTokenConcurrent, resolveWithNewToken } from './resolveWithNewToken';

describe('resolveWithNewTokenConcurrent', () => {
    var refreshAccessToken: jest.Mock<Promise<void>, []>;
    var getAccessToken: jest.Mock<string, []>;
    var logout: jest.Mock<void, []>;
    var handler: ReturnType<typeof resolveWithNewTokenConcurrent>;

    beforeEach(() => {
        refreshAccessToken = jest.fn();
        getAccessToken = jest.fn().mockReturnValue('new_token');
        logout = jest.fn();
        handler = resolveWithNewTokenConcurrent(refreshAccessToken, getAccessToken, logout);
    });

    it('calls refreshAccessToken only once for multiple requests and resolves all with Authorization header', async () => {
        var resolveRefresh: () => void;
        const refreshPromise = new Promise<void>((res) => {
            resolveRefresh = res;
        });
        refreshAccessToken.mockReturnValueOnce(refreshPromise);

        const cfg1 = {} as InternalAxiosRequestConfig;
        const cfg2 = { headers: {} } as InternalAxiosRequestConfig;

        const promise1 = handler({ ...cfg1 });
        const promise2 = handler({ ...cfg2 });

        expect(refreshAccessToken).toHaveBeenCalledTimes(1);

        resolveRefresh!();
        const [res1, res2] = await Promise.all([promise1, promise2]);

        expect(res1.headers!['Authorization']).toBe('Bearer new_token');
        expect(res2.headers!['Authorization']).toBe('Bearer new_token');
    });

    it('on refresh failure calls logout and rejects all queued promises', async () => {
        const error = new Error('refresh failed');
        refreshAccessToken.mockRejectedValueOnce(error);

        const cfg1 = { headers: {} } as InternalAxiosRequestConfig;
        const cfg2 = {} as InternalAxiosRequestConfig;

        const promise1 = handler({ ...cfg1 });
        const promise2 = handler({ ...cfg2 });

        await expect(promise1).rejects.toThrow(error);
        await expect(promise2).rejects.toThrow(error);
        expect(logout).toHaveBeenCalledTimes(1);
    });

    it('after a successful refresh allows triggering another refresh for subsequent requests', async () => {
        refreshAccessToken.mockResolvedValueOnce();
        const first = await handler({ headers: {} } as InternalAxiosRequestConfig);

        expect(refreshAccessToken).toHaveBeenCalledTimes(1);
        expect(first.headers!['Authorization']).toBe('Bearer new_token');

        await new Promise((resolve) => setTimeout(resolve, 0));

        getAccessToken.mockReturnValue('second_token');
        refreshAccessToken.mockResolvedValueOnce();
        const second = await handler({ headers: {} } as InternalAxiosRequestConfig);

        expect(refreshAccessToken).toHaveBeenCalledTimes(2);
        expect(second.headers!['Authorization']).toBe('Bearer second_token');
    });
});

describe('resolveWithNewToken', () => {
    var refreshAccessToken: jest.Mock<Promise<void>, []>;
    var getAccessToken: jest.Mock<string, []>;
    var logout: jest.Mock<void, []>;
    var handler: ReturnType<typeof resolveWithNewToken>;

    beforeEach(() => {
        refreshAccessToken = jest.fn();
        getAccessToken = jest.fn().mockReturnValue('simple_token');
        logout = jest.fn();
        handler = resolveWithNewToken(refreshAccessToken, getAccessToken, logout);
    });

    it('awaits refreshAccessToken, sets header, and returns config', async () => {
        refreshAccessToken.mockResolvedValueOnce();
        const cfg = {} as InternalAxiosRequestConfig;
        
        const result = await handler({ ...cfg });

        expect(refreshAccessToken).toHaveBeenCalledTimes(1);
        expect(result.headers!['Authorization']).toBe('Bearer simple_token');
    });

    it('on refresh failure calls logout and throws', async () => {
        const error = new Error('simple refresh failed');
        refreshAccessToken.mockRejectedValueOnce(error);
        const cfg = { headers: {} } as InternalAxiosRequestConfig;

        await expect(handler({ ...cfg })).rejects.toThrow(error);
        
        expect(logout).toHaveBeenCalledTimes(1);
    });
});
