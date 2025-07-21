import React, {ReactNode, useEffect} from "react";
import "./modal.scss";

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

    if (!isOpen) return null;

    const modalStyle = {
        width: typeof width === 'number' ? `${width}px` : width,
        maxWidth: maxWidth
    };

    return (
        <div role={"toolbar"} data-testid="modal-overlay" className="modal-overlay" onClick={onClose} onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                onClose();
            }
        }}>
            <div
                role={"toolbar"}
                className="modal-container"
                style={modalStyle}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.stopPropagation();
                    }
                }}
            >
                <div className="modal-header">
                    <div className='close-icon'>
                        <button onClick={onClose}/>
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
    );
}

Modal.Title = ({children}: { children: React.ReactNode }) => <>{children}</>;
Modal.Content = ({children}: { children: React.ReactNode }) => <>{children}</>;
Modal.Actions = ({children}: { children: React.ReactNode }) => <>{children}</>;

export default Modal;
