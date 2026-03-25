import * as Yup from 'yup';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import { FUNDS_EXPENDITURES_VALIDATION } from '@/const/admin/reports';

const disclaimerSchema = Yup.object({
    disclaimer: Yup.string()
        .required(COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED)
        .min(
            FUNDS_EXPENDITURES_VALIDATION.disclaimer.min,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.min),
        )
        .max(
            FUNDS_EXPENDITURES_VALIDATION.disclaimer.max,
            COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(FUNDS_EXPENDITURES_VALIDATION.disclaimer.max),
        ),
});

export const FUNDS_EXPENDITURES_DISCLAIMER_VALIDATION_FUNCTIONS = {
    validateDisclaimer: (value: string): string | undefined => {
        const normalizedValue = value.replaceAll(/\s+/g, ' ').trim();
        try {
            disclaimerSchema.validateSyncAt('disclaimer', { disclaimer: normalizedValue });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
