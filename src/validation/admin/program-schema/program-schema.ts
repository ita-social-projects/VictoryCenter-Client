import { PROGRAM_VALIDATION } from '../../../const/admin/programs';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';
import { ProgramCategory } from '../../../types/admin/programs';
import { Image, ImageValues } from '../../../types/common/image';
import * as Yup from 'yup';

export interface ProgramValidationContext {
    isPublishing: boolean;
}

export const programValidationSchema = Yup.object({
    name: Yup.string()
        .required(PROGRAM_VALIDATION.name.getRequiredError())
        .min(PROGRAM_VALIDATION.name.min, COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.name.min))
        .max(
            PROGRAM_VALIDATION.name.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.name.max),
        ),

    categories: Yup.array<ProgramCategory>()
        .of(
            Yup.object({
                id: Yup.number().required(),
                name: Yup.string().required(),
                programsCount: Yup.number().required(),
            }),
        )
        .required(PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError())
        .min(1, PROGRAM_VALIDATION.categories.getAtLeastOneRequiredError()),

    description: Yup.string()
        .max(
            PROGRAM_VALIDATION.description.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.description.max),
        )
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema
                      .required(PROGRAM_VALIDATION.description.getRequiredWhenPublishingError())
                      .min(
                          PROGRAM_VALIDATION.description.min,
                          COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(PROGRAM_VALIDATION.description.min),
                      )
                : schema.notRequired(),
        ),

    previewImage: Yup.mixed<Image | ImageValues>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.previewImage.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            return value;
        }),

    backgroundImage: Yup.mixed<Image | ImageValues>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.backgroundImage.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            return value;
        }),

    location: Yup.string()
        .max(
            PROGRAM_VALIDATION.location.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.location.max),
        )
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.location.getRequiredWhenPublishingError())
                : schema.notRequired(),
        ),

    participantsCount: Yup.string()
        .max(
            PROGRAM_VALIDATION.participantsCount.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.participantsCount.max),
        )
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.participantsCount.getRequiredWhenPublishingError())
                : schema.notRequired(),
        ),

    meetingsCount: Yup.string()
        .max(
            PROGRAM_VALIDATION.meetingCount.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(PROGRAM_VALIDATION.meetingCount.max),
        )
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.meetingCount.getRequiredWhenPublishingError())
                : schema.notRequired(),
        ),
});

export const PROGRAM_VALIDATION_FUNCTIONS = {
    validateName: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('name', { name: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateCategories: (value: ProgramCategory[], isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('categories', { categories: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('description', { description: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePreviewImage: (value: Image | ImageValues | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('previewImage', { previewImage: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateBackgroundImage: (value: Image | ImageValues | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('backgroundImage', { backgroundImage: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateLocation: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('location', { location: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateParticipantsCount: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('participantsCount', { participantsCount: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateMeetingCount: (value: string, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('meetingsCount', { meetingsCount: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
