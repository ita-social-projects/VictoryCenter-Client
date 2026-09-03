import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface DeleteTeamCategoryConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export const DeleteTeamCategoryConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
}: DeleteTeamCategoryConfirmModalProps) => {
    const handleClose = () => {
        if (isSubmitting) return;
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>{COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY_CONFIRM}</Modal.Title>
            <Modal.Actions>
                <Button buttonStyle="secondary" onClick={handleClose} disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button buttonStyle="primary" onClick={onConfirm} disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
