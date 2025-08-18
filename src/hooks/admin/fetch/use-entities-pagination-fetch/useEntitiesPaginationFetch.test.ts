import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntitiesPaginationFetch } from './useEntitiesPaginationFetch';
import axios from 'axios';

jest.mock('axios');
jest.mock('../../../common/use-identity-entities-crud/useIdentityEntitiesCrud');

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockUseIdentityEntitiesCrud =
    require('../../../common/use-identity-entities-crud/useIdentityEntitiesCrud').useIdentityEntitiesCrud;

interface TestEntity {
    id: number;
    name: string;
}

// Helper functions
const createEntity = (id: number, name: string = 'Entity'): TestEntity => ({ id, name });
const createEntities = (count: number): TestEntity[] =>
    Array.from({ length: count }, (_, i) => createEntity(i + 1, `Entity ${i + 1}`));
const createPaginationResult = (items: TestEntity[], totalCount: number) => ({
    items,
    totalItemsCount: totalCount,
});
const createSuccessFetch = (result: any) => jest.fn().mockResolvedValue(result);
const createFailFetch = () => jest.fn().mockRejectedValue(new Error('Failed'));
const createProps = (fetchHandler = jest.fn(), autoFetch = false) => ({
    fetchEntitiesHandler: fetchHandler,
    autoFetchDependencies: [],
    autoFetchDisabled: !autoFetch,
    pageSize: 2,
});

describe('useEntitiesPaginationFetch', () => {
    const mockEntityActions = {
        add: jest.fn(),
        update: jest.fn(),
        remove: jest.fn(),
        set: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockedAxios.isCancel = jest.fn().mockReturnValue(false) as any;
        mockUseIdentityEntitiesCrud.mockReturnValue({
            entities: [],
            actions: mockEntityActions,
        });
    });

    it('should initialize with default state', () => {
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps()));

        expect(result.current.entities).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.hasMore).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('should fetch entities from start', async () => {
        const entities = createEntities(2);
        const fetchHandler = createSuccessFetch(createPaginationResult(entities, 5));
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps(fetchHandler)));

        act(() => result.current.actions.fetchFromStart());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(fetchHandler).toHaveBeenCalledWith({
            offset: 0,
            limit: 2,
            requestOptions: { cancellationSignal: expect.any(AbortSignal) },
        });
        expect(mockEntityActions.set).toHaveBeenCalled();
    });

    it('should fetch more entities', async () => {
        const entities = createEntities(2);
        const fetchHandler = createSuccessFetch(createPaginationResult(entities, 5));
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps(fetchHandler)));

        // First fetch
        act(() => result.current.actions.fetchFromStart());
        await waitFor(() => expect(result.current.isLoading).toBe(false));

        // Fetch more
        act(() => result.current.actions.fetchMore());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(fetchHandler).toHaveBeenCalledTimes(2);
        expect(fetchHandler).toHaveBeenLastCalledWith({
            offset: 2,
            limit: 2,
            requestOptions: { cancellationSignal: expect.any(AbortSignal) },
        });
    });

    it('should not fetch more when loading', async () => {
        const fetchHandler = createSuccessFetch(createPaginationResult([], 0));
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps(fetchHandler)));

        act(() => result.current.actions.fetchFromStart());
        act(() => result.current.actions.fetchMore());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(fetchHandler).toHaveBeenCalledTimes(1);
    });

    it('should not fetch more when already loading', async () => {
        const fetchHandler = jest.fn(() => new Promise(() => {}));
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps(fetchHandler)));

        act(() => result.current.actions.fetchFromStart());
        act(() => result.current.actions.fetchMore());

        expect(fetchHandler).toHaveBeenCalledTimes(1);
    });

    it('should handle fetch error', async () => {
        const fetchHandler = createFailFetch();
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps(fetchHandler)));

        act(() => result.current.actions.fetchFromStart());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toEqual(new Error('Failed'));
    });

    it('should ignore axios canceled error', async () => {
        mockedAxios.isCancel.mockReturnValue(true);
        const fetchHandler = jest.fn().mockRejectedValue({ message: 'Canceled' });
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps(fetchHandler)));

        act(() => result.current.actions.fetchFromStart());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBeNull();
    });

    it('should reset list', () => {
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps()));

        act(() => result.current.actions.resetList());

        expect(mockEntityActions.set).toHaveBeenCalledWith([]);
        expect(result.current.hasMore).toBe(true);
        expect(result.current.error).toBeNull();
    });

    it('should delegate entity actions', () => {
        const { result } = renderHook(() => useEntitiesPaginationFetch(createProps()));
        const entity = createEntity(1);

        act(() => result.current.actions.addEntity(entity));
        act(() => result.current.actions.updateEntity(entity));
        act(() => result.current.actions.removeEntity(1));

        expect(mockEntityActions.add).toHaveBeenCalledWith(entity);
        expect(mockEntityActions.update).toHaveBeenCalledWith(entity);
        expect(mockEntityActions.remove).toHaveBeenCalledWith(1);
    });

    it('should auto fetch when dependencies change', async () => {
        const fetchHandler = createSuccessFetch(createPaginationResult([], 0));
        const { rerender } = renderHook(
            ({ deps }) =>
                useEntitiesPaginationFetch({
                    ...createProps(fetchHandler, true),
                    autoFetchDependencies: [deps],
                }),
            { initialProps: { deps: 'initial' } },
        );

        await waitFor(() => expect(fetchHandler).toHaveBeenCalledTimes(0));

        rerender({ deps: 'changed' });

        await waitFor(() => expect(fetchHandler).toHaveBeenCalledTimes(1));
    });

    it('should not auto fetch when disabled', async () => {
        const fetchHandler = createSuccessFetch(createPaginationResult([], 0));
        const { rerender } = renderHook(
            ({ deps }) =>
                useEntitiesPaginationFetch({
                    ...createProps(fetchHandler, false),
                    autoFetchDependencies: [deps],
                }),
            { initialProps: { deps: 'initial' } },
        );

        rerender({ deps: 'changed' });

        await waitFor(() => expect(fetchHandler).not.toHaveBeenCalled());
    });

    it('should use custom page size', async () => {
        const fetchHandler = createSuccessFetch(createPaginationResult([], 0));
        const { result } = renderHook(() =>
            useEntitiesPaginationFetch({
                ...createProps(fetchHandler),
                pageSize: 5,
            }),
        );

        act(() => result.current.actions.fetchFromStart());

        await waitFor(() =>
            expect(fetchHandler).toHaveBeenCalledWith({
                offset: 0,
                limit: 5,
                requestOptions: { cancellationSignal: expect.any(AbortSignal) },
            }),
        );
    });
});
