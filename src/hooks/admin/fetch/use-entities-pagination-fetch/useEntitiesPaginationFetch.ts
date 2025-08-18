import { useState, useCallback, useRef, useEffect } from 'react';
import { useIdentityEntitiesCrud } from '../../../common/use-identity-entities-crud/useIdentityEntitiesCrud';
import { RequestOptions } from '../../../../types/common/api';
import { PaginationResult } from '../../../../types/admin/common';
import { IdentityEntity } from '../../../../types/common/entity';
import axios from 'axios';

export interface EntitiesPaginationActions<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    fetchMore: () => void;
    fetchFromStart: () => void;
    addEntity: (newEntity: TEntity) => void;
    updateEntity: (updatedEntity: TEntity) => void;
    removeEntity: (entityId: TIdValue) => void;
    resetList: () => void;
}

export interface PaginationRequestParams {
    offset: number;
    limit: number;
    requestOptions: RequestOptions;
}

export interface UseEntitiesPaginationFetchResult<
    TEntity extends IdentityEntity<TIdValue>,
    TIdValue = number | string,
> {
    entities: TEntity[];
    isLoading: boolean;
    hasMore: boolean;
    error: any | null;
    actions: EntitiesPaginationActions<TEntity, TIdValue>;
}

export interface useEntitiesPaginationFetchProps<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    fetchEntitiesHandler: (paginationParams: PaginationRequestParams) => Promise<PaginationResult<TEntity>>;
    autoFetchDependencies: any[];
    autoFetchDisabled: boolean;
    pageSize?: number;
    customAddEntityHandler?: (prev: TEntity[], newEntity: TEntity) => TEntity[];
    customUpdateEntityHandler?: (prev: TEntity[], updatedEntity: TEntity) => TEntity[];
    customRemoveEntityHandler?: (prev: TEntity[], entityId: TIdValue) => TEntity[];
}

export const useEntitiesPaginationFetch = <TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string>({
    fetchEntitiesHandler,
    autoFetchDependencies = [],
    autoFetchDisabled = false,
    pageSize = 10,
    customAddEntityHandler,
    customUpdateEntityHandler,
    customRemoveEntityHandler,
}: useEntitiesPaginationFetchProps<TEntity, TIdValue>): UseEntitiesPaginationFetchResult<TEntity, TIdValue> => {
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const currentPageRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const totalItemsCountRef = useRef<number | null>(null);
    const isInitialMountRef = useRef(true);

    const { entities, actions: entityActions } = useIdentityEntitiesCrud<TEntity, TIdValue>({
        customAddEntityHandler,
        customUpdateEntityHandler,
        customRemoveEntityHandler,
    });

    const resetList = useCallback(() => {
        entityActions.set([]);
        setHasMore(true);
        setError(null);
        currentPageRef.current = 0;
    }, [entityActions.set]);

    const fetchEntities = useCallback(
        async (isReset: boolean) => {
            abortControllerRef.current?.abort();
            const newAbortController = new AbortController();
            abortControllerRef.current = newAbortController;

            setIsLoading(true);
            setError(null);
            if (isReset) {
                entityActions.set([]);
            }

            try {
                const pageToFetch = isReset ? 0 : currentPageRef.current;
                const paginationParams: PaginationRequestParams = {
                    offset: pageToFetch * pageSize,
                    limit: pageSize,
                    requestOptions: { cancellationSignal: newAbortController.signal },
                };

                const result = await fetchEntitiesHandler(paginationParams);

                if (newAbortController.signal.aborted) return;

                totalItemsCountRef.current = result.totalItemsCount;

                entityActions.set((prev) => {
                    const itemsToSet = isReset
                        ? result.items
                        : [...prev, ...result.items.filter((item) => !prev.some((e) => e.id === item.id))];
                    setHasMore(itemsToSet.length < result.totalItemsCount);
                    return itemsToSet;
                });

                currentPageRef.current = pageToFetch + 1;
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
        },
        [pageSize, fetchEntitiesHandler, entityActions.set],
    );

    const fetchMore = useCallback(() => {
        if (isLoading || !hasMore) {
            return;
        }
        fetchEntities(false);
    }, [isLoading, hasMore, fetchEntities]);

    const fetchFromStart = useCallback(() => {
        fetchEntities(true);
    }, [fetchEntities]);

    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }

        if (autoFetchDisabled) {
            return;
        }

        fetchFromStart();
    }, [...autoFetchDependencies, autoFetchDisabled, fetchFromStart]);

    // Cleanup on unmount
    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    return {
        entities: entities,
        isLoading: isLoading,
        hasMore: hasMore,
        error: error,
        actions: {
            fetchMore: fetchMore,
            fetchFromStart: fetchFromStart,
            addEntity: entityActions.add,
            updateEntity: entityActions.update,
            removeEntity: entityActions.remove,
            resetList: resetList,
        },
    };
};
