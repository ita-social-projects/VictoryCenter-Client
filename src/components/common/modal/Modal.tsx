import React, { ReactNode, useEffect, useId, useRef } from 'react';
import './Modal.scss';

interface ModalProps {
    children?: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    maxWidth?: string;
}

export const Modal = ({ children, isOpen, onClose, maxWidth }: ModalProps) => {
    const mouseDownInsideModal = useRef(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const titleId = useId();

    const title = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Modal.Title,
    );
    const content = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Modal.Content,
    );
    const actions = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Modal.Actions,
    );

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

    if (!isOpen) return null;

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

    return (
        <div
            data-testid="modal-overlay"
            className="modal-overlay"
            onClick={handleOverlayClick}
            onMouseDown={handleMouseDownOverlay}
            tabIndex={0}
            role="button"
            onKeyDown={handleOverlayClick}
        >
            <div
                ref={modalRef}
                role="button"
                aria-labelledby={titleId}
                className="modal-container"
                onMouseDown={handleOnMouseDownModal}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                tabIndex={-1}
                style = {{maxWidth: maxWidth}}
            >
                <div className="modal-header">
                    <div className="close-icon">
                        <button onClick={onClose} aria-label="Close modal" type="button" />
                    </div>
                    <div className="modal-title-wrapper">
                        <span id={titleId} className="modal-header-text">
                            {title}
                        </span>
                    </div>
                </div>
                <div className="modal-body">{content}</div>
                <div className="modal-footer">{actions}</div>
            </div>
        </div>
    );
};

Modal.Title = ({ children }: { children: React.ReactNode }) => <>{children}</>;
Modal.Content = ({ children }: { children: React.ReactNode }) => <>{children}</>;
Modal.Actions = ({ children }: { children: React.ReactNode }) => <>{children}</>;
