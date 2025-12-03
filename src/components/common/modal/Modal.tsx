import React, { ReactNode, useId } from 'react';
import './Modal.scss';
import { useModal } from '../../../hooks/admin/use-modal/UseModal';

export interface ModalProps {
    children?: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    fullScreen?: boolean;
}

export const Modal = ({ children, isOpen, onClose, fullScreen = false }: ModalProps) => {
    const titleId = useId();

    const { modalRef, handleOverlayClick, handleOnMouseDownModal, handleMouseDownOverlay } = useModal({
        isOpen,
        onClose,
    });

    const title = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Modal.Title,
    );
    const content = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Modal.Content,
    );
    const actions = React.Children.toArray(children).find(
        (child) => React.isValidElement(child) && child.type === Modal.Actions,
    );

    if (!isOpen) return null;

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
                className={`modal-container ${fullScreen ? 'fullscreen' : ''}`}
                onMouseDown={handleOnMouseDownModal}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => e.stopPropagation()}
                tabIndex={-1}
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
