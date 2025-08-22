import { useEffect } from 'react';

export interface UseDebouncedValueCallbackProps<T> {
    value: T;
    delay: number;
    callback: (value: T) => void;
    isDisabled?: boolean;
}

export const useDebouncedValueCallback = <T>({
    value,
    delay,
    callback,
    isDisabled = false,
}: UseDebouncedValueCallbackProps<T>): void => {
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        const handler = setTimeout(() => {
            callback(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay, callback, isDisabled]);
};
