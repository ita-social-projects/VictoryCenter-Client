import { useMemo } from 'react';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackVideoDto } from '@/types/admin/feedback';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { VideoReviewForm, VideoReviewFormValues } from '../video-review-form/VideoReviewForm';
import { FeedbackFormModal, FeedbackModalProps } from '../feedback-form-modal/FeedbackFormModal';

export interface VideoReviewPayload {
    title: string;
    link: string;
    status: VisibilityStatus;
}

export interface AddVideoReviewModalProps extends FeedbackModalProps<FeedbackVideoDto, VideoReviewPayload> {
    videoToEdit?: FeedbackVideoDto;
}

const toVideoPayload = (formData: VideoReviewFormValues, status: VisibilityStatus): VideoReviewPayload => ({
    title: getNormalizedInputText(formData.title),
    link: getNormalizedInputText(formData.link),
    status,
});

export const AddVideoReviewModal = ({ videoToEdit, ...modalProps }: AddVideoReviewModalProps) => {
    const isEditMode = modalProps.mode === ModalMode.Edit;

    const initialData = useMemo<VideoReviewFormValues | null>(
        () => (isEditMode && videoToEdit ? { title: videoToEdit.title, link: videoToEdit.link } : null),
        [isEditMode, videoToEdit],
    );

    return (
        <FeedbackFormModal
            {...modalProps}
            entity={videoToEdit}
            title={
                isEditMode ? FEEDBACK_TEXT.EDIT_VIDEO_REVIEW_MODAL.TITLE : FEEDBACK_TEXT.ADD_VIDEO_REVIEW_MODAL.TITLE
            }
            initialData={initialData}
            transformFormData={toVideoPayload}
            renderForm={({ key, ...formProps }) => <VideoReviewForm key={key} {...formProps} />}
        />
    );
};
