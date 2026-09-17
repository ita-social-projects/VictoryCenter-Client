import { useEffect, useState } from 'react';

export interface UseImageErrorProps {
    resetKey?: number;
}

export const useImageError = ({ resetKey }: UseImageErrorProps = {}) => {
    const [error, setError] = useState<string>('');

    useEffect(() => {
        setError('');
    }, [resetKey]);

    const handleSetError = (errorMessage: string | null) => {
        setError(errorMessage || '');
    };

    return { error, handleSetError };
};
