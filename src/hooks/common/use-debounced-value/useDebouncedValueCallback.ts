import { useEffect } from 'react';

export interface UseDebouncedValueCallbackProps<T> {
    value: T;
    delay: number;
    callback: (value: T) => void;
    disableWhen?: boolean;
}

export const useDebouncedValueCallback = <T>({
    value,
    delay,
    callback,
    disableWhen = false,
}: UseDebouncedValueCallbackProps<T>): void => {
    useEffect(() => {
        if (disableWhen) {
            return;
        }

        const handler = setTimeout(() => {
            callback(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay, callback, disableWhen]);
};
