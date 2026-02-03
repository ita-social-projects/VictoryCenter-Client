import { useState, useRef, useEffect } from 'react';

export interface UseTemporaryWarningOptions {
    onWarningChange?: (warning: string | null) => void;
    warningDuration?: number;
}

export const useTemporaryWarning = ({ onWarningChange, warningDuration = 2000 }: UseTemporaryWarningOptions = {}) => {
    const [localWarning, setLocalWarning] = useState<string | null>(null);
    const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        return () => {
            if (warningTimerRef.current) {
                clearTimeout(warningTimerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        onWarningChange?.(localWarning);
    }, [localWarning, onWarningChange]);

    const showTemporaryWarning = (text: string) => {
        setLocalWarning(text);

        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
        }

        warningTimerRef.current = setTimeout(() => {
            setLocalWarning(null);
            warningTimerRef.current = null;
        }, warningDuration);
    };

    const clearWarning = () => {
        setLocalWarning(null);
        if (warningTimerRef.current) {
            clearTimeout(warningTimerRef.current);
            warningTimerRef.current = null;
        }
    };

    return {
        localWarning,
        showTemporaryWarning,
        clearWarning,
    };
};
