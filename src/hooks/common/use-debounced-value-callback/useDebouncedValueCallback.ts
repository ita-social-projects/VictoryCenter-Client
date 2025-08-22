import { useEffect } from 'react';

export interface UseDebouncedValueCallbackProps<T> {
    value: T;
    delayMs: number;
    callback: (value: T) => void;
    isDisabled?: boolean;
}

export const useDebouncedValueCallback = <T>({
    value,
    delayMs,
    callback,
    isDisabled = false,
}: UseDebouncedValueCallbackProps<T>): void => {
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        const handler = setTimeout(() => {
            callback(value);
        }, delayMs);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delayMs, callback, isDisabled]);
};
