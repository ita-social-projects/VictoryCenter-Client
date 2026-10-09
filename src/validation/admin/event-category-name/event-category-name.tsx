import * as Yup from 'yup';
import { EVENT_CATEGORY_VALIDATION } from '@/const/admin/events';

export interface EventCategoryNameValidationOptions {
    requiredError?: string;
    minError?: string;
    maxError?: string;
}

export const createEventCategoryNameSchema = (options?: EventCategoryNameValidationOptions) => {
    return Yup.string()
        .trim()
        .required(options?.requiredError ?? EVENT_CATEGORY_VALIDATION.name.getRequiredError())
        .min(EVENT_CATEGORY_VALIDATION.name.min, options?.minError ?? EVENT_CATEGORY_VALIDATION.name.getMinError())
        .max(EVENT_CATEGORY_VALIDATION.name.max, options?.maxError ?? EVENT_CATEGORY_VALIDATION.name.getMaxError());
};
