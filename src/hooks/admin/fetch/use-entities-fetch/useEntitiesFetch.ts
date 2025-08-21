import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction, useMemo } from 'react';
import { useIdentityEntitiesCrud } from '../../../common/use-identity-entities-crud/useIdentityEntitiesCrud';
import { RequestOptions } from '../../../../types/common/api';
import { IdentityEntity } from '../../../../types/common/entity';
import axios from 'axios';

export interface EntitiesActions<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    refetch: () => void;
    addEntity: (newEntity: TEntity) => void;
    updateEntity: (updatedEntity: TEntity) => void;
    removeEntity: (entityId: TIdValue) => void;
    setEntities: Dispatch<SetStateAction<TEntity[]>>;
    resetList: () => void;
}

export interface UseEntitiesFetchResult<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    entities: TEntity[];
    isLoading: boolean;
    error: any | null;
    actions: EntitiesActions<TEntity, TIdValue>;
}

export interface useEntitiesFetchProps<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    fetchEntitiesHandler: (apiOptions: RequestOptions) => Promise<TEntity[]>;
    autoFetchDependencies?: any[];
    autoFetchDisabled?: boolean;
    customAddEntityHandler?: (prev: TEntity[], newEntity: TEntity) => TEntity[];
    customUpdateEntityHandler?: (prev: TEntity[], updatedEntity: TEntity) => TEntity[];
    customRemoveEntityHandler?: (prev: TEntity[], entityId: TIdValue) => TEntity[];
}

export const useEntitiesFetch = <TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string>({
    fetchEntitiesHandler,
    autoFetchDependencies = [],
    autoFetchDisabled = false,
    customAddEntityHandler,
    customUpdateEntityHandler,
    customRemoveEntityHandler,
}: useEntitiesFetchProps<TEntity, TIdValue>): UseEntitiesFetchResult<TEntity, TIdValue> => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isInitialMountRef = useRef(true);

    const { entities, actions: entityActions } = useIdentityEntitiesCrud<TEntity, TIdValue>({
        customAddEntityHandler,
        customUpdateEntityHandler,
        customRemoveEntityHandler,
    });

    const resetList = useCallback(() => {
        entityActions.set([]);
        setError(null);
    }, [entityActions]);

    const fetchEntities = useCallback(async () => {
        abortControllerRef.current?.abort();
        const newAbortController = new AbortController();
        abortControllerRef.current = newAbortController;

        setIsLoading(true);
        setError(null);

        const apiOptions: RequestOptions = { cancellationSignal: newAbortController.signal };

        try {
            const result = await fetchEntitiesHandler(apiOptions);

            if (newAbortController.signal.aborted) return;

            entityActions.set(result);
        } catch (error: any) {
            if (axios.isCancel?.(error) || error.name === 'CanceledError' || error.name === 'AbortError') {
                return;
            }
            setError(error);
        } finally {
            if (!newAbortController.signal.aborted) {
                setIsLoading(false);
            }
        }
    }, [fetchEntitiesHandler, entityActions]);

    const refetch = useCallback(() => {
        fetchEntities();
    }, [fetchEntities]);

    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }

        if (autoFetchDisabled) {
            return;
        }

        refetch();
    }, [autoFetchDisabled, refetch, ...autoFetchDependencies]);

    useEffect(() => {
        if (!autoFetchDisabled) {
            fetchEntities();
        }
    }, [autoFetchDisabled, fetchEntities]);

    // Cleanup on unmount
    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    const actions = useMemo<EntitiesActions<TEntity, TIdValue>>(
        () => ({
            refetch: refetch,
            addEntity: entityActions.add,
            updateEntity: entityActions.update,
            removeEntity: entityActions.remove,
            setEntities: entityActions.set,
            resetList: resetList,
        }),
        [entityActions, refetch, resetList],
    );

    return {
        entities: entities,
        isLoading: isLoading,
        error: error,
        actions: actions,
    };
};
