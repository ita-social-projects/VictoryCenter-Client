import { useMemo } from 'react';
import { GenericModalWrapper } from '@/components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useGenericModal } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackReviewDto } from '@/types/admin/feedback';
import { FeedbackReviewFormValues } from '@/validation/admin/feedback-review-schema/feedback-review-schema';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { FeedbackReviewForm, FeedbackReviewFormRef } from '../feedback-review-form/FeedbackReviewForm';
import {
    getFeedbackConfirmTitle,
    getFeedbackErrorMessage,
    getFeedbackFormKey,
    getFeedbackStatus,
} from '../feedback-modal-config/feedbackModalConfig';

export interface FeedbackReviewPayload {
    authorName: string;
    text: string;
    status: VisibilityStatus;
}

export interface AddFeedbackReviewModalProps {
    mode: ModalMode;
    isOpen: boolean;
    onClose: () => void;
    reviewToEdit?: FeedbackReviewDto;
    onSubmit: (payload: FeedbackReviewPayload, reviewToEdit?: FeedbackReviewDto) => Promise<FeedbackReviewDto>;
    onSuccess: (review: FeedbackReviewDto, mode: ModalMode) => void;
}

export const AddFeedbackReviewModal = ({
    mode,
    isOpen,
    onClose,
    reviewToEdit,
    onSubmit,
    onSuccess,
}: AddFeedbackReviewModalProps) => {
    const isEditMode = mode === ModalMode.Edit;

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: reviewToEdit,
            onSuccess: (review: FeedbackReviewDto) => onSuccess(review, mode),
            apiCall: (payload: FeedbackReviewPayload) => onSubmit(payload, reviewToEdit),
            getConfirmTitle: getFeedbackConfirmTitle,
            getErrorMessage: getFeedbackErrorMessage,
            getFormKey: getFeedbackFormKey,
            transformFormData: (
                formData: FeedbackReviewFormValues,
                status: VisibilityStatus,
                review?: FeedbackReviewDto,
            ): FeedbackReviewPayload => ({
                authorName: getNormalizedInputText(formData.authorName),
                text: getNormalizedInputText(formData.text),
                status: getFeedbackStatus(status, review),
            }),
        }),
        [mode, isOpen, onClose, reviewToEdit, onSubmit, onSuccess],
    );

    const modalHookData = useGenericModal<FeedbackReviewFormValues, FeedbackReviewDto, FeedbackReviewFormRef>(
        modalConfig,
    );

    const initialData = useMemo<FeedbackReviewFormValues | null>(
        () => (isEditMode && reviewToEdit ? { authorName: reviewToEdit.authorName, text: reviewToEdit.text } : null),
        [isEditMode, reviewToEdit],
    );

    const title = isEditMode ? FEEDBACK_TEXT.EDIT_REVIEW_MODAL.TITLE : FEEDBACK_TEXT.ADD_REVIEW_MODAL.TITLE;

    return (
        <GenericModalWrapper
            isOpen={isOpen}
            title={title}
            className="feedback-form-modal"
            showDraftButton={false}
            onClose={modalHookData.handleClose}
            onFormValidationChange={modalHookData.handleFormValidationChange}
            onFormSubmit={modalHookData.handleFormSubmit}
            onDraftSubmit={modalHookData.handleDraftSubmit}
            onPublishSubmit={modalHookData.handlePublishSubmit}
            onExitConfirm={modalHookData.handleConfirmClose}
            onExitCancel={modalHookData.handleCancelClose}
            onActionConfirm={modalHookData.handleConfirmAction}
            onActionCancel={modalHookData.handleCancelConfirmation}
            formRef={modalHookData.formRef}
            formKey={modalHookData.formKey}
            buttonStates={modalHookData.buttonStates}
            isSubmitting={modalHookData.isSubmitting}
            error={modalHookData.error}
            isActionConfirmationOpen={modalHookData.showFormConfirmModal}
            isExitConfirmationOpen={modalHookData.showCloseConfirmModal}
            actionConfirmationTitle={modalHookData.formConfirmTitle}
            initialData={initialData}
            renderForm={(props) => (
                <FeedbackReviewForm
                    ref={modalHookData.formRef}
                    key={props.key}
                    initialData={initialData}
                    formDisabled={props.formDisabled}
                    onSubmit={props.onSubmit}
                    onValidationChange={props.onValidationChange}
                />
            )}
        />
    );
};
