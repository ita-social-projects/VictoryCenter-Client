import { useCallback, useEffect, useState } from 'react';
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
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FeedbackReviewDto } from '@/types/admin/feedback';
import { FeedbackReviewFormFields } from '../feedback-review-form-fields/FeedbackReviewFormFields';
import styles from './AddFeedbackReviewModal.module.scss';
import { VisibilityStatus } from '@/types/admin/common';

export interface AddFeedbackReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAddReview?: (review: FeedbackReviewDto) => void;
    onEditReview?: (review: FeedbackReviewDto) => void;
    onSubmitError?: () => void;
    initialData?: FeedbackReviewDto;
}

const defaultFormState: FeedbackReviewFormValues = {
    authorName: '',
    text: '',
};

export const AddFeedbackReviewModal = ({
    isOpen,
    onClose,
    onEditReview,
    onSubmitError,
    initialData,
    onAddReview,
}: AddFeedbackReviewModalProps) => {
    const client = useAdminClient();
    const isEditMode = Boolean(initialData);

    const [showCloseConfirmModal, setShowCloseConfirmModal] = useState(false);
    const [showPublishConfirmModal, setShowPublishConfirmModal] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        formState: { errors, isDirty, isValid },
        reset,
        getValues,
    } = useForm<FeedbackReviewFormValues>({
        resolver: yupResolver(FeedbackReviewValidationSchema as Yup.ObjectSchema<FeedbackReviewFormValues>),
        defaultValues: defaultFormState,
        mode: 'onTouched',
    });

    useEffect(() => {
        if (isOpen) {
            reset(initialData ? { authorName: initialData.authorName, text: initialData.text } : defaultFormState);
        }
    }, [isOpen, initialData, reset]);

    const handleClose = useCallback(() => {
        if (isDirty) {
            setShowCloseConfirmModal(true);
            return;
        }
        onClose();
    }, [isDirty, onClose]);

    const handleConfirmClose = useCallback(() => {
        setShowCloseConfirmModal(false);
        onClose();
    }, [onClose]);

    const handleConfirmPublish = useCallback(async () => {
        if (isSubmitting) return;

        const { authorName, text } = getValues();
        const payload = {
            authorName: getNormalizedInputText(authorName),
            text: getNormalizedInputText(text),
            status: initialData?.status ?? VisibilityStatus.Published,
        };

        try {
            setIsSubmitting(true);

            if (initialData) {
                const updatedReview = await FeedbackApi.updateReview(client, initialData.id, payload);
                onEditReview?.(updatedReview);
            } else {
                const newReview = await FeedbackApi.createReview(client, payload);
                onAddReview?.(newReview);
            }

            setShowPublishConfirmModal(false);
            onClose();
        } catch {
            setShowPublishConfirmModal(false);
            onSubmitError?.();
        } finally {
            setIsSubmitting(false);
        }
    }, [initialData, isSubmitting, getValues, client, onAddReview, onEditReview, onClose, onSubmitError]);

    const isPublishDisabled = isEditMode ? !isValid || !isDirty || isSubmitting : !isValid;

    return (
        <>
            <Modal isOpen={isOpen && !showPublishConfirmModal && !showCloseConfirmModal} onClose={handleClose}>
                <Modal.Title>
                    {isEditMode ? FEEDBACK_TEXT.EDIT_REVIEW_MODAL.TITLE : FEEDBACK_TEXT.ADD_REVIEW_MODAL.TITLE}
                </Modal.Title>

                <Modal.Content>
                    <FeedbackReviewFormFields control={control} errors={errors} idPrefix="feedback-review" />
                </Modal.Content>

                <Modal.Actions>
                    <div className={styles.actions}>
                        <Button
                            buttonStyle="primary"
                            disabled={isPublishDisabled}
                            onClick={() => setShowPublishConfirmModal(true)}
                        >
                            {FEEDBACK_TEXT.ADD_REVIEW_MODAL.PUBLISH}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showPublishConfirmModal}
                title={isEditMode ? COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES : FEEDBACK_TEXT.PUBLISH_MODAL.TITLE_NEW}
                confirmText={COMMON_TEXT_ADMIN.BUTTON.YES}
                cancelText={COMMON_TEXT_ADMIN.BUTTON.NO}
                isButtonsDisabled={isSubmitting}
                onConfirm={handleConfirmPublish}
                onCancel={() => setShowPublishConfirmModal(false)}
                onClose={() => setShowPublishConfirmModal(false)}
            />

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
