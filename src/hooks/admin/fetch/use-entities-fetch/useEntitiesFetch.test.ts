import { renderHook, act, waitFor } from '@testing-library/react';
import { useEntitiesFetch } from './useEntitiesFetch';
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
const createSuccessFetch = (entities: TestEntity[]) => jest.fn().mockResolvedValue(entities);
const createFailFetch = () => jest.fn().mockRejectedValue(new Error('Failed'));
const createProps = (fetchHandler = jest.fn(), autoFetch = true) => ({
    fetchEntitiesHandler: fetchHandler,
    autoFetchDependencies: [],
    autoFetchDisabled: !autoFetch,
});

describe('useEntitiesFetch', () => {
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
        const { result } = renderHook(() => useEntitiesFetch(createProps(jest.fn(), false)));

        expect(result.current.entities).toEqual([]);
        expect(result.current.isLoading).toBe(false);
        expect(result.current.error).toBeNull();
    });

    it('should auto fetch on mount when not disabled', async () => {
        const entities = createEntities(2);
        const fetchHandler = createSuccessFetch(entities);
        renderHook(() => useEntitiesFetch(createProps(fetchHandler)));

        await waitFor(() => expect(fetchHandler).toHaveBeenCalledTimes(1));
        expect(fetchHandler).toHaveBeenCalledWith({
            cancellationSignal: expect.any(AbortSignal),
        });
    });

    it('should not auto fetch when disabled', async () => {
        const fetchHandler = createSuccessFetch([]);
        renderHook(() => useEntitiesFetch(createProps(fetchHandler, false)));

        await waitFor(() => expect(fetchHandler).not.toHaveBeenCalled());
    });

    it('should fetch entities successfully', async () => {
        const entities = createEntities(2);
        const fetchHandler = createSuccessFetch(entities);
        const { result } = renderHook(() => useEntitiesFetch(createProps(fetchHandler, false)));

        act(() => result.current.actions.refetch());

        expect(result.current.isLoading).toBe(true);

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(mockEntityActions.set).toHaveBeenCalledWith(entities);
        expect(result.current.error).toBeNull();
    });

    it('should handle fetch error', async () => {
        const fetchHandler = createFailFetch();
        const { result } = renderHook(() => useEntitiesFetch(createProps(fetchHandler, false)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toEqual(new Error('Failed'));
    });

    it('should ignore axios canceled error', async () => {
        mockedAxios.isCancel.mockReturnValue(true);
        const fetchHandler = jest.fn().mockRejectedValue({ name: 'Cancel error', message: 'Canceled' });
        const { result } = renderHook(() => useEntitiesFetch(createProps(fetchHandler, false)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBeNull();
    });

    it('should ignore AbortError', async () => {
        const fetchHandler = jest.fn().mockRejectedValue({ name: 'AbortError', message: 'Aborted' });
        const { result } = renderHook(() => useEntitiesFetch(createProps(fetchHandler, false)));

        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(result.current.error).toBeNull();
    });

    it('should reset list', () => {
        const { result } = renderHook(() => useEntitiesFetch(createProps(jest.fn(), false)));

        act(() => result.current.actions.resetList());

        expect(mockEntityActions.set).toHaveBeenCalledWith([]);
        expect(result.current.error).toBeNull();
    });

    it('should delegate entity CRUD actions', () => {
        const { result } = renderHook(() => useEntitiesFetch(createProps(jest.fn(), false)));
        const entity = createEntity(1);
        const entities = createEntities(2);

        act(() => result.current.actions.addEntity(entity));
        act(() => result.current.actions.updateEntity(entity));
        act(() => result.current.actions.removeEntity(1));
        act(() => result.current.actions.setEntities(entities));

        expect(mockEntityActions.add).toHaveBeenCalledWith(entity);
        expect(mockEntityActions.update).toHaveBeenCalledWith(entity);
        expect(mockEntityActions.remove).toHaveBeenCalledWith(1);
        expect(mockEntityActions.set).toHaveBeenCalledWith(entities);
    });

    it('should refetch when dependencies change', async () => {
        const fetchHandler = createSuccessFetch([]);
        const { rerender } = renderHook(
            ({ deps }) =>
                useEntitiesFetch({
                    ...createProps(fetchHandler),
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
        const { rerender } = renderHook(
            ({ deps }) =>
                useEntitiesFetch({
                    ...createProps(fetchHandler, false),
                    autoFetchDependencies: [deps],
                }),
            { initialProps: { deps: 'initial' } },
        );

        rerender({ deps: 'changed' });

        await waitFor(() => expect(fetchHandler).not.toHaveBeenCalled());
    });

    it('should abort previous request on new fetch', async () => {
        const fetchHandler = jest.fn(() => new Promise((resolve) => setTimeout(resolve, 100)));
        const { result } = renderHook(() => useEntitiesFetch(createProps(fetchHandler, false)));

        act(() => result.current.actions.refetch());
        act(() => result.current.actions.refetch());

        await waitFor(() => expect(result.current.isLoading).toBe(false));

        expect(fetchHandler).toHaveBeenCalledTimes(2);
    });

    it('should pass custom handlers to useIdentityEntitiesCrud', () => {
        const customAdd = jest.fn();
        const customUpdate = jest.fn();
        const customRemove = jest.fn();

        renderHook(() =>
            useEntitiesFetch({
                ...createProps(jest.fn(), false),
                customAddEntityHandler: customAdd,
                customUpdateEntityHandler: customUpdate,
                customRemoveEntityHandler: customRemove,
            }),
        );

        expect(mockUseIdentityEntitiesCrud).toHaveBeenCalledWith({
            customAddEntityHandler: customAdd,
            customUpdateEntityHandler: customUpdate,
            customRemoveEntityHandler: customRemove,
        });
    });
});
