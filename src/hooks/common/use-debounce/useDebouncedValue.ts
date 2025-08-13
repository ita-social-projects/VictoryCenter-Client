import { useState, useEffect } from 'react';

export interface UseDebouncedValueProps<T> {
    value: T;
    delay: number;
}

export const useDebouncedValue = <T>({ value, delay }: UseDebouncedValueProps<T>): T => {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};
