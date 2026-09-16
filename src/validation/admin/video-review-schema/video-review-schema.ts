import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { VIDEO_REVIEW_VALIDATION } from '@/const/admin/feedback';
import { requiredNotWhitespaceOnlyTest } from '@/utils/functions/yup-string-validation-helper/yup-string-validation-helper';

const isHttpOrHttpsUrl = (value: string): boolean => {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
};

// Live validation runs on every keystroke, while a single trailing space is still allowed to
// persist mid-typing (see getNormalizedInputTextWhileTyping) - trimming here keeps length checks
// accurate against the value that will actually be sent, instead of the transient raw input.
const trimTransform = (value: string | undefined) => (typeof value === 'string' ? value.trim() : value);

export const VideoReviewValidationSchema = Yup.object({
    title: Yup.string()
        .transform(trimTransform)
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .test(...requiredNotWhitespaceOnlyTest(() => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED))
        .min(
            VIDEO_REVIEW_VALIDATION.title.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(VIDEO_REVIEW_VALIDATION.title.min),
        )
        .max(
            VIDEO_REVIEW_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(VIDEO_REVIEW_VALIDATION.title.max),
        ),

    link: Yup.string()
        .transform(trimTransform)
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .test(...requiredNotWhitespaceOnlyTest(() => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED))
        .min(
            VIDEO_REVIEW_VALIDATION.link.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(VIDEO_REVIEW_VALIDATION.link.min),
        )
        .max(
            VIDEO_REVIEW_VALIDATION.link.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(VIDEO_REVIEW_VALIDATION.link.max),
        )
        .test(
            'is-http-or-https-url',
            VIDEO_REVIEW_VALIDATION.link.getFormatError(),
            (value) => value === undefined || value.trim().length === 0 || isHttpOrHttpsUrl(value),
        ),
});

export const VIDEO_REVIEW_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined => {
        try {
            VideoReviewValidationSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateLink: (value: string): string | undefined => {
        try {
            VideoReviewValidationSchema.validateSyncAt('link', { link: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
