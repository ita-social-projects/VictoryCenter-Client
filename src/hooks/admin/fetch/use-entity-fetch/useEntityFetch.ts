import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { RequestOptions } from '../../../../types/common/api';
import { IdentityEntity } from '../../../../types/common/entity';
import axios from 'axios';

export interface EntityFetchActions<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    refetch: () => void;
    updateEntity: (updatedEntity: TEntity) => void;
    resetEntity: () => void;
}

export interface UseEntityFetchResult<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    entity: TEntity | null;
    isLoading: boolean;
    error: any | null;
    actions: EntityFetchActions<TEntity, TIdValue>;
}

export interface UseEntityFetchProps<TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string> {
    fetchEntityHandler: (entityId: TIdValue, apiOptions: RequestOptions) => Promise<TEntity | null>;
    entityId: TIdValue | null | undefined;
}

export const useEntityFetch = <TEntity extends IdentityEntity<TIdValue>, TIdValue = number | string>({
    fetchEntityHandler,
    entityId,
}: UseEntityFetchProps<TEntity, TIdValue>): UseEntityFetchResult<TEntity, TIdValue> => {
    const [entity, setEntity] = useState<TEntity | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const abortControllerRef = useRef<AbortController | null>(null);

    const resetEntity = useCallback(() => {
        setEntity(null);
        setError(null);
    }, []);

    const updateEntity = useCallback((updatedEntity: TEntity) => {
        setEntity(updatedEntity);
    }, []);

    const fetchEntity = useCallback(
        async (id: TIdValue) => {
            abortControllerRef.current?.abort();
            const newAbortController = new AbortController();
            abortControllerRef.current = newAbortController;

            setIsLoading(true);
            setError(null);

            const apiOptions: RequestOptions = { cancellationSignal: newAbortController.signal };

            try {
                const result = await fetchEntityHandler(id, apiOptions);

                if (newAbortController.signal.aborted) return;

                setEntity(result);
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
        [fetchEntityHandler],
    );

    const refetch = useCallback(() => {
        if (entityId != null) {
            fetchEntity(entityId);
        }
    }, [entityId, fetchEntity]);

    // Cleanup on unmount
    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    const actions = useMemo(
        () => ({
            refetch,
            updateEntity,
            resetEntity,
        }),
        [refetch, updateEntity, resetEntity],
    );

    return {
        entity: entity,
        isLoading: isLoading,
        error: error,
        actions: actions,
    };
};
