import { useState } from 'react';
import { Modal } from '@/components/common/modal/Modal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { FeedbackHistoryDto } from '@/types/admin/feedback';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { Button } from '@/components/admin/button/Button';
import './DeleteFeedbackHistoryModal.scss';

export interface DeleteFeedbackHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    historyToDelete: FeedbackHistoryDto | null;
    onDeleteHistory: (history: FeedbackHistoryDto) => void;
}

export const DeleteFeedbackHistoryModal = ({
    isOpen,
    onClose,
    historyToDelete,
    onDeleteHistory,
}: DeleteFeedbackHistoryModalProps) => {
    const client = useAdminClient();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string>('');

    const handleConfirmDelete = async () => {
        if (isSubmitting || !historyToDelete) return;

        try {
            setIsSubmitting(true);
            setError('');

            await FeedbackApi.deleteHistory(client, historyToDelete.id);
            onDeleteHistory(historyToDelete);
            onClose();
        } catch {
            setError(FEEDBACK_TEXT.DELETE_HISTORY_MODAL.FAIL_TO_DELETE);
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
            <Modal.Title>{FEEDBACK_TEXT.DELETE_HISTORY_MODAL.TITLE}</Modal.Title>
            <Modal.Content>
                {error && <div className="delete-feedback-history-error-container">{error}</div>}
            </Modal.Content>
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
                    disabled={isSubmitting || !historyToDelete}
                >
                    {COMMON_TEXT_ADMIN.BUTTON.YES}
                </Button>
            </Modal.Actions>
        </Modal>
    );
};
