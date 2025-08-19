import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntityFetch } from './useEntityFetch';
import axios from 'axios';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

interface TestEntity {
    id: number;
    name: string;
}

// Helper functions
const createEntity = (id: number, name: string = 'Entity'): TestEntity => ({ id, name });
const createSuccessFetch = (entity: TestEntity) => jest.fn().mockResolvedValue(entity);
const createFailFetch = (error = new Error('Failed')) => jest.fn().mockRejectedValue(error);
const createProps = (entityId: number | null = null, fetchHandler = jest.fn()) => ({
    fetchEntityHandler: fetchHandler,
    entityId,
});

describe('useEntityFetch', () => {
    beforeEach(() => {
        mockedAxios.isCancel = jest.fn().mockReturnValue(false) as any;
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useEntityFetch(createProps()));

        expect(result.current.entity).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should not fetch when entityId is null', () => {
        const fetchHandler = createSuccessFetch(createEntity(1));
        renderHook(() => useEntityFetch(createProps(null, fetchHandler)));

        expect(fetchHandler).not.toHaveBeenCalled();
    });

    it('should update entity manually', () => {
        const { result } = renderHook(() => useEntityFetch(createProps()));
        const entity = createEntity(1);

        act(() => result.current.actions.updateEntity(entity));

        expect(result.current.entity).toEqual(entity);
    });

    it('should reset entity and error', () => {
        const { result } = renderHook(() => useEntityFetch(createProps()));

        act(() => result.current.actions.updateEntity(createEntity(1)));
        act(() => result.current.actions.resetEntity());

        expect(result.current.entity).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should fetch entity successfully', async () => {
        const entity = createEntity(1);
        const fetchHandler = createSuccessFetch(entity);
        const { result } = renderHook(() => useEntityFetch(createProps(1, fetchHandler)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.entity).toEqual(entity);
        expect(fetchHandler).toHaveBeenCalledWith(1, { cancellationSignal: expect.any(AbortSignal) });
    });

    it('should handle fetch error', async () => {
        const fetchHandler = createFailFetch();
        const { result } = renderHook(() => useEntityFetch(createProps(1, fetchHandler)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.entity).toBeNull();
        expect(result.current.error).toEqual(new Error('Failed'));
    });

    it('should ignore axios canceled error', async () => {
        mockedAxios.isCancel.mockReturnValue(true);
        const fetchHandler = createFailFetch({ name: 'test', message: 'Canceled' });
        const { result } = renderHook(() => useEntityFetch(createProps(1, fetchHandler)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBeNull();
    });

    it('should ignore AbortError', async () => {
        const fetchHandler = createFailFetch({ name: 'AbortError', message: 'Aborted' });
        const { result } = renderHook(() => useEntityFetch(createProps(1, fetchHandler)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBeNull();
    });

    it('should handle null response', async () => {
        const fetchHandler = jest.fn().mockResolvedValue(null);
        const { result } = renderHook(() => useEntityFetch(createProps(1, fetchHandler)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.entity).toBeNull();
        expect(result.current.error).toBeNull();
    });

    it('should work with string ids', async () => {
        interface StringEntity {
            id: string;
            name: string;
        }
        const entity: StringEntity = { id: 'abc', name: 'Test' };
        const fetchHandler = jest.fn().mockResolvedValue(entity);
        const { result } = renderHook(() =>
            useEntityFetch<StringEntity, string>({ fetchEntityHandler: fetchHandler, entityId: 'abc' }),
        );

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.entity).toEqual(entity));
    });
});
