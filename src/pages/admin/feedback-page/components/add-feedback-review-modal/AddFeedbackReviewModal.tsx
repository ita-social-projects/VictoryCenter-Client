import React, { useCallback, useState } from 'react';
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

    const handleTextFieldChange = useCallback(
        (field: any) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            field.onChange(getNormalizedInputTextWhileTyping(e.target.value));
        },
        [],
    );

    const handleTextFieldBlur = useCallback(
        (field: any) => () => {
            if (field.value) {
                field.onChange(getNormalizedInputText(field.value));
            }
            field.onBlur();
        },
        [],
    );

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
                    <Controller
                        name="authorName"
                        control={control}
                        render={({ field }) => (
                            <InputWithCharacterLimitGroup
                                name={field.name}
                                value={field.value}
                                onChange={handleTextFieldChange(field)}
                                onBlur={handleTextFieldBlur(field)}
                                label={FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.AUTHOR_NAME}
                                id="feedback-review-author-name"
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
                                onChange={field.onChange}
                                onBlur={handleTextFieldBlur(field)}
                                label={FEEDBACK_TEXT.ADD_REVIEW_MODAL.LABEL.TEXT}
                                id="feedback-review-text"
                                maxLength={FEEDBACK_REVIEW_VALIDATION.text.max}
                                error={errors.text?.message}
                                isRequired
                                rows={4}
                                normalizeValue={getNormalizedInputTextWhileTyping}
                            />
                        )}
                    />
                </Modal.Content>

                <Modal.Actions>
                    <Button buttonStyle="primary" disabled={!isValid}>
                        {FEEDBACK_TEXT.ADD_REVIEW_MODAL.PUBLISH}
                    </Button>
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
