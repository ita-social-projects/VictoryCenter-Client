import axios, { AxiosError, AxiosInstance } from 'axios';
import type { AxiosRequestHeaders, InternalAxiosRequestConfig } from 'axios';
import { CreateAdminClient } from './createAdminClient';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('CreateAdminClient', () => {
    let fakeClient: jest.Mocked<AxiosInstance>;
    let requestUse: jest.Mock;
    let responseUse: jest.Mock;
    let handlerMock: jest.Mock<Promise<InternalAxiosRequestConfig>, [InternalAxiosRequestConfig]>;

    const baseURL = 'https://api.example.com';
    const token = 'old-token-123';
    const newToken = 'new-token-456';

    beforeEach(() => {
        jest.clearAllMocks();

        requestUse = jest.fn();
        responseUse = jest.fn();
        fakeClient = {
            get: jest.fn(),
            post: jest.fn(),
            put: jest.fn(),
            delete: jest.fn(),
            head: jest.fn(),
            options: jest.fn(),
            patch: jest.fn(),
            request: jest.fn(),
            defaults: {} as any,
            interceptors: {
                request: { use: requestUse },
                response: { use: responseUse },
            },
        } as unknown as jest.Mocked<AxiosInstance>;
        mockedAxios.create.mockReturnValue(fakeClient);

        handlerMock = jest.fn((cfg: InternalAxiosRequestConfig) =>
            Promise.resolve({
                ...cfg,
                headers: {
                    ...(cfg.headers ?? {}),
                    Authorization: `Bearer ${newToken}`,
                },
            })
        ) as jest.Mock<Promise<InternalAxiosRequestConfig>, [InternalAxiosRequestConfig]>;
    });

    it('configures axios.create with JSON + credentials', () => {
        CreateAdminClient(
            baseURL,
            () => true,
            () => token,
            async () => {},
            () => {}
        );
        expect(mockedAxios.create).toHaveBeenCalledWith({
            baseURL,
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true,
        });
    });

    describe('request interceptor', () => {
        it('injects token when authenticated', () => {
            CreateAdminClient(
                baseURL,
                () => true,
                () => token,
                async () => {},
                () => {},
                handlerMock
            );
            const [interceptor] = requestUse.mock.calls[0];
            const cfg = { } as InternalAxiosRequestConfig;
            expect(interceptor(cfg)).toEqual({
                headers: { Authorization: `Bearer ${token}` },
            });
        });

        it('calls refreshHandler when not authenticated', async () => {
            CreateAdminClient(
                baseURL,
                () => false,
                () => token,
                async () => {},
                () => {},
                handlerMock
            );
            const [interceptor] = requestUse.mock.calls[0];
            const cfg = { headers: {} } as InternalAxiosRequestConfig;
            const result = interceptor(cfg);
            await expect(result).resolves.toMatchObject({
                headers: { Authorization: `Bearer ${newToken}` },
            });
            expect(handlerMock).toHaveBeenCalledWith(cfg);
        });
    });

    describe('response interceptor', () => {
        let successHandler: any, errorHandler: any;

        beforeEach(() => {
            CreateAdminClient(
                baseURL,
                () => false,
                () => token,
                async () => {},
                () => {},
                handlerMock
            );
            [successHandler, errorHandler] = responseUse.mock.calls[0];
        });

        it('passes through successful responses', () => {
            const resp = { data: 1 };
            expect(successHandler(resp)).toBe(resp);
        });

        it('on 401, refreshes then retries via client()', async () => {
            const cfg = { headers: {} } as InternalAxiosRequestConfig;
            const err = {
                response: { status: 401 },
                config: cfg,
            } as AxiosError & { config: InternalAxiosRequestConfig };

            handlerMock.mockResolvedValueOnce({
                ...cfg,
                headers: { Authorization: `Bearer ${newToken}` } as AxiosRequestHeaders,
            });

            const retry = errorHandler(err);
            await retry;
            expect(handlerMock).toHaveBeenCalledWith(cfg);
            expect(fakeClient.request).toHaveBeenCalledWith(
                expect.objectContaining({
                    headers: { Authorization: `Bearer ${newToken}` },
                })
            );
        });

        it('on non-401, rejects with original error', async () => {
            const cfg = { headers: {} } as InternalAxiosRequestConfig;
            const err = {
                response: { status: 403 },
                config: cfg,
            } as AxiosError & { config: InternalAxiosRequestConfig };

            await expect(errorHandler(err)).rejects.toBe(err);
            expect(handlerMock).not.toHaveBeenCalled();
        });
    });
});
