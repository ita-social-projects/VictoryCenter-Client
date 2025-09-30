import { useState, useCallback, useRef, useEffect, SetStateAction, Dispatch } from 'react';
import { RequestOptions } from '../../../types/common/api';
import axios from 'axios';

export interface UseDataFetchResult<TResult> {
    data: TResult;
    isLoading: boolean;
    error: any | null;
    refetch: () => void;
    setData: Dispatch<SetStateAction<TResult>>;
}

export interface useDataFetchProps<TResult> {
    initialData: TResult;
    fetchHandler: (options: RequestOptions) => Promise<TResult>;
    autoFetchDependencies?: any[];
    autoFetchDisabled?: boolean;
}

export const useDataFetch = <TResult>({
    initialData,
    fetchHandler,
    autoFetchDependencies = [],
    autoFetchDisabled = false,
}: useDataFetchProps<TResult>): UseDataFetchResult<TResult> => {
    const [fetchedData, setFetchedData] = useState<TResult>(initialData);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);
    const isInitialMountRef = useRef(true);

    const fetchData = useCallback(async () => {
        abortControllerRef.current?.abort();
        const newAbortController = new AbortController();
        abortControllerRef.current = newAbortController;

        setIsLoading(true);
        setError(null);

        const apiOptions: RequestOptions = { cancellationSignal: newAbortController.signal };

        try {
            const result = await fetchHandler(apiOptions);

            if (newAbortController.signal.aborted) return;

            setFetchedData(result);
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
    }, [fetchHandler]);

    useEffect(() => {
        if (isInitialMountRef.current) {
            isInitialMountRef.current = false;
            return;
        }

        if (autoFetchDisabled) {
            return;
        }

        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoFetchDisabled, fetchData, ...autoFetchDependencies]);

    // Cleanup on unmount
    useEffect(() => {
        return () => abortControllerRef.current?.abort();
    }, []);

    return {
        data: fetchedData,
        isLoading: isLoading,
        error: error,
        refetch: fetchData,
        setData: setFetchedData,
    };
};
