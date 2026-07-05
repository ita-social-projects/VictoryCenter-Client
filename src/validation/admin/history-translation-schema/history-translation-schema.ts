import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

export const HISTORY_TRANSLATION_VALIDATION = {
    title: {
        min: 5,
        max: 60,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(5),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(60),
    },
    description: {
        min: 10,
        max: 600,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(600),
    },
};

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

export const HISTORY_TRANSLATION_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined =>
        validateFieldRealTime(
            value,
            HISTORY_TRANSLATION_VALIDATION.title.max,
            HISTORY_TRANSLATION_VALIDATION.title.getMaxError(),
        ),

    validateDescription: (value: string): string | undefined =>
        validateFieldRealTime(
            value,
            HISTORY_TRANSLATION_VALIDATION.description.max,
            HISTORY_TRANSLATION_VALIDATION.description.getMaxError(),
        ),
};

export const HISTORY_TRANSLATION_BLUR_VALIDATION_FUNCTIONS = {
    validateTitle: (value: string): string | undefined =>
        validateFieldOnBlur(
            value,
            HISTORY_TRANSLATION_VALIDATION.title.min,
            HISTORY_TRANSLATION_VALIDATION.title.max,
            HISTORY_TRANSLATION_VALIDATION.title.getRequiredError(),
            HISTORY_TRANSLATION_VALIDATION.title.getMinError(),
            HISTORY_TRANSLATION_VALIDATION.title.getMaxError(),
        ),

    validateDescription: (value: string): string | undefined =>
        validateFieldOnBlur(
            value,
            HISTORY_TRANSLATION_VALIDATION.description.min,
            HISTORY_TRANSLATION_VALIDATION.description.max,
            HISTORY_TRANSLATION_VALIDATION.description.getRequiredError(),
            HISTORY_TRANSLATION_VALIDATION.description.getMinError(),
            HISTORY_TRANSLATION_VALIDATION.description.getMaxError(),
        ),
};

export const HistoryTranslationValidationSchema = Yup.object({
    title: Yup.string()
        .test('optional-min-max', '', function (value) {
            const trimmed = (value ?? '').trim();
            if (!trimmed) return true;
            if (trimmed.length < HISTORY_TRANSLATION_VALIDATION.title.min)
                return this.createError({ message: HISTORY_TRANSLATION_VALIDATION.title.getMinError() });
            if (trimmed.length > HISTORY_TRANSLATION_VALIDATION.title.max)
                return this.createError({ message: HISTORY_TRANSLATION_VALIDATION.title.getMaxError() });
            return true;
        })
        .nullable(),
    description: Yup.string()
        .test('optional-min-max', '', function (value) {
            const trimmed = (value ?? '').trim();
            if (!trimmed) return true;
            if (trimmed.length < HISTORY_TRANSLATION_VALIDATION.description.min)
                return this.createError({ message: HISTORY_TRANSLATION_VALIDATION.description.getMinError() });
            if (trimmed.length > HISTORY_TRANSLATION_VALIDATION.description.max)
                return this.createError({ message: HISTORY_TRANSLATION_VALIDATION.description.getMaxError() });
            return true;
        })
        .nullable(),
});
