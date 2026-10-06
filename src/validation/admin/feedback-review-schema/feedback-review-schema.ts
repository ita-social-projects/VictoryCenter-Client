import * as Yup from 'yup';
import { FEEDBACK_REVIEW_VALIDATION } from '@/const/admin/feedback';

export interface FeedbackReviewFormValues {
    authorName: string;
    text: string;
}

export const FeedbackReviewValidationSchema = Yup.object({
    authorName: Yup.string()
        .trim()
        .required(FEEDBACK_REVIEW_VALIDATION.authorName.getRequiredError())
        .min(FEEDBACK_REVIEW_VALIDATION.authorName.min, FEEDBACK_REVIEW_VALIDATION.authorName.getMinError())
        .max(FEEDBACK_REVIEW_VALIDATION.authorName.max, FEEDBACK_REVIEW_VALIDATION.authorName.getMaxError()),

    text: Yup.string()
        .trim()
        .required(FEEDBACK_REVIEW_VALIDATION.text.getRequiredError())
        .min(FEEDBACK_REVIEW_VALIDATION.text.min, FEEDBACK_REVIEW_VALIDATION.text.getMinError())
        .max(FEEDBACK_REVIEW_VALIDATION.text.max, FEEDBACK_REVIEW_VALIDATION.text.getMaxError()),
});
