import { useCallback, useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Modal } from '@/components/common/modal/Modal';
import { Button } from '@/components/admin/button/Button';
import { ConfirmationModal } from '@/components/admin/confirmation-modal/ConfirmationModal';
import { InputWithCharacterLimitGroup } from '@/components/admin/input-groups/input-with-character-limit-group/InputWithCharacterLimitGroup';
import { TextAreaWithCharacterLimitGroup } from '@/components/admin/input-groups/text-area-with-character-limit-group/TextAreaWithCharacterLimitGroup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FEEDBACK_REVIEW_VALIDATION, FEEDBACK_TEXT } from '@/const/admin/feedback';
import {
    FeedbackReviewFormValues,
    FeedbackReviewValidationSchema,
} from '@/validation/admin/feedback-review-schema/feedback-review-schema';
import {
    getNormalizedInputText,
    getNormalizedInputTextWhileTyping,
} from '@/utils/functions/formatters/text-formatters';
import { useAdminClient } from '@/hooks/admin/use-admin-client/useAdminClient';
import { FeedbackApi } from '@/services/api/admin/feedback/feedback-api';
import { FeedbackReviewDto } from '@/types/admin/feedback';
import './EditFeedbackReviewModal.scss';

export interface EditFeedbackReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    reviewToEdit: FeedbackReviewDto | null;
    onReviewUpdated: (review: FeedbackReviewDto) => void;
    onUpdateError: () => void;
}

export const EditFeedbackReviewModal = ({
    isOpen,
    onClose,
    reviewToEdit,
    onReviewUpdated,
    onUpdateError,
}: EditFeedbackReviewModalProps) => {
    const client = useAdminClient();
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
        defaultValues: { authorName: '', text: '' },
        mode: 'onTouched',
    });

    useEffect(() => {
        if (isOpen && reviewToEdit) {
            reset({ authorName: reviewToEdit.authorName, text: reviewToEdit.text });
        }
    }, [isOpen, reviewToEdit, reset]);

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
        if (!reviewToEdit || isSubmitting) return;

        const { authorName, text } = getValues();

        try {
            setIsSubmitting(true);
            const updatedReview = await FeedbackApi.updateReview(client, reviewToEdit.id, {
                authorName: getNormalizedInputText(authorName),
                text: getNormalizedInputText(text),
                status: reviewToEdit.status,
            });
            setShowPublishConfirmModal(false);
            onReviewUpdated(updatedReview);
            onClose();
        } catch {
            setShowPublishConfirmModal(false);
            onUpdateError();
        } finally {
            setIsSubmitting(false);
        }
    }, [reviewToEdit, isSubmitting, getValues, client, onReviewUpdated, onClose, onUpdateError]);

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose}>
                <Modal.Title>{FEEDBACK_TEXT.EDIT_REVIEW_MODAL.TITLE}</Modal.Title>

                <Modal.Content>
                    <Controller
                        name="authorName"
                        control={control}
                        render={({ field }) => (
                            <InputWithCharacterLimitGroup
                                name={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(getNormalizedInputTextWhileTyping(e.target.value))}
                                onBlur={() => {
                                    if (field.value) {
                                        field.onChange(getNormalizedInputText(field.value));
                                    }
                                    field.onBlur();
                                }}
                                label={FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.AUTHOR_NAME}
                                id="edit-feedback-review-author-name"
                                maxLength={FEEDBACK_REVIEW_VALIDATION.authorName.max}
                                error={errors.authorName?.message}
                                isRequired
                                showCounterBelow
                            />
                        )}
                    />

                    <Controller
                        name="text"
                        control={control}
                        render={({ field }) => (
                            <TextAreaWithCharacterLimitGroup
                                name={field.name}
                                value={field.value}
                                onChange={(e) => field.onChange(getNormalizedInputTextWhileTyping(e.target.value))}
                                onBlur={() => {
                                    if (field.value) {
                                        field.onChange(getNormalizedInputText(field.value));
                                    }
                                    field.onBlur();
                                }}
                                label={FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.TEXT}
                                id="edit-feedback-review-text"
                                maxLength={FEEDBACK_REVIEW_VALIDATION.text.max}
                                error={errors.text?.message}
                                isRequired
                                rows={4}
                            />
                        )}
                    />
                </Modal.Content>

                <Modal.Actions>
                    <div className="edit-feedback-review-modal-actions">
                        <Button
                            buttonStyle="primary"
                            disabled={!isValid || !isDirty || isSubmitting}
                            onClick={() => setShowPublishConfirmModal(true)}
                        >
                            {FEEDBACK_TEXT.ADD_REVIEW_MODAL.PUBLISH}
                        </Button>
                    </div>
                </Modal.Actions>
            </Modal>

            <ConfirmationModal
                isOpen={showPublishConfirmModal}
                title={COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES}
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
