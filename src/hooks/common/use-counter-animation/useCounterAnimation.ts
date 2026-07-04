import { useEffect, useRef, useState } from 'react';

const COUNTER_DURATION_MS = 1800;

export const useCounterAnimation = (
    targetValue: number,
    isVisible: boolean,
    duration = COUNTER_DURATION_MS,
): number => {
    const [displayValue, setDisplayValue] = useState(0);
    const animatedRef = useRef(false);
    const rafIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!isVisible || animatedRef.current) return;
        animatedRef.current = true;

        let startTime: number | null = null;

        const animate = (currentTime: number) => {
            if (startTime === null) startTime = currentTime;

            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            setDisplayValue(Math.round(targetValue * progress));

            if (progress < 1) {
                rafIdRef.current = requestAnimationFrame(animate);
            }
        };

        rafIdRef.current = requestAnimationFrame(animate);

        return () => {
            if (rafIdRef.current !== null) {
                cancelAnimationFrame(rafIdRef.current);
            }
        };
    }, [isVisible, targetValue, duration]);

    return displayValue;
};
