import { useEffect, useRef } from 'react';

interface UseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const useModal = ({ isOpen, onClose }: UseModalProps) => {
    const mouseDownInsideModal = useRef(false);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = prevOverflow;
        };
    }, [isOpen, onClose]);

    useEffect(() => {
        if (!isOpen || !modalRef.current) return;

        const modalEl = modalRef.current;

        const getFocusableElements = () =>
            Array.from(
                modalEl.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                ),
            ).filter((el) => !el.hasAttribute('disabled') && el.tabIndex !== -1);

        const focusables = getFocusableElements();
        if (focusables.length > 0) {
            focusables[0].focus();
        }

        const trapFocus = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const focusablesNow = getFocusableElements();
            if (focusablesNow.length === 0) return;

            const first = focusablesNow[0];
            const last = focusablesNow[focusablesNow.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                }
            } else {
                if (document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        };

        modalEl.addEventListener('keydown', trapFocus);

        return () => {
            modalEl.removeEventListener('keydown', trapFocus);
        };
    }, [isOpen]);

    const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement> | React.KeyboardEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget && !mouseDownInsideModal.current) {
            onClose();
        }
        mouseDownInsideModal.current = false;
    };

    const handleOnMouseDownModal = () => {
        mouseDownInsideModal.current = true;
    };

    const handleMouseDownOverlay = (e: React.MouseEvent<HTMLDivElement>) => {
        if (e.target === e.currentTarget) {
            mouseDownInsideModal.current = false;
        }
    };

    return {
        modalRef,
        handleOverlayClick,
        handleOnMouseDownModal,
        handleMouseDownOverlay,
    };
};
