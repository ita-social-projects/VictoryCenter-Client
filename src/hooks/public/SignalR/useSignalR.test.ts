import { renderHook, waitFor, act } from '@testing-library/react';
import { useSignalR } from './useSignalR';
import { HubConnectionBuilder } from '@microsoft/signalr';

jest.mock('@microsoft/signalr', () => {
    const mockConnection = {
        start: jest.fn(),
        stop: jest.fn(),
        on: jest.fn(),
        off: jest.fn(),
    };
    return {
        HubConnectionBuilder: jest.fn().mockImplementation(() => ({
            withUrl: jest.fn().mockReturnThis(),
            withAutomaticReconnect: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue(mockConnection),
        })),
    };
});

describe('useSignalR', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    it('should successfully establish a connection', async () => {
        const mockStart = jest.fn().mockResolvedValue(undefined);
        (HubConnectionBuilder as jest.Mock).mockImplementation(() => ({
            withUrl: jest.fn().mockReturnThis(),
            withAutomaticReconnect: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({ start: mockStart, stop: jest.fn() }),
        }));

        const { result } = renderHook(() => useSignalR('http://test-url.com'));

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });
        expect(mockStart).toHaveBeenCalledTimes(1);
    });

    it('should not set connection if unmounted before promise resolves', async () => {
        let resolveStart: any = () => {};
        const mockStart = jest.fn().mockImplementation(
            () =>
                new Promise((resolve) => {
                    resolveStart = resolve;
                }),
        );

        (HubConnectionBuilder as jest.Mock).mockImplementation(() => ({
            withUrl: jest.fn().mockReturnThis(),
            withAutomaticReconnect: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({ start: mockStart, stop: jest.fn() }),
        }));

        const { result, unmount } = renderHook(() => useSignalR('http://test-url.com'));

        await waitFor(() => {
            expect(mockStart).toHaveBeenCalledTimes(1);
        });

        unmount();

        await act(async () => {
            resolveStart();
        });

        expect(result.current).toBeNull();
    });

    it('should retry connection on failure and eventually succeed', async () => {
        const mockStart = jest
            .fn()
            .mockRejectedValueOnce(new Error('Failed to connect'))
            .mockResolvedValueOnce(undefined);

        (HubConnectionBuilder as jest.Mock).mockImplementation(() => ({
            withUrl: jest.fn().mockReturnThis(),
            withAutomaticReconnect: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({ start: mockStart, stop: jest.fn() }),
        }));

        const { result } = renderHook(() => useSignalR('http://test-url.com'));

        await waitFor(() => {
            expect(mockStart).toHaveBeenCalledTimes(1);
        });

        await act(async () => {
            jest.advanceTimersByTime(1000);
        });

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        expect(mockStart).toHaveBeenCalledTimes(2);
    });

    it('should stop retrying after exceeding maxRetries', async () => {
        const mockStart = jest.fn().mockRejectedValue(new Error('Failed to connect'));

        (HubConnectionBuilder as jest.Mock).mockImplementation(() => ({
            withUrl: jest.fn().mockReturnThis(),
            withAutomaticReconnect: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({ start: mockStart, stop: jest.fn() }),
        }));

        renderHook(() => useSignalR('http://test-url.com'));

        for (let i = 0; i < 5; i++) {
            await act(async () => {
                await Promise.resolve();
                jest.runOnlyPendingTimers();
            });
        }

        await waitFor(() => {
            expect(mockStart).toHaveBeenCalledTimes(6);
        });

        await act(async () => {
            await Promise.resolve();
            jest.runOnlyPendingTimers();
        });

        expect(mockStart).toHaveBeenCalledTimes(6);
    });

    it('should call stop on unmount', async () => {
        const mockStop = jest.fn();
        (HubConnectionBuilder as jest.Mock).mockImplementation(() => ({
            withUrl: jest.fn().mockReturnThis(),
            withAutomaticReconnect: jest.fn().mockReturnThis(),
            build: jest.fn().mockReturnValue({ start: jest.fn().mockResolvedValue(undefined), stop: mockStop }),
        }));

        const { result, unmount } = renderHook(() => useSignalR('http://test-url.com'));

        await waitFor(() => {
            expect(result.current).not.toBeNull();
        });

        unmount();

        expect(mockStop).toHaveBeenCalled();
    });
});
