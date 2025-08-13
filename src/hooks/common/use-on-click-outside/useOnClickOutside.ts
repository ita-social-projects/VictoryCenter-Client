import React, { useEffect } from 'react';

export interface UseOnClickOutsideProps<T extends HTMLElement> {
    ignoreClickRefs: React.RefObject<T | null>[];
    onClickOutside: (event: Event) => void;
    enabled?: boolean;
}

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>({
    ignoreClickRefs,
    onClickOutside,
    enabled = true,
}: UseOnClickOutsideProps<T>): void => {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        const listener = (event: Event) => {
            const isClickInside = ignoreClickRefs.some((ref) => ref.current?.contains(event.target as Node));

            if (isClickInside) {
                return;
            }

            onClickOutside(event);
        };

        document.addEventListener('mousedown', listener);
        document.addEventListener('touchstart', listener);

        return () => {
            document.removeEventListener('mousedown', listener);
            document.removeEventListener('touchstart', listener);
        };
    }, [ignoreClickRefs, onClickOutside]);
};
