import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { FeedbackCategory, FeedbackListItem } from '@/types/admin/feedback';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { Button } from '@/components/admin/button/Button';
import styles from './DeleteFeedbackModal.module.scss';

export interface DeleteFeedbackModalProps {
    isOpen: boolean;
    onClose: () => void;
    category: FeedbackCategory;
    itemToDelete: FeedbackListItem | null;
    onDeleteItem: (item: FeedbackListItem) => void;
}

export const DeleteFeedbackModal = ({
    isOpen,
    onClose,
    category,
    itemToDelete,
    onDeleteItem,
}: DeleteFeedbackModalProps) => {
    const client = useAdminClient();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleConfirmDelete = async () => {
        if (isSubmitting || !itemToDelete) return;

        try {
            setIsSubmitting(true);
            setError('');

            await FeedbackApi.deleteFeedback(client, category, itemToDelete.id);
            onDeleteItem(itemToDelete);
            onClose();
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('Failed to delete feedback item:', error);
            setError(FEEDBACK_TEXT.DELETE_MODAL.FAIL_TO_DELETE);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) return;
        setError('');
        onClose();
    };

    return (
        <Modal isOpen={isOpen} onClose={handleClose}>
            <Modal.Title>{FEEDBACK_TEXT.DELETE_MODAL.TITLE}</Modal.Title>
            <Modal.Content>{error && <div className={styles['error-container']}>{error}</div>}</Modal.Content>
            <Modal.Actions>
                <Button
                    onClick={handleClose}
                    buttonStyle="secondary"
                    className="confirmation-btn"
                    disabled={isSubmitting}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.NO}
                </Button>
                <Button
                    onClick={handleConfirmDelete}
                    buttonStyle="primary"
                    className="confirmation-btn"
                    disabled={isSubmitting || !itemToDelete}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
