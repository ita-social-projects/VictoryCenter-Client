import React, {ReactNode, useEffect} from "react";
import "./modal.scss";
import CloseIcon from "../../../assets/icons/close-icon.svg";

interface ModalProps {
    children?: ReactNode;
    isOpen: boolean;
    onClose: () => void;
    width?: string | number;
    maxWidth?: string;
}

export const Modal = ({
                          children,
                          isOpen,
                          onClose,
                          width = "80%",
                          maxWidth = "600px"
                      }: ModalProps) => {

    const title = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === Modal.Title);
    const content = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === Modal.Content);
    const actions = React.Children.toArray(children).find(child => React.isValidElement(child) && child.type === Modal.Actions);

    useEffect(() => {
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
            document.body.style.overflow = 'unset';
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const modalStyle = {
        width: typeof width === 'number' ? `${width}px` : width,
        maxWidth: maxWidth
    };

    return (
        <>
            <div data-testid="modal-overlay" className="modal-overlay" onClick={onClose}>
                <div role={'dialog'}
                    className="modal-container"
                    style={modalStyle}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div className="modal-header">
                        <div className='close-icon'>
                            <img src={CloseIcon} onClick={onClose} alt="close-icon"/>
                        </div>
                        <div className="modal-title-wrapper">
                        <span className='modal-header-text'>
                            {title}
                        </span>
                        </div>
                    </div>
                    <div className="modal-body">{content}</div>
                    <div className="modal-footer">
                        {actions}
                    </div>
                </div>
            </div>
        </>
    );
}

Modal.Title = ({children}: { children: React.ReactNode }) => <>{children}</>;
Modal.Content = ({children}: { children: React.ReactNode }) => <>{children}</>;
Modal.Actions = ({children}: { children: React.ReactNode }) => <>{children}</>;
