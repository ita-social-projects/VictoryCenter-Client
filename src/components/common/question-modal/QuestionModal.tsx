import React from 'react';
import { Button } from '../button/Button';
import { Modal } from '../modal/Modal';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

type QuestionModalProps = {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    content?: string | null;
    confirmText: string;
    cancelText: string;
    onConfirm: () => void;
    onCancel: () => void;
    isSubmitting?: boolean;
};

export const QuestionModal = ({
    isOpen,
    onClose,
    title,
    confirmText,
    cancelText,
    onConfirm,
    onCancel,
    content = null,
    isSubmitting = false,
}: QuestionModalProps) => {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <Modal.Title>{title}</Modal.Title>
            <Modal.Content>{content && <p>{content}</p>}</Modal.Content>
            <Modal.Actions>
                <Button onClick={onCancel} buttonStyle="secondary" disabled={isSubmitting}>
                    {cancelText || COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button onClick={onConfirm} buttonStyle="primary" disabled={isSubmitting}>
                    {confirmText || COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
