import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import { EventCategoryDto } from '@/types/admin/event-category';
import { createEventCategoryNameSchema } from '../event-category-name/event-category-name';

export const EventCategoryTranslationValidationSchema = Yup.object({
    name: createEventCategoryNameSchema({
        maxError: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(EVENT_CATEGORY_VALIDATION.name.max),
    }),
    category: Yup.mixed<EventCategoryDto>().nullable().required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED),
});

export const EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS = {
    validateName: (value: string | undefined): string | undefined => {
        try {
            EventCategoryTranslationValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            if (error instanceof Yup.ValidationError) {
                return error.message;
            }
            return undefined;
        }
    },

    validateCategory: (value: EventCategoryDto | null | undefined): string | undefined => {
        try {
            EventCategoryTranslationValidationSchema.validateSyncAt('category', { category: value });
            return undefined;
        } catch (error: any) {
            if (error instanceof Yup.ValidationError) {
                return error.message;
            }
            return undefined;
        }
    },

    validateForm: (
        name: string | undefined,
        category: EventCategoryDto | undefined,
    ): { name: string | undefined; category: string | undefined } => {
        return {
            name: EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateName(name),
            category: EVENT_CATEGORY_TRANSLATION_VALIDATION_FUNCTIONS.validateCategory(category),
        };
    },
};
