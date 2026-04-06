import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { Button } from '@/components/admin/button/Button';
import { Modal } from '@/components/common/modal/Modal';
import styles from './DeleteRecordModal.module.scss';

export interface DeleteRecordModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    isButtonsDisabled?: boolean;
}

export const DeleteRecordModal = ({
    isOpen,
    onClose,
    title,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    isButtonsDisabled = false,
}: DeleteRecordModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose} className={styles['delete-record-modal']}>
            <Modal.Title>{title}</Modal.Title>
            <Modal.Actions>
                <div className={styles['delete-record-actions']}>
                    <Button buttonStyle="secondary" onClick={onCancel} disabled={isButtonsDisabled}>
                        {cancelText || COMMON_TEXT_ADMIN.BUTTON.NO}
                    </Button>
                    <Button buttonStyle="primary" onClick={onConfirm} disabled={isButtonsDisabled}>
                        {confirmText || COMMON_TEXT_ADMIN.BUTTON.YES}
                    </Button>
                </div>
            </Modal.Actions>
        </Modal>
    );
};
