import * as Yup from 'yup';
import { PDF_FILES_SECTION_VALIDATION } from '@/const/admin/reports';

export const PdfSectionValidationSchema = Yup.object({
    title: Yup.string()
        .trim()
        .required(PDF_FILES_SECTION_VALIDATION.title.getRequiredError())
        .min(PDF_FILES_SECTION_VALIDATION.title.min, PDF_FILES_SECTION_VALIDATION.title.getMinError())
        .max(PDF_FILES_SECTION_VALIDATION.title.max, PDF_FILES_SECTION_VALIDATION.title.getMaxError()),

    description: Yup.string()
        .trim()
        .required(PDF_FILES_SECTION_VALIDATION.description.getRequiredError())
        .min(PDF_FILES_SECTION_VALIDATION.description.min, PDF_FILES_SECTION_VALIDATION.description.getMinError())
        .max(PDF_FILES_SECTION_VALIDATION.description.max, PDF_FILES_SECTION_VALIDATION.description.getMaxError()),
});

export const PDF_SECTION_FIELD_VALIDATORS = {
    validateTitle: (value: string): string | undefined => {
        try {
            PdfSectionValidationSchema.validateSyncAt('title', { title: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateDescription: (value: string): string | undefined => {
        try {
            PdfSectionValidationSchema.validateSyncAt('description', { description: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};

export interface PdfSectionFormData {
    title: string;
    description: string;
}
