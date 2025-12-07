import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataPaginationFetch, useDataPaginationFetchProps, PaginationRequestParams } from './useDataPaginationFetch';
import { PaginationResult } from '@app-types/admin/common';
import axios from 'axios';

jest.mock('axios', () => ({
    isCancel: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

interface TestItem {
    id: number;
    name: string;
}

const createMockFetchHandler = (mockData: TestItem[][], totalCount: number = 25, shouldReject: boolean = false) => {
    return jest.fn((params: PaginationRequestParams): Promise<PaginationResult<TestItem>> => {
        if (shouldReject) {
            return Promise.reject(new Error('Network error'));
        }

        const page = params.offset! / params.limit!;
        const items = mockData[page] || [];

        return Promise.resolve({
            items,
            totalItemsCount: totalCount,
        });
    });
};

const createTestItems = (start: number, count: number): TestItem[] =>
    Array.from({ length: count }, (_, i) => ({
        id: start + i,
        name: `Item ${start + i}`,
    }));

const defaultProps: useDataPaginationFetchProps<TestItem> = {
    initialData: [],
    fetchHandler: jest.fn(),
    pageSize: 10,
    autoFetchDisabled: false,
};

const renderPaginationHook = (props: Partial<useDataPaginationFetchProps<TestItem>> = {}) =>
    renderHook(() => useDataPaginationFetch({ ...defaultProps, ...props }));

describe('useDataPaginationFetch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.isCancel.mockReturnValue(false);
    });

    it('initializes with default values (when autoFetch is disabled)', () => {
        const { result } = renderPaginationHook({ autoFetchDisabled: true });

        expect(result.current.data).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasMore).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('initializes with provided initial data (when autoFetch is disabled)', () => {
        const initialData: TestItem[] = [{ id: 1, name: 'Initial Item' }];
        const { result } = renderPaginationHook({ initialData, autoFetchDisabled: true });

        expect(result.current.data).toEqual(initialData);
    });

    it('fetches first page automatically on mount', async () => {
        const mockData = [createTestItems(1, 10)];
        const mockFetchHandler = createMockFetchHandler(mockData);
        const { result } = renderPaginationHook({ fetchHandler: mockFetchHandler });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockFetchHandler).toHaveBeenCalledTimes(1);
        expect(mockFetchHandler).toHaveBeenCalledWith({
            offset: 0,
            limit: 10,
            requestOptions: { cancellationSignal: expect.any(AbortSignal) },
        });
        expect(result.current.data).toHaveLength(10);
        expect(result.current.hasMore).toBe(true);
    });

    it('should not call fetch function when autoFetchDisabled is true', () => {
        const mockFetchHandler = createMockFetchHandler([]);
        renderPaginationHook({ fetchHandler: mockFetchHandler, autoFetchDisabled: true });

        expect(mockFetchHandler).not.toHaveBeenCalled();
    });

    it('fetches more pages and appends data', async () => {
        const mockData = [createTestItems(1, 10), createTestItems(11, 10)];
        const mockFetchHandler = createMockFetchHandler(mockData);
        const { result } = renderPaginationHook({ fetchHandler: mockFetchHandler });

        await waitFor(() => {
            expect(result.current.data).toHaveLength(10);
        });
        expect(mockFetchHandler).toHaveBeenCalledTimes(1);

        await act(async () => {
            result.current.fetchMore();
        });

        expect(mockFetchHandler).toHaveBeenCalledTimes(2);
        expect(result.current.data).toHaveLength(20);
        expect(result.current.data[0].id).toBe(1);
        expect(result.current.data[19].id).toBe(20);
    });

    it('sets hasMore to false when all data is fetched', async () => {
        const mockData = [createTestItems(1, 5)];
        const mockFetchHandler = createMockFetchHandler(mockData, 5);
        const { result } = renderPaginationHook({ fetchHandler: mockFetchHandler });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.hasMore).toBe(false);
        expect(mockFetchHandler).toHaveBeenCalledTimes(1);
    });

    it('prevents fetchMore when hasMore is false', async () => {
        const mockData = [createTestItems(1, 10)];
        const mockFetchHandler = createMockFetchHandler(mockData, 10);
        const { result } = renderPaginationHook({ fetchHandler: mockFetchHandler });

        await waitFor(() => {
            expect(result.current.hasMore).toBe(false);
        });

        const callCount = mockFetchHandler.mock.calls.length;
        expect(callCount).toBe(1);

        act(() => {
            result.current.fetchMore();
        });

        expect(mockFetchHandler).toHaveBeenCalledTimes(callCount);
        expect(result.current.isLoading).toBe(false);
    });

    it('handles fetch errors on auto-fetch', async () => {
        const mockFetchHandler = createMockFetchHandler([], 0, true);
        const { result } = renderPaginationHook({ fetchHandler: mockFetchHandler });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toEqual(new Error('Network error'));
        expect(result.current.isLoading).toBe(false);
    });

    it('ignores cancelled requests on auto-fetch', async () => {
        mockedAxios.isCancel.mockReturnValue(true);
        const mockFetchHandler = jest.fn().mockRejectedValue(new Error('Cancelled'));
        const { result } = renderPaginationHook({ fetchHandler: mockFetchHandler });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(result.current.error).toBeNull();
    });

    it('resets list correctly (after auto-fetch)', async () => {
        const initialData: TestItem[] = [{ id: 1, name: 'Item' }];
        const { result } = renderPaginationHook({ initialData, autoFetchDisabled: true });
        expect(result.current.data).toEqual(initialData);

        act(() => {
            result.current.resetList();
        });

        expect(result.current.data).toEqual([]);
        expect(result.current.hasMore).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('updates data using setData', () => {
        const { result } = renderPaginationHook({ autoFetchDisabled: true });
        const newData: TestItem[] = [{ id: 1, name: 'New Item' }];

        act(() => {
            result.current.setData(newData);
        });

        expect(result.current.data).toEqual(newData);
    });

    it('uses custom pageSize on auto-fetch', async () => {
        const mockData = [createTestItems(1, 5)];
        const mockFetchHandler = createMockFetchHandler(mockData);
        const { result } = renderPaginationHook({
            fetchHandler: mockFetchHandler,
            pageSize: 5,
        });

        await waitFor(() => {
            expect(result.current.isLoading).toBe(false);
        });

        expect(mockFetchHandler).toHaveBeenCalledTimes(1);
        expect(mockFetchHandler).toHaveBeenCalledWith({
            offset: 0,
            limit: 5,
            requestOptions: { cancellationSignal: expect.any(AbortSignal) },
        });
    });

    it('filters duplicate items when getUniqueId is provided', async () => {
        const mockData = [
            [
                { id: 1, name: 'Item 1' },
                { id: 2, name: 'Item 2' },
            ],
            [
                { id: 2, name: 'Item 2' },
                { id: 3, name: 'Item 3' },
            ], // id: 2 is duplicate
        ];
        const mockFetchHandler = createMockFetchHandler(mockData);
        const getUniqueId = (item: TestItem): number => item.id;

        const { result } = renderPaginationHook({
            fetchHandler: mockFetchHandler,
            getUniqueId,
        });

        await waitFor(() => {
            expect(result.current.data).toHaveLength(2);
        });

        await act(async () => {
            result.current.fetchMore();
        });
        await waitFor(() => {
            expect(result.current.data).toHaveLength(3);
        });

        expect(result.current.data.map((item) => item.id)).toEqual([1, 2, 3]);
    });

    it('should refetch when dependencies change', async () => {
        const mockFetchHandler = createMockFetchHandler([createTestItems(1, 10)]);

        const { rerender } = renderHook(
            ({ dependency }) =>
                useDataPaginationFetch({
                    ...defaultProps,
                    fetchHandler: mockFetchHandler,
                    autoFetchDependencies: [dependency],
                }),
            { initialProps: { dependency: 'initial' } },
        );

        await waitFor(() => {
            expect(mockFetchHandler).toHaveBeenCalledTimes(1);
        });

        rerender({ dependency: 'changed' });

        await waitFor(() => {
            expect(mockFetchHandler).toHaveBeenCalledTimes(2);
        });
    });

    it('does not auto-fetch when disabled [on dependency change]', async () => {
        const mockFetchHandler = createMockFetchHandler([createTestItems(1, 10)]);
        const { rerender } = renderPaginationHook({
            fetchHandler: mockFetchHandler,
            autoFetchDisabled: true,
            autoFetchDependencies: ['dep1'],
        });

        expect(mockFetchHandler).not.toHaveBeenCalled();

        rerender({
            fetchHandler: mockFetchHandler,
            autoFetchDisabled: true,
            autoFetchDependencies: ['dep2'],
        });

        await act(async () => {
            await new Promise((r) => setTimeout(r, 0));
        });

        expect(mockFetchHandler).not.toHaveBeenCalled();
    });
});
