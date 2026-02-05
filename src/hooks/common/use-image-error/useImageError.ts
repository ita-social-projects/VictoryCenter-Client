import { useState } from 'react';

export const useImageError = () => {
    const [error, setError] = useState<string>('');

    const handleSetError = (errorMessage: string | null) => {
        setError(errorMessage || '');
    };

    return { error, handleSetError };
};
