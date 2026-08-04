import React from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export interface DeleteCategoryConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isSubmitting: boolean;
}

export const DeleteCategoryConfirmModal = ({
    isOpen,
    onClose,
    onConfirm,
    isSubmitting,
}: DeleteCategoryConfirmModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Title>{COMMON_TEXT_ADMIN.CATEGORIES.FORM.TITLE.DELETE_CATEGORY_CONFIRM}</Modal.Title>
            <Modal.Actions>
                <Button buttonStyle="secondary" onClick={onClose} disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button buttonStyle="primary" onClick={onConfirm} disabled={isSubmitting}>
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
