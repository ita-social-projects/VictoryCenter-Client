import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import {
    FEEDBACK_HISTORY_VALIDATION,
    FEEDBACK_REVIEW_VALIDATION,
    VIDEO_REVIEW_VALIDATION,
} from '@/const/admin/feedback';

const validateFieldRealTime = (value: string, max: number, maxError: string): string | undefined => {
    const normalised = value.replace(/\s+/g, ' ').trimStart();
    if (normalised.length > max) return maxError;
    return undefined;
};

const validateFieldOnBlur = (
    value: string,
    min: number,
    max: number,
    requiredError: string,
    minError: string,
    maxError: string,
): string | undefined => {
    const trimmed = value.trim();
    if (!trimmed) return requiredError;
    if (trimmed.length < min) return minError;
    if (trimmed.length > max) return maxError;
    return undefined;
};

export const FEEDBACK_HISTORY_TRANSLATION_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined =>
        validateFieldRealTime(
            value,
            FEEDBACK_HISTORY_VALIDATION.title.max,
            FEEDBACK_HISTORY_VALIDATION.title.getMaxError(),
        ),
    validateStory: (value: string): string | undefined =>
        validateFieldRealTime(
            value,
            FEEDBACK_HISTORY_VALIDATION.story.max,
            FEEDBACK_HISTORY_VALIDATION.story.getMaxError(),
        ),
};

export const FEEDBACK_HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined =>
        validateFieldOnBlur(
            value,
            FEEDBACK_HISTORY_VALIDATION.title.min,
            FEEDBACK_HISTORY_VALIDATION.title.max,
            FEEDBACK_HISTORY_VALIDATION.title.getRequiredError(),
            FEEDBACK_HISTORY_VALIDATION.title.getMinError(),
            FEEDBACK_HISTORY_VALIDATION.title.getMaxError(),
        ),
    validateStory: (value: string): string | undefined =>
        validateFieldOnBlur(
            value,
            FEEDBACK_HISTORY_VALIDATION.story.min,
            FEEDBACK_HISTORY_VALIDATION.story.max,
            FEEDBACK_HISTORY_VALIDATION.story.getRequiredError(),
            FEEDBACK_HISTORY_VALIDATION.story.getMinError(),
            FEEDBACK_HISTORY_VALIDATION.story.getMaxError(),
        ),
};

export const FEEDBACK_REVIEW_TRANSLATION_VALIDATION_FUNCTIONS = {
    validateAuthorName: (value: string): string | undefined =>
        validateFieldRealTime(
            value,
            FEEDBACK_REVIEW_VALIDATION.authorName.max,
            FEEDBACK_REVIEW_VALIDATION.authorName.getMaxError(),
        ),
    validateText: (value: string): string | undefined =>
        validateFieldRealTime(
            value,
            FEEDBACK_REVIEW_VALIDATION.text.max,
            FEEDBACK_REVIEW_VALIDATION.text.getMaxError(),
        ),
};

export const FEEDBACK_REVIEW_TRANSLATION_BLUR_VALIDATION_FUNCTIONS = {
    validateAuthorName: (value: string): string | undefined =>
        validateFieldOnBlur(
            value,
            FEEDBACK_REVIEW_VALIDATION.authorName.min,
            FEEDBACK_REVIEW_VALIDATION.authorName.max,
            FEEDBACK_REVIEW_VALIDATION.authorName.getRequiredError(),
            FEEDBACK_REVIEW_VALIDATION.authorName.getMinError(),
            FEEDBACK_REVIEW_VALIDATION.authorName.getMaxError(),
        ),
    validateText: (value: string): string | undefined =>
        validateFieldOnBlur(
            value,
            FEEDBACK_REVIEW_VALIDATION.text.min,
            FEEDBACK_REVIEW_VALIDATION.text.max,
            FEEDBACK_REVIEW_VALIDATION.text.getRequiredError(),
            FEEDBACK_REVIEW_VALIDATION.text.getMinError(),
            FEEDBACK_REVIEW_VALIDATION.text.getMaxError(),
        ),
};

export const FEEDBACK_VIDEO_TRANSLATION_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined =>
        validateFieldRealTime(
            value,
            VIDEO_REVIEW_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(VIDEO_REVIEW_VALIDATION.title.max),
        ),
};

export const FEEDBACK_VIDEO_TRANSLATION_BLUR_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined =>
        validateFieldOnBlur(
            value,
            VIDEO_REVIEW_VALIDATION.title.min,
            VIDEO_REVIEW_VALIDATION.title.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(VIDEO_REVIEW_VALIDATION.title.min),
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(VIDEO_REVIEW_VALIDATION.title.max),
        ),
};
