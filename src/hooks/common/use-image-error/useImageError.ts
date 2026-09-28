import { useEffect, useRef, useState } from 'react';

export interface UseImageErrorProps {
    resetKey?: number;
}

export const useImageError = ({ resetKey }: UseImageErrorProps = {}) => {
    const [error, setError] = useState<string>('');
    const isFirstRender = useRef(true);

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        setError('');
    }, [resetKey]);

    const handleSetError = (errorMessage: string | null) => {
        setError(errorMessage || '');
    };

    return { error, handleSetError };
};
