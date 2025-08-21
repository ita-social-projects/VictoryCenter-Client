import { useState, useCallback, useRef, useEffect, Dispatch, SetStateAction } from 'react';
import { RequestOptions } from '../../../../types/common/api';
import { PaginationResult } from '../../../../types/admin/common';
import axios from 'axios';

export interface PaginationRequestParams {
    offset: number;
    limit: number;
    requestOptions: RequestOptions;
}

export interface UseDataPaginationFetchResult<TResult> {
    data: TResult[];
    isLoading: boolean;
    hasMore: boolean;
    error: any | null;
    fetchMore: () => void;
    fetchFromStart: () => void;
    setData: Dispatch<SetStateAction<TResult[]>>;
    resetList: () => void;
}

export interface useDataPaginationFetchProps<TResult> {
    initialData: TResult[];
    fetchHandler: (paginationParams: PaginationRequestParams) => Promise<PaginationResult<TResult>>;
    autoFetchDependencies?: any[];
    autoFetchDisabled?: boolean;
    getUniqueId?: (item: TResult) => string | number;
    pageSize?: number;
}

export const useDataPaginationFetch = <TResult>({
    initialData = [],
    fetchHandler,
    getUniqueId,
    autoFetchDependencies = [],
    autoFetchDisabled = false,
    pageSize = 10,
}: useDataPaginationFetchProps<TResult>): UseDataPaginationFetchResult<TResult> => {
    const [fetchedData, setFetchedData] = useState<TResult[]>(initialData);
    const [hasMore, setHasMore] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const currentPageRef = useRef(0);
    const abortControllerRef = useRef<AbortController | null>(null);
    const totalItemsCountRef = useRef<number | null>(null);
    const isInitialMountRef = useRef(true);

    const resetList = useCallback(() => {
        setFetchedData([]);
        setHasMore(true);
        setError(null);
        currentPageRef.current = 0;
        totalItemsCountRef.current = null;
    }, []);

    const fetchEntities = useCallback(
        async (isReset: boolean) => {
            abortControllerRef.current?.abort();
            const newAbortController = new AbortController();
            abortControllerRef.current = newAbortController;

            setIsLoading(true);
            setError(null);
            if (isReset) {
                setFetchedData([]);
                currentPageRef.current = 0;
            }

            try {
                const pageToFetch = isReset ? 0 : currentPageRef.current;
                const paginationParams: PaginationRequestParams = {
                    offset: pageToFetch * pageSize,
                    limit: pageSize,
                    requestOptions: { cancellationSignal: newAbortController.signal },
                };

                const result = await fetchHandler(paginationParams);

                if (newAbortController.signal.aborted) return;

                totalItemsCountRef.current = result.totalItemsCount;

                const totalFetchedPages = pageToFetch + 1;
                const maxPossibleItems = totalFetchedPages * pageSize;
                const newHasMore = maxPossibleItems < result.totalItemsCount;

                setFetchedData((prev) => {
                    if (isReset) {
                        return result.items;
                    }

                    if (getUniqueId) {
                        const existingIds = new Set(prev.map((item) => getUniqueId(item)));
                        const uniqueItems = result.items.filter((item) => !existingIds.has(getUniqueId(item)));
                        return [...prev, ...uniqueItems];
                    }

                    return [...prev, ...result.items];
                });

                setHasMore(newHasMore);
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
        [getUniqueId, pageSize, fetchHandler],
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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetchDisabled, fetchFromStart, ...autoFetchDependencies]);

    // Cleanup on unmount
    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    return {
        data: fetchedData,
        isLoading,
        hasMore,
        error,
        fetchMore,
        fetchFromStart,
        setData: setFetchedData,
        resetList,
    };
};
