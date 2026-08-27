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
