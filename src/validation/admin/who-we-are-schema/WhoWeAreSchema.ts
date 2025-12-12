import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { WHO_WE_ARE_TEXT } from '@/const/admin/who-we-are';

export const WhoWeAreValidationSchema = Yup.object({
    text: Yup.string()
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .min(WHO_WE_ARE_TEXT.MIN_LENGTH, COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(WHO_WE_ARE_TEXT.MIN_LENGTH)),
});

export const WHO_WE_ARE_VALIDATION_FUNCTIONS = {
    validateText: (value: string | null): string | undefined => {
        try {
            WhoWeAreValidationSchema.validateSyncAt('text', { text: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
