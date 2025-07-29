import { ProgramCategory } from '../../../types/ProgramAdminPage';
import { PROGRAM_VALIDATION } from '../../../const/admin/programs';
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
                      .required(PROGRAM_VALIDATION.description.getRequiredError())
                      .min(PROGRAM_VALIDATION.description.min, PROGRAM_VALIDATION.description.getMinError())
                : schema.notRequired(),
        ),

    img: Yup.mixed<File | string>()
        .nullable()
        .default(null)
        .when('$isPublishing', ([isPublishing], schema) =>
            isPublishing
                ? schema.required(PROGRAM_VALIDATION.img.getRequiredWhenPublishingError())
                : schema.notRequired(),
        )
        .transform((value) => {
            if (value === undefined || value === '') return null;
            if (value instanceof FileList) {
                return value.length > 0 ? value[0] : null;
            }
            if (value instanceof File) return value;
            if (typeof value === 'string' && value.trim()) return value;
            return null;
        })
        .test('fileFormat', PROGRAM_VALIDATION.img.getFormatError(), (value) => {
            if (typeof value === 'string') return true;
            if (value instanceof File) {
                return PROGRAM_VALIDATION.img.allowedFormats.includes(value.type);
            }
            return true;
        })
        .test('fileSize', PROGRAM_VALIDATION.img.getSizeError(), (value) => {
            if (value === null) return true;
            if (typeof value === 'string') return true;
            if (value instanceof File) {
                return value.size <= PROGRAM_VALIDATION.img.maxSizeBytes;
            }
            return true;
        }),
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

    validateImg: (value: File | string | null, isPublishing: boolean): string | undefined => {
        const context: ProgramValidationContext = { isPublishing };
        try {
            programValidationSchema.validateSyncAt('img', { img: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
