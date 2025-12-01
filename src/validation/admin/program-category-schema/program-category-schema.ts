import { PROGRAM_CATEGORY_VALIDATION } from '../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import * as Yup from 'yup';

export const ProgramCategoryValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(PROGRAM_CATEGORY_VALIDATION.name.getRequiredError)
        .min(
            PROGRAM_CATEGORY_VALIDATION.name.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_CATEGORY_VALIDATION.name.min),
        )
        .max(
            PROGRAM_CATEGORY_VALIDATION.name.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_CATEGORY_VALIDATION.name.max),
        ),
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
