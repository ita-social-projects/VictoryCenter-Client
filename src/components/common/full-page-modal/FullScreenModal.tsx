import React, { ReactNode, useId } from 'react';
import { useModal } from '../../../hooks/admin/use-modal/UseModal';
import './FullScreenModal.scss';

interface FullScreenModalProps {
    children?: ReactNode;
    isOpen: boolean;
    onClose: () => void;
}

export const FullScreenModal = ({ children, isOpen, onClose }: FullScreenModalProps) => {
    const titleId = useId();
    const { modalRef, handleOnMouseDownModal } = useModal({ isOpen, onClose });

    const title = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === FullScreenModal.Title,
    );
    const content = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === FullScreenModal.Content,
    );
    const actions = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === FullScreenModal.Actions,
    );

    if (!isOpen) return null;

    return (
        <div
            data-testid="fullscreen-modal-overlay"
            className="fullscreen-modal-overlay"
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={modalRef}
                className="fullscreen-modal-container"
                onMouseDown={handleOnMouseDownModal}
                role="document"
                aria-labelledby={titleId}
            >
                <div className="fullscreen-modal-close-bar">
                    <button
                        className="fullscreen-modal-close-bar-button"
                        onClick={onClose}
                        aria-label="Close button"
                        type="button"
                    ></button>
                </div>

                <div className="fullscreen-modal-content">{content}</div>

                <div className="fullscreen-modal-footer">{actions}</div>
            </div>
        </div>
    );
};

FullScreenModal.Title = ({ children }: { children?: React.ReactNode }) => <>{children}</>;
FullScreenModal.Content = ({ children }: { children: React.ReactNode }) => <>{children}</>;
FullScreenModal.Actions = ({ children }: { children: React.ReactNode }) => <>{children}</>;
