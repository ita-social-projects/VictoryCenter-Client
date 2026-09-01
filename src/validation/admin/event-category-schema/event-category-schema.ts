import { EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';
import * as Yup from 'yup';

export const EventCategoryValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(EVENT_CATEGORY_VALIDATION.name.getRequiredError())
        .min(EVENT_CATEGORY_VALIDATION.name.min, EVENT_CATEGORY_VALIDATION.name.getMinError())
        .max(EVENT_CATEGORY_VALIDATION.name.max, EVENT_CATEGORY_VALIDATION.name.getMaxError()),
});

export const EVENT_CATEGORY_VALIDATION_FUNCTIONS = {
    validateName: (value: string): string | undefined => {
        try {
            EventCategoryValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
