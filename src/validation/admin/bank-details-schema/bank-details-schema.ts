import { DONATE_VALIDATION } from '../../../const/admin/donate';
import * as Yup from 'yup';

export interface BankDetailsValidationContext {
    isPublishing: boolean;
}

export const BankDetailsValidationSchema = Yup.object({
    name: Yup.string().trim().required(DONATE_VALIDATION.name.getRequiredError()),
    receiver: Yup.string().trim().required(DONATE_VALIDATION.receiver.getRequiredError()),
    edrpou: Yup.string()
        .required(DONATE_VALIDATION.edrpou.getRequiredError())
        .matches(/^\d+$/, DONATE_VALIDATION.getDigitsOnlyError())
        .min(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMinError())
        .max(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMaxError()),
    iban: Yup.string()
        .required(DONATE_VALIDATION.iban.getRequiredError())
        .matches(/^UA\d+$/, DONATE_VALIDATION.getDigitsOnlyError())
        .min(DONATE_VALIDATION.iban.count, DONATE_VALIDATION.iban.getMinError())
        .max(DONATE_VALIDATION.iban.count, DONATE_VALIDATION.iban.getMaxError()),
    paymentPurpose: Yup.string().trim().required(DONATE_VALIDATION.paymentPurpose.getRequiredError()),
});

export const BANK_DETAILS_VALIDATION_FUNCTIONS = {
    validateName: (value: string, isPublishing: boolean): string | undefined => {
        const context: BankDetailsValidationContext = { isPublishing };
        try {
            BankDetailsValidationSchema.validateSyncAt('name', { name: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateReceiver: (value: string, isPublishing: boolean): string | undefined => {
        const context: BankDetailsValidationContext = { isPublishing };
        try {
            BankDetailsValidationSchema.validateSyncAt('receiver', { receiver: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateEdrpou: (value: string, isPublishing: boolean): string | undefined => {
        const context: BankDetailsValidationContext = { isPublishing };
        try {
            BankDetailsValidationSchema.validateSyncAt('edrpou', { edrpou: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateIban: (value: string, isPublishing: boolean): string | undefined => {
        const context: BankDetailsValidationContext = { isPublishing };
        try {
            BankDetailsValidationSchema.validateSyncAt('iban', { iban: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePaymentPurpose: (value: string, isPublishing: boolean): string | undefined => {
        const context: BankDetailsValidationContext = { isPublishing };
        try {
            BankDetailsValidationSchema.validateSyncAt('paymentPurpose', { paymentPurpose: value }, { context });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
