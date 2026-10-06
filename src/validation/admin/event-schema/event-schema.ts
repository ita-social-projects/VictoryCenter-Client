import * as Yup from 'yup';
import { EVENT_CATEGORY_VALIDATION, EVENT_VALIDATION } from '@/const/admin/events';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EventCategoryDto } from '@/types/admin/event-category';
import { Image, ImageValues } from '@/types/common/image';

export const EventValidationSchema = Yup.object({
    title: Yup.string()
        .trim()
        .required(EVENT_VALIDATION.title.getRequiredError())
        .min(EVENT_VALIDATION.title.min, EVENT_VALIDATION.title.getMinError())
        .max(EVENT_VALIDATION.title.max, EVENT_VALIDATION.title.getMaxError()),

    description: Yup.string()
        .trim()
        .max(EVENT_VALIDATION.description.max, EVENT_VALIDATION.description.getMaxError())
        .test('min-length-if-not-empty', EVENT_VALIDATION.description.getMinError(), (value) => {
            return !value || value.length >= EVENT_VALIDATION.description.min;
        })
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing ? schema.required(EVENT_VALIDATION.description.getRequiredError()) : schema.notRequired(),
        ),

    additionalDescription: Yup.string()
        .trim()
        .max(EVENT_VALIDATION.additionalDescription.max, EVENT_VALIDATION.additionalDescription.getMaxError())
        .test('min-length-if-not-empty', EVENT_VALIDATION.additionalDescription.getMinError(), (value) => {
            return !value || value.length >= EVENT_VALIDATION.additionalDescription.min;
        }),

    linkUkr: Yup.string()
        .trim()
        .max(EVENT_VALIDATION.linkUkr.max, EVENT_VALIDATION.linkUkr.getMaxError())
        .test('min-length-if-not-empty', EVENT_VALIDATION.linkUkr.getMinError(), (value) => {
            return !value || value.length >= EVENT_VALIDATION.linkUkr.min;
        })
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing ? schema.required(EVENT_VALIDATION.linkUkr.getRequiredError()) : schema.notRequired(),
        ),

    linkEng: Yup.string()
        .trim()
        .max(EVENT_VALIDATION.linkEng.max, EVENT_VALIDATION.linkEng.getMaxError())
        .test('min-length-if-not-empty', EVENT_VALIDATION.linkEng.getMinError(), (value) => {
            return !value || value.length >= EVENT_VALIDATION.linkEng.min;
        }),

    publishDate: Yup.string()
        .nullable()
        .test('is-valid-date', EVENT_VALIDATION.publishDate.getInvalidError(), (value) => {
            if (!value) return true;

            if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

            const [year, month, day] = value.split('-').map(Number);
            const date = new Date(year, month - 1, day);

            return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day;
        })
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing ? schema.required(EVENT_VALIDATION.publishDate.getRequiredError()) : schema.notRequired(),
        ),

    image: Yup.mixed<Image | ImageValues>()
        .nullable()
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing ? schema.required(EVENT_VALIDATION.image.getRequiredError()) : schema.notRequired(),
        ),
});

export type EventFormValues = Yup.InferType<typeof EventValidationSchema>;

export const TranslateEventCategoryValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .max(
            EVENT_CATEGORY_VALIDATION.name.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(EVENT_CATEGORY_VALIDATION.name.max),
        ),

    category: Yup.mixed<EventCategoryDto>().nullable().required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED),
});

export const validateTranslateCategoryName = (name: string): string | undefined => {
    try {
        TranslateEventCategoryValidationSchema.validateSyncAt('name', { name });
        return undefined;
    } catch (error) {
        return error instanceof Yup.ValidationError ? error.message : undefined;
    }
};

export const validateTranslateCategorySelection = (
    category: EventCategoryDto | null | undefined,
): string | undefined => {
    try {
        TranslateEventCategoryValidationSchema.validateSyncAt('category', { category });
        return undefined;
    } catch (error) {
        return error instanceof Yup.ValidationError ? error.message : undefined;
    }
};

export const validateTranslateEventCategoryForm = (
    name: string,
    category: EventCategoryDto | null | undefined,
): { name: string | undefined; category: string | undefined } => {
    return {
        name: validateTranslateCategoryName(name),
        category: validateTranslateCategorySelection(category),
    };
};
