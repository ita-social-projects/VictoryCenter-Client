import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { Button } from '@/components/admin/button/Button';
import { Modal } from '@/components/common/modal/Modal';
import './ConfirmationModal.scss';

export interface ConfirmationModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content?: string | null;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isButtonsDisabled?: boolean;
    className?: string;
}

export const ConfirmationModal = ({
    isOpen,
    onClose,
    title,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    content = null,
    isButtonsDisabled = false,
    className,
}: ConfirmationModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className={className}>
            <Modal.Title>{title}</Modal.Title>
            <Modal.Content>{content && <p>{content}</p>}</Modal.Content>
            <Modal.Actions>
                <Button
                    onClick={onCancel}
                    buttonStyle="secondary"
                    disabled={isButtonsDisabled}
                    className="confirmation-btn"
                >
                    {cancelText || COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button
                    onClick={onConfirm}
                    buttonStyle="primary"
                    disabled={isButtonsDisabled}
                    className="confirmation-btn"
                >
                    {confirmText || COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
