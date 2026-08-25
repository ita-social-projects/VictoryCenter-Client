import { TEAM_CATEGORY_VALIDATION } from '@/const/admin/team';
import * as Yup from 'yup';

export const TeamCategoryValidationSchema = Yup.object({
    name: Yup.string()
        .required(TEAM_CATEGORY_VALIDATION.name.getRequiredError())
        .test(
            'no-leading-trailing-spaces',
            TEAM_CATEGORY_VALIDATION.name.getNoSpacesError(),
            (value) => value === value?.trim(),
        )
        .min(TEAM_CATEGORY_VALIDATION.name.min, TEAM_CATEGORY_VALIDATION.name.getMinError())
        .max(TEAM_CATEGORY_VALIDATION.name.max, TEAM_CATEGORY_VALIDATION.name.getMaxError()),

    description: Yup.string()
        .required(TEAM_CATEGORY_VALIDATION.description.getRequiredError())
        .test(
            'no-leading-trailing-spaces',
            TEAM_CATEGORY_VALIDATION.description.getNoSpacesError(),
            (value) => value === value?.trim(),
        )
        .min(TEAM_CATEGORY_VALIDATION.description.min, TEAM_CATEGORY_VALIDATION.description.getMinError())
        .max(TEAM_CATEGORY_VALIDATION.description.max, TEAM_CATEGORY_VALIDATION.description.getMaxError()),
});

export const TEAM_CATEGORY_VALIDATION_FUNCTIONS = {
    validateName: (value: string): string | undefined => {
        try {
            TeamCategoryValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string): string | undefined => {
        try {
            TeamCategoryValidationSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
