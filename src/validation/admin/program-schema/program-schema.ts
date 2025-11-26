import { PROGRAM_VALIDATION } from '../../../const/admin/programs';
import { ProgramCategory } from '../../../types/admin/programs';
import { Image, ImageValues } from '../../../types/common/image';
import * as Yup from 'yup';

export interface ProgramValidationContext {
    isPublishing: boolean;
}

export const programValidationSchema = Yup.object({
    name: Yup.string()
        .required(PROGRAM_VALIDATION.name.getRequiredError())
        .min(PROGRAM_VALIDATION.name.min, PROGRAM_VALIDATION.name.getMinError())
        .max(PROGRAM_VALIDATION.name.max, PROGRAM_VALIDATION.name.getMaxError()),

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
        .max(PROGRAM_VALIDATION.description.max, PROGRAM_VALIDATION.description.getMaxError())
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema
                      .required(PROGRAM_VALIDATION.description.getRequiredWhenPublishingError())
                      .min(PROGRAM_VALIDATION.description.min, PROGRAM_VALIDATION.description.getMinError())
                : schema.notRequired(),
        ),

    image: Yup.mixed<Image | ImageValues>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.image.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            return value;
        }),
    location: Yup.string()
        .max(PROGRAM_VALIDATION.location.max, PROGRAM_VALIDATION.location.getMaxError())
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.location.getRequiredWhenPublishingError())
                : schema.notRequired(),
        ),

    participantsCount: Yup.string()
        .max(PROGRAM_VALIDATION.participantsCount.max, PROGRAM_VALIDATION.participantsCount.getMaxError())
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.participantsCount.getRequiredWhenPublishingError())
                : schema.notRequired(),
        ),

    meetingCount: Yup.string()
        .max(PROGRAM_VALIDATION.meetingCount.max, PROGRAM_VALIDATION.meetingCount.getMaxError())
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

    validateImage: (value: Image | ImageValues | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('image', { image: value }, { context });
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
            programValidationSchema.validateSyncAt('meetingCount', { meetingCount: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
