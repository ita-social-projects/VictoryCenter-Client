import { PROGRAM_CATEGORY_VALIDATION } from "../../../const/admin/programs";
import * as Yup from 'yup';

export const ProgramCategoryValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(PROGRAM_CATEGORY_VALIDATION.name.requiredError)
        .matches(
            PROGRAM_CATEGORY_VALIDATION.name.allowed_chars,
            PROGRAM_CATEGORY_VALIDATION.name.getAllowedCharsError()
        )
        .min(
            PROGRAM_CATEGORY_VALIDATION.name.min,
            PROGRAM_CATEGORY_VALIDATION.name.getMinError()
        )
        .max(
            PROGRAM_CATEGORY_VALIDATION.name.max,
            PROGRAM_CATEGORY_VALIDATION.name.getMaxError()
        )
});

export type ProgramCategoryFormSchemaType = Yup.InferType<typeof ProgramCategoryValidationSchema>;
