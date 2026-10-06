import * as Yup from 'yup';
import { FEEDBACK_HISTORY_VALIDATION } from '@/const/admin/feedback';
import { Image, ImageValues } from '@/types/common/image';

export interface FeedbackHistoryFormValues {
    title: string;
    story: string;
    image: Image | ImageValues | null;
}

export const FeedbackHistoryValidationSchema: Yup.ObjectSchema<FeedbackHistoryFormValues> = Yup.object({
    title: Yup.string()
        .trim()
        .required(FEEDBACK_HISTORY_VALIDATION.title.getRequiredError())
        .min(FEEDBACK_HISTORY_VALIDATION.title.min, FEEDBACK_HISTORY_VALIDATION.title.getMinError())
        .max(FEEDBACK_HISTORY_VALIDATION.title.max, FEEDBACK_HISTORY_VALIDATION.title.getMaxError()),
    story: Yup.string()
        .trim()
        .required(FEEDBACK_HISTORY_VALIDATION.story.getRequiredError())
        .min(FEEDBACK_HISTORY_VALIDATION.story.min, FEEDBACK_HISTORY_VALIDATION.story.getMinError())
        .max(FEEDBACK_HISTORY_VALIDATION.story.max, FEEDBACK_HISTORY_VALIDATION.story.getMaxError()),
    image: Yup.mixed<Image | ImageValues>()
        .nullable()
        .test(
            'required',
            FEEDBACK_HISTORY_VALIDATION.image.getRequiredError(),
            (value) => value !== null && value !== undefined,
        )
        .defined(),
});
