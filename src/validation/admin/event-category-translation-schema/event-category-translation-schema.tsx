import { EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EventCategoryDto } from '@/types/admin/event-category';

export const EventCategoryTranslationValidationSchema = Yup.object({
    name: Yup.string()
        .required(EVENT_CATEGORY_VALIDATION.name.getRequiredError())
        .min(EVENT_CATEGORY_VALIDATION.name.min, EVENT_CATEGORY_VALIDATION.name.getMinError())
        .max(
            EVENT_CATEGORY_VALIDATION.name.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(EVENT_CATEGORY_VALIDATION.name.max),
        ),

    category: Yup.mixed<EventCategoryDto>().nullable().required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED),
});

export const EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS = {
    validateName: (value: string | undefined): string | undefined => {
        try {
            EventCategoryTranslationValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateCategory: (value: EventCategoryDto | null | undefined): string | undefined => {
        try {
            EventCategoryTranslationValidationSchema.validateSyncAt('category', { category: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateFrom: (
        name: string | undefined,
        category: EventCategoryDto | undefined,
    ): { name: string | undefined; category: string | undefined } => {
        return {
            name: EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName(name),
            category: EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateCategory(category),
        };
    },
};
