import { useMemo } from 'react';
import { FEEDBACK_TEXT } from '@/const/admin/feedback';
import { ModalMode, VisibilityStatus } from '@/types/admin/common';
import { FeedbackReviewDto } from '@/types/admin/feedback';
import { FeedbackReviewFormValues } from '@/validation/admin/feedback-review-schema/feedback-review-schema';
import { getNormalizedInputText } from '@/utils/functions/formatters/text-formatters';
import { FeedbackReviewForm } from '../feedback-review-form/FeedbackReviewForm';
import { FeedbackFormModal, FeedbackModalProps } from '../feedback-form-modal/FeedbackFormModal';

export interface FeedbackReviewPayload {
    authorName: string;
    text: string;
    status: VisibilityStatus;
}

export interface AddFeedbackReviewModalProps extends FeedbackModalProps<FeedbackReviewDto, FeedbackReviewPayload> {
    reviewToEdit?: FeedbackReviewDto;
}

const toReviewPayload = (formData: FeedbackReviewFormValues, status: VisibilityStatus): FeedbackReviewPayload => ({
    authorName: getNormalizedInputText(formData.authorName),
    text: getNormalizedInputText(formData.text),
    status,
});

export const AddFeedbackReviewModal = ({ reviewToEdit, ...modalProps }: AddFeedbackReviewModalProps) => {
    const isEditMode = modalProps.mode === ModalMode.Edit;

    const initialData = useMemo<FeedbackReviewFormValues | null>(
        () => (isEditMode && reviewToEdit ? { authorName: reviewToEdit.authorName, text: reviewToEdit.text } : null),
        [isEditMode, reviewToEdit],
    );

    return (
        <FeedbackFormModal
            {...modalProps}
            entity={reviewToEdit}
            title={isEditMode ? FEEDBACK_TEXT.EDIT_REVIEW_MODAL.TITLE : FEEDBACK_TEXT.ADD_REVIEW_MODAL.TITLE}
            initialData={initialData}
            transformFormData={toReviewPayload}
            renderForm={({ key, ...formProps }) => <FeedbackReviewForm key={key} {...formProps} />}
        />
    );
};
