import * as Yup from 'yup';
import { TEAM_MEMBER_VALIDATION } from '../../../const/admin/team';
import { Image, ImageValues } from '../../../types/common/image';

export interface TeamMemberValidationContext {
    isPublishing: boolean;
}

export const teamMemberValidationSchema = Yup.object({
    fullName: Yup.string()
        .required(TEAM_MEMBER_VALIDATION.fullName.getRequiredError())
        .min(TEAM_MEMBER_VALIDATION.fullName.min, TEAM_MEMBER_VALIDATION.fullName.getMinError())
        .max(TEAM_MEMBER_VALIDATION.fullName.max, TEAM_MEMBER_VALIDATION.fullName.getMaxError())
        .matches(TEAM_MEMBER_VALIDATION.fullName.pattern, TEAM_MEMBER_VALIDATION.fullName.getPatternError()),

    description: Yup.string()
        .max(TEAM_MEMBER_VALIDATION.description.max, TEAM_MEMBER_VALIDATION.description.getMaxError())
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema
                      .required(TEAM_MEMBER_VALIDATION.description.getRequiredWhenPublishingError())
                      .min(TEAM_MEMBER_VALIDATION.description.min, TEAM_MEMBER_VALIDATION.description.getMinError())
                : schema.notRequired(),
        ),

    category: Yup.number().required(TEAM_MEMBER_VALIDATION.category.getRequiredError()),

    image: Yup.mixed<ImageValues | string>()
        .transform((value) => (value === null ? undefined : value))
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
        .test('fileSize', TEAM_MEMBER_VALIDATION.img.getSizeError(), (value) => {
            if (value && typeof value === 'object' && 'id' in value && typeof value.id === 'number') {
                return true;
            }
            if (typeof value === 'string') return true;
            if (value) {
                return value.size <= TEAM_MEMBER_VALIDATION.img.maxSizeBytes;
            }
            return true;
        })
        .test('fileType', TEAM_MEMBER_VALIDATION.img.getFormatError(), (value) => {
            if (!value || typeof value === 'string') return true;
            if ('mimeType' in value) {
                return TEAM_MEMBER_VALIDATION.img.allowedFormats.includes((value as any).mimeType);
            }
            return true;
        })
        .nullable()
        .notRequired(),
});

export const TEAM_MEMBER_VALIDATION_FUNCTIONS = {
    validateFullName: (value: string, isPublishing: boolean): string | undefined => {
        const context: TeamMemberValidationContext = { isPublishing };
        try {
            teamMemberValidationSchema.validateSyncAt('fullName', { fullName: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
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
