import { renderHook, act } from '@testing-library/react';
import { useIdentityEntitiesCrud } from './useIdentityEntitiesCrud';

interface TestEntity {
    id: number;
    name: string;
}

// Helper functions
const createEntity = (id: number, name: string): TestEntity => ({ id, name });
const createEntities = (count: number): TestEntity[] =>
    Array.from({ length: count }, (_, i) => createEntity(i + 1, `Entity ${i + 1}`));

describe('useEntitiesBase', () => {
    it('should initialize with empty array by default', () => {
        const { result } = renderHook(() => useIdentityEntitiesCrud<TestEntity>());

        expect(result.current.entities).toEqual([]);
    });

    it('should initialize with provided initial entities', () => {
        const initialEntities = createEntities(2);
        const { result } = renderHook(() => useIdentityEntitiesCrud({ initialEntities }));

        expect(result.current.entities).toEqual(initialEntities);
    });

    it('should add entity to the beginning of the list', () => {
        const { result } = renderHook(() => useIdentityEntitiesCrud<TestEntity>());
        const newEntity = createEntity(1, 'New Entity');

        act(() => {
            result.current.actions.add(newEntity);
        });

        expect(result.current.entities).toEqual([newEntity]);
    });

    it('should add multiple entities to the beginning', () => {
        const { result } = renderHook(() => useIdentityEntitiesCrud<TestEntity>());
        const entity1 = createEntity(1, 'Entity 1');
        const entity2 = createEntity(2, 'Entity 2');

        act(() => {
            result.current.actions.add(entity1);
            result.current.actions.add(entity2);
        });

        expect(result.current.entities).toEqual([entity1, entity2]);
    });

    it('should update existing entity', () => {
        const initialEntities = createEntities(2);
        const { result } = renderHook(() => useIdentityEntitiesCrud({ initialEntities }));
        const updatedEntity = { id: 1, name: 'Updated Entity' };

        act(() => {
            result.current.actions.update(updatedEntity);
        });

        expect(result.current.entities[0]).toEqual(updatedEntity);
        expect(result.current.entities[1]).toEqual(initialEntities[1]);
    });

    it('should not change entities when updating non-existent entity', () => {
        const initialEntities = createEntities(2);
        const { result } = renderHook(() => useIdentityEntitiesCrud({ initialEntities }));
        const nonExistentEntity = createEntity(999, 'Non-existent');

        act(() => {
            result.current.actions.update(nonExistentEntity);
        });

        expect(result.current.entities).toEqual(initialEntities);
    });

    it('should remove entity by id', () => {
        const initialEntities = createEntities(3);
        const { result } = renderHook(() => useIdentityEntitiesCrud({ initialEntities }));

        act(() => {
            result.current.actions.remove(2);
        });

        expect(result.current.entities).toHaveLength(2);
        expect(result.current.entities.find((e) => e.id === 2)).toBeUndefined();
    });

    it('should not change entities when removing non-existent id', () => {
        const initialEntities = createEntities(2);
        const { result } = renderHook(() => useIdentityEntitiesCrud({ initialEntities }));

        act(() => {
            result.current.actions.remove(999);
        });

        expect(result.current.entities).toEqual(initialEntities);
    });

    it('should set new entities list', () => {
        const initialEntities = createEntities(2);
        const newEntities = createEntities(3);
        const { result } = renderHook(() => useIdentityEntitiesCrud({ initialEntities }));

        act(() => {
            result.current.actions.set(newEntities);
        });

        expect(result.current.entities).toEqual(newEntities);
    });

    it('should use custom add handler when provided', () => {
        const customAddHandler = jest.fn((prev, entity) => [...prev, entity]);
        const { result } = renderHook(() => useIdentityEntitiesCrud({ customAddEntityHandler: customAddHandler }));
        const newEntity = createEntity(1, 'New Entity');

        act(() => {
            result.current.actions.add(newEntity);
        });

        expect(customAddHandler).toHaveBeenCalledWith([], newEntity);
        expect(result.current.entities).toEqual([newEntity]);
    });

    it('should use custom update handler when provided', () => {
        const initialEntities = createEntities(1);
        const customUpdateHandler = jest.fn((prev: TestEntity[], entity: TestEntity) =>
            prev.map((e: TestEntity) => (e.id === entity.id ? { ...e, ...entity, updated: true } : e)),
        );
        const { result } = renderHook(() =>
            useIdentityEntitiesCrud({
                initialEntities,
                customUpdateEntityHandler: customUpdateHandler,
            }),
        );
        const updatedEntity = createEntity(1, 'Updated');

        act(() => {
            result.current.actions.update(updatedEntity);
        });

        expect(customUpdateHandler).toHaveBeenCalledWith(initialEntities, updatedEntity);
    });

    it('should use custom remove handler when provided', () => {
        const initialEntities = createEntities(2);
        const customRemoveHandler = jest.fn((prev: TestEntity[], id: number) => prev.filter((e) => e.id !== id));
        const { result } = renderHook(() =>
            useIdentityEntitiesCrud({
                initialEntities,
                customRemoveEntityHandler: customRemoveHandler,
            }),
        );

        act(() => {
            result.current.actions.remove(1);
        });

        expect(customRemoveHandler).toHaveBeenCalledWith(initialEntities, 1);
        expect(result.current.entities).toHaveLength(1);
    });

    it('should work with string ids', () => {
        interface StringEntity {
            id: string;
            name: string;
        }

        const entity: StringEntity = { id: 'abc', name: 'String Entity' };
        const { result } = renderHook(() => useIdentityEntitiesCrud<StringEntity, string>());

        act(() => {
            result.current.actions.add(entity);
        });

        expect(result.current.entities).toEqual([entity]);

        act(() => {
            result.current.actions.remove('abc');
        });

        expect(result.current.entities).toEqual([]);
    });
});
