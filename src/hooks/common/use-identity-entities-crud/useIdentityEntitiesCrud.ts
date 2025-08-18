import { useState, useCallback, useMemo, Dispatch, SetStateAction } from 'react';
import { IdentityEntity } from '../../../types/common/entity';

interface IdentityEntitiesCrudActions<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    add: (newEntity: TEntity) => void;
    update: (updatedEntity: TEntity) => void;
    remove: (entityId: TIdValue) => void;
    set: Dispatch<SetStateAction<TEntity[]>>;
}

interface useIdentityEntitiesCrudResult<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    entities: TEntity[];
    actions: IdentityEntitiesCrudActions<TEntity, TIdValue>;
}

interface useIdentityEntitiesCrudProps<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    initialEntities?: TEntity[];
    customAddEntityHandler?: (prev: TEntity[], newEntity: TEntity) => TEntity[];
    customUpdateEntityHandler?: (prev: TEntity[], updatedEntity: TEntity) => TEntity[];
    customRemoveEntityHandler?: (prev: TEntity[], entityId: TIdValue) => TEntity[];
}

export const useIdentityEntitiesCrud = <TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string>({
    initialEntities = [],
    customAddEntityHandler,
    customUpdateEntityHandler,
    customRemoveEntityHandler,
}: useIdentityEntitiesCrudProps<TEntity, TIdValue> = {}): useIdentityEntitiesCrudResult<TEntity, TIdValue> => {
    const [entities, setEntities] = useState<TEntity[]>(initialEntities);

    const add = useCallback(
        (newEntity: TEntity) => {
            setEntities((prev) => {
                if (customAddEntityHandler) {
                    return customAddEntityHandler(prev, newEntity);
                }
                return [...prev, newEntity];
            });
        },
        [customAddEntityHandler],
    );

    const update = useCallback(
        (updatedEntity: TEntity) => {
            setEntities((prev) => {
                if (customUpdateEntityHandler) {
                    return customUpdateEntityHandler(prev, updatedEntity);
                }
                return prev.map((e) => (e.id === updatedEntity.id ? updatedEntity : e));
            });
        },
        [customUpdateEntityHandler],
    );

    const remove = useCallback(
        (entityId: TIdValue) => {
            setEntities((prev) => {
                if (customRemoveEntityHandler) {
                    return customRemoveEntityHandler(prev, entityId);
                }
                return prev.filter((e) => e.id !== entityId);
            });
        },
        [customRemoveEntityHandler],
    );

    const actions = useMemo<IdentityEntitiesCrudActions<TEntity, TIdValue>>(
        () => ({
            add: add,
            update: update,
            remove: remove,
            set: setEntities,
        }),
        [add, update, remove, setEntities],
    );

    return {
        entities: entities,
        actions: actions,
    };
};
