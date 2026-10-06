import * as Yup from 'yup';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const createTextValidationRule = (requiredError: string) =>
    Yup.string()
        .required(requiredError)
        .min(WHO_WE_ARE_TEXT.MIN_LENGTH, COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(WHO_WE_ARE_TEXT.MIN_LENGTH));

export const WhoWeAreValidationSchema = Yup.object({
    text: createTextValidationRule(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED),
    title: createTextValidationRule(WHO_WE_ARE_TEXT.FORM.VALIDATION.TITLE_REQUIRED),
    description: createTextValidationRule(WHO_WE_ARE_TEXT.FORM.VALIDATION.DESCRIPTION_REQUIRED),
});

type WhoWeAreTextField = 'text' | 'title' | 'description';

const validateText = (field: WhoWeAreTextField, value: string | null): string | undefined => {
    try {
        WhoWeAreValidationSchema.validateSyncAt(field, { [field]: value });
        return undefined;
    } catch (error: any) {
        return error.message;
    }
};

export const WHO_WE_ARE_VALIDATION_FUNCTIONS = {
    validateText: (value: string | null): string | undefined => validateText('text', value),
    validateTitle: (value: string | null): string | undefined => validateText('title', value),
    validateDescription: (value: string | null): string | undefined => validateText('description', value),
};
