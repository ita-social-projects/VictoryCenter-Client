import * as Yup from 'yup';
import { TEAM_MEMBER_VALIDATION } from '@/const/admin/team';
import { Image, ImageValues } from '@/types/common/image';

export interface TeamMemberValidationContext {
    isPublishing: boolean;
}

export const teamMemberValidationSchema = Yup.object({
    fullName: Yup.string()
        .required(TEAM_MEMBER_VALIDATION.fullName.getRequiredError())
        .min(TEAM_MEMBER_VALIDATION.fullName.min, TEAM_MEMBER_VALIDATION.fullName.getMinError())
        .max(TEAM_MEMBER_VALIDATION.fullName.max, TEAM_MEMBER_VALIDATION.fullName.getMaxError())
        .test('no-digits', TEAM_MEMBER_VALIDATION.fullName.getDigitsError(), (value) => {
            if (!value) return true;
            return !TEAM_MEMBER_VALIDATION.fullName.digitsPattern.test(value);
        })
        .test('allowed-chars', TEAM_MEMBER_VALIDATION.fullName.getInvalidCharsError(), (value) => {
            if (!value) return true;
            return TEAM_MEMBER_VALIDATION.fullName.allowedCharsPattern.test(value);
        }),

    description: Yup.string()
        .required(TEAM_MEMBER_VALIDATION.description.getRequiredError())
        .min(TEAM_MEMBER_VALIDATION.description.min, TEAM_MEMBER_VALIDATION.description.getMinError())
        .max(TEAM_MEMBER_VALIDATION.description.max, TEAM_MEMBER_VALIDATION.description.getMaxError())
        .test('no-multiple-spaces', TEAM_MEMBER_VALIDATION.description.getMultipleSpacesError(), (value) => {
            if (!value) return true;
            return !/\s{2,}/.test(value);
        }),

    category: Yup.number().required(TEAM_MEMBER_VALIDATION.category.getRequiredError()),

    image: Yup.mixed<ImageValues | Image>()
        .transform((value) => {
            if (value === null || typeof value === 'string') return undefined;
            return value;
        })
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.test(
                      'image-required-if-publishing',
                      TEAM_MEMBER_VALIDATION.img.getRequiredWhenPublishingError(),
                      (value) => {
                          return value !== undefined && value !== null;
                      },
                  )
                : schema,
        )
        .nullable()
        .notRequired(),
});

export const TEAM_MEMBER_VALIDATION_FUNCTIONS = {
    validateFullName: (value: string, isPublishing: boolean): string[] | undefined => {
        const context: TeamMemberValidationContext = { isPublishing };
        const testTypes = ['no-digits', 'allowed-chars'];
        try {
            teamMemberValidationSchema.validateSyncAt('fullName', { fullName: value }, { context });
            return undefined;
        } catch (error: any) {
            if (!testTypes.includes(error.type)) {
                return [error.message];
            }
        }

        try {
            teamMemberValidationSchema.validateSyncAt('fullName', { fullName: value }, { context, abortEarly: false });
            return undefined;
        } catch (error: any) {
            return error.inner.map((err: any) => err.message);
        }
    },

    validateDescription: (value: string, isPublishing: boolean): string | undefined => {
        const context: TeamMemberValidationContext = { isPublishing };
        try {
            teamMemberValidationSchema.validateSyncAt('description', { description: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateCategory: (value: number | null, isPublishing: boolean): string | undefined => {
        const context: TeamMemberValidationContext = { isPublishing };
        try {
            teamMemberValidationSchema.validateSyncAt('category', { category: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateImage: (value: ImageValues | Image | null, isPublishing: boolean): string | undefined => {
        const context: TeamMemberValidationContext = { isPublishing };
        try {
            teamMemberValidationSchema.validateSyncAt('image', { image: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
