import { PROGRAM_CATEGORY_VALIDATION } from '../../../const/admin/programs';
import * as Yup from 'yup';

export const ProgramCategoryValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(PROGRAM_CATEGORY_VALIDATION.name.getRequiredError)
        .min(PROGRAM_CATEGORY_VALIDATION.name.min, PROGRAM_CATEGORY_VALIDATION.name.getMinError())
        .max(PROGRAM_CATEGORY_VALIDATION.name.max, PROGRAM_CATEGORY_VALIDATION.name.getMaxError()),
});

export const PROGRAM_CATEGORY_VALIDATION_FUNCTIONS = {
    validateName: (value: string): string | undefined => {
        try {
            ProgramCategoryValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
