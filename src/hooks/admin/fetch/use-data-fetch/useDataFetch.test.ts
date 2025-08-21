import { renderHook, act, waitFor } from '@testing-library/react';
import { useDataFetch } from './useDataFetch';
import axios from 'axios';

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

interface TestEntity {
    id: number;
    name: string;
}

const createEntity = (id: number, name: string = 'Entity'): TestEntity => ({ id, name });
const createEntities = (count: number): TestEntity[] =>
    Array.from({ length: count }, (_, i) => createEntity(i + 1, `Entity ${i + 1}`));
const createSuccessFetch = (entities: TestEntity[]) => jest.fn().mockResolvedValue(entities);
const createFailFetch = () => jest.fn().mockRejectedValue(new Error('Failed'));

describe('useDataFetch', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.isCancel = jest.fn().mockReturnValue(false) as any;
    });

    it('should initialize with default state', () => {
        const initialData: TestEntity[] = [];
        const fetchHandler = jest.fn();

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        expect(result.current.data).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should auto fetch on mount when not disabled', async () => {
        const entities = createEntities(2);
        const fetchHandler = createSuccessFetch(entities);
        const initialData: TestEntity[] = [];

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: false,
            }),
        );

        await waitFor(() => expect(fetchHandler).toHaveBeenCalledTimes(1));
        expect(fetchHandler).toHaveBeenCalledWith({
            cancellationSignal: expect.any(AbortSignal),
        });

        await waitFor(() => expect(result.current.data).toEqual(entities));
    });

    it('should not auto fetch when disabled', async () => {
        const fetchHandler = createSuccessFetch([]);
        const initialData: TestEntity[] = [];

        renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        await new Promise((resolve) => setTimeout(resolve, 100)); // Wait a bit
        expect(fetchHandler).not.toHaveBeenCalled();
    });

    it('should fetch entities successfully', async () => {
        const entities = createEntities(2);
        const fetchHandler = createSuccessFetch(entities);
        const initialData: TestEntity[] = [];

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        act(() => {
            result.current.refetch();
        });

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toEqual(entities);
        expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
        const fetchHandler = createFailFetch();
        const initialData: TestEntity[] = [];

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        act(() => {
            result.current.refetch();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toEqual(new Error('Failed'));
    });

    it('should ignore CanceledError', async () => {
        const fetchHandler = jest.fn().mockRejectedValue({ name: 'CanceledError', message: 'Canceled' });
        const initialData: TestEntity[] = [];

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        act(() => {
            result.current.refetch();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBeNull();
    });

    it('should update data using setData', () => {
        const initialData: TestEntity[] = [];
        const fetchHandler = jest.fn();
        const entities = createEntities(2);

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        act(() => {
            result.current.setData(entities);
        });

        expect(result.current.data).toEqual(entities);
    });

    it('should refetch when dependencies change', async () => {
        const fetchHandler = createSuccessFetch([]);
        const initialData: TestEntity[] = [];

        const { rerender } = renderHook(
            ({ deps }) =>
                useDataFetch({
                    initialData,
                    fetchHandler,
                    autoFetchDisabled: false,
                    autoFetchDependencies: [deps],
                }),
            { initialProps: { deps: 'initial' } },
        );

        // Initial auto fetch
        await waitFor(() => expect(fetchHandler).toHaveBeenCalledTimes(1));

        rerender({ deps: 'changed' });

        await waitFor(() => expect(fetchHandler).toHaveBeenCalledTimes(2));
    });

    it('should not refetch when autoFetch disabled and dependencies change', async () => {
        const fetchHandler = createSuccessFetch([]);
        const initialData: TestEntity[] = [];

        const { rerender } = renderHook(
            ({ deps }) =>
                useDataFetch({
                    initialData,
                    fetchHandler,
                    autoFetchDisabled: true,
                    autoFetchDependencies: [deps],
                }),
            { initialProps: { deps: 'initial' } },
        );

        rerender({ deps: 'changed' });

        await new Promise((resolve) => setTimeout(resolve, 100));
        expect(fetchHandler).not.toHaveBeenCalled();
    });

    it('should abort previous request on new fetch', async () => {
        let resolveCount = 0;
        const fetchHandler = jest.fn(
            () =>
                new Promise((resolve) => {
                    setTimeout(() => {
                        resolveCount++;
                        resolve([createEntity(resolveCount)]);
                    }, 50);
                }),
        );
        const initialData: TestEntity[] = [];

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        act(() => {
            result.current.refetch();
        });

        act(() => {
            result.current.refetch();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(fetchHandler).toHaveBeenCalledTimes(2);
    });

    it('should handle multiple rapid refetch calls', async () => {
        const entities = createEntities(2);
        const fetchHandler = createSuccessFetch(entities);
        const initialData: TestEntity[] = [];

        const { result } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        act(() => {
            result.current.refetch();
            result.current.refetch();
            result.current.refetch();
        });

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.data).toEqual(entities);
        expect(result.current.error).toBeNull();
    });

    it('should cleanup abort controller on unmount', () => {
        const fetchHandler = jest.fn();
        const initialData: TestEntity[] = [];

        const { unmount } = renderHook(() =>
            useDataFetch({
                initialData,
                fetchHandler,
                autoFetchDisabled: true,
            }),
        );

        expect(() => unmount()).not.toThrow();
    });
});
