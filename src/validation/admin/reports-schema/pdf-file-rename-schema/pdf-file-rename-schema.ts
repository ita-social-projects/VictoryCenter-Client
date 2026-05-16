import { PDF_FILES_SECTION_VALIDATION } from '@/const/admin/reports';
import * as Yup from 'yup';

export const PdfFileRenameValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(PDF_FILES_SECTION_VALIDATION.fileName.getRequiredError())
        .min(PDF_FILES_SECTION_VALIDATION.fileName.min, PDF_FILES_SECTION_VALIDATION.fileName.getMinError())
        .max(PDF_FILES_SECTION_VALIDATION.fileName.max, PDF_FILES_SECTION_VALIDATION.fileName.getMaxError()),
});

export const PDF_FILE_RENAME_VALIDATION_FUNCTIONS = {
    validateName: (value: string): string | undefined => {
        try {
            PdfFileRenameValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
