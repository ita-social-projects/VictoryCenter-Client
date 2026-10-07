import { useMemo } from 'react';
import { GenericModalWrapper } from '@/components/admin/generic-modal-wrapper/GenericModalWrapper';
import { useGenericModal } from '@/hooks/admin/use-generic-modal/useGenericModal';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackVideoDto } from '@/types/admin/feedback';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { VideoReviewForm, VideoReviewFormRef, VideoReviewFormValues } from '../video-review-form/VideoReviewForm';
import {
    getFeedbackConfirmTitle,
    getFeedbackErrorMessage,
    getFeedbackFormKey,
    getFeedbackStatus,
} from '../feedback-modal-config/feedbackModalConfig';

export interface VideoReviewPayload {
    title: string;
    link: string;
    status: VisibilityStatus;
}

export interface AddVideoReviewModalProps {
    mode: ModalMode;
    isOpen: boolean;
    onClose: () => void;
    videoToEdit?: FeedbackVideoDto;
    onSubmit: (payload: VideoReviewPayload, videoToEdit?: FeedbackVideoDto) => Promise<FeedbackVideoDto>;
    onSuccess: (video: FeedbackVideoDto, mode: ModalMode) => void;
}

export const AddVideoReviewModal = ({
    mode,
    isOpen,
    onClose,
    videoToEdit,
    onSubmit,
    onSuccess,
}: AddVideoReviewModalProps) => {
    const isEditMode = mode === ModalMode.Edit;

    const modalConfig = useMemo(
        () => ({
            mode,
            isOpen,
            onClose,
            entity: videoToEdit,
            onSuccess: (video: FeedbackVideoDto) => onSuccess(video, mode),
            apiCall: (payload: VideoReviewPayload) => onSubmit(payload, videoToEdit),
            getConfirmTitle: getFeedbackConfirmTitle,
            getErrorMessage: getFeedbackErrorMessage,
            getFormKey: getFeedbackFormKey,
            transformFormData: (
                formData: VideoReviewFormValues,
                status: VisibilityStatus,
                video?: FeedbackVideoDto,
            ): VideoReviewPayload => ({
                title: getNormalizedInputText(formData.title),
                link: getNormalizedInputText(formData.link),
                status: getFeedbackStatus(status, video),
            }),
        }),
        [mode, isOpen, onClose, videoToEdit, onSubmit, onSuccess],
    );

    const modalHookData = useGenericModal<VideoReviewFormValues, FeedbackVideoDto, VideoReviewFormRef>(modalConfig);

    const initialData = useMemo<VideoReviewFormValues | null>(
        () => (isEditMode && videoToEdit ? { title: videoToEdit.title, link: videoToEdit.link } : null),
        [isEditMode, videoToEdit],
    );

    return (
        <GenericModalWrapper
            isOpen={isOpen}
            title={
                isEditMode ? FEEDBACK_TEXT.EDIT_VIDEO_REVIEW_MODAL.TITLE : FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.TITLE
            }
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
                <VideoReviewForm
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
