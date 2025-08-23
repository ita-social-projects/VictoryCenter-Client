import React, { useEffect } from 'react';

export interface UseOnClickOutsideProps<T extends HTMLElement> {
    ignoreClickRefs: React.RefObject<T | null>[];
    onOutsideClick: (event: Event) => void;
    isDisabled?: boolean;
}

export const useOnClickOutside = <T extends HTMLElement = HTMLElement>({
    ignoreClickRefs,
    onOutsideClick,
    isDisabled = false,
}: UseOnClickOutsideProps<T>): void => {
    useEffect(() => {
        if (isDisabled) {
            return;
        }

        const handleClickOutside = (event: Event) => {
            const isClickInside = ignoreClickRefs.some((ref) => ref.current?.contains(event.target as Node));

            if (isClickInside) {
                return;
            }

            onOutsideClick(event);
        };

        // Listen for both mousedown (desktop) and touchstart (mobile) events
        // to ensure the hook works across all devices.
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('touchstart', handleClickOutside);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isDisabled, ignoreClickRefs, onOutsideClick]);
};
