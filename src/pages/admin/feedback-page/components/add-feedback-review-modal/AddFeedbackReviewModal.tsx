import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import {
    FeedbackReviewFormValues,
    FeedbackReviewValidationSchema,
} from '@/validation/admin/feedback-review-schema/feedback-review-schema';
import './AddFeedbackReviewModal.scss';
import { FeedbackReviewFormFields } from '@/pages/admin/feedback-page/components/feedback-review-form-fields/FeedbackReviewFormFields';

export interface AddFeedbackReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const defaultFormState: FeedbackReviewFormValues = {
    authorName: '',
    text: '',
};

export const AddFeedbackReviewModal = ({ isOpen, onClose }: AddFeedbackReviewModalProps) => {
    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);

    const {
        control,
        formState: { errors, isDirty, isValid },
        reset,
    } = useForm<FeedbackReviewFormValues>({
        resolver: yupResolver(FeedbackReviewValidationSchema as Yup.ObjectSchema<FeedbackReviewFormValues>),
        defaultValues: defaultFormState,
        mode: 'onTouched',
    });

    const handleClose = useCallback(() => {
        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }
        reset(defaultFormState);
        onClose();
    }, [isDirty, reset, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        reset(defaultFormState);
        onClose();
    }, [reset, onClose]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{FEEDBACK_TEXT.ADD_REVIEW_MODAL.TITLE}</Modal.Title>

                <Modal.Content>
                    <FeedbackReviewFormFields control={control} errors={errors} idPrefix="feedback-review" />
                </Modal.Content>

                <Modal.Actions>
                    <div className="add-feedback-review-modal-actions">
                        <Button buttonStyle="primary" disabled={!isValid}>
                            {FEEDBACK_TEXT.ADD_REVIEW_MODAL.PUBLISH}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showCloseConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                onConfirm={handleConfirmClose}
                onCancel={() => setShowCloseConfirmModal(false)}
                onClose={() => setShowCloseConfirmModal(false)}
            />
        </>
    );
};
