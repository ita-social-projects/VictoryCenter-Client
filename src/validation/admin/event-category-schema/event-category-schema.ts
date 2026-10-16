import * as Yup from 'yup';
import { createEventCategoryNameSchema } from '../event-category-name/event-category-name';

export const EventCategoryValidationSchema = Yup.object({
    name: createEventCategoryNameSchema(),
});

export const EVENT_CATEGORY_VALIDATION_FUNCTIONS = {
    validateName: (value: string | undefined): string | undefined => {
        try {
            EventCategoryValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            if (error instanceof Yup.ValidationError) {
                return error.message;
            }
            return error?.message;
        }
    },
};
