import { DONATE_VALIDATION } from '../../../const/admin/donate';
import * as Yup from 'yup';

export interface BankDetailsValidationContext {
    isPublishing: boolean;
}

export const BankDetailsValidationSchema = Yup.object({
    name: Yup.string().trim().required(DONATE_VALIDATION.name.getRequiredError()),
    receiver: Yup.string().trim().required(DONATE_VALIDATION.receiver.getRequiredError()),
    edrpou: Yup.string()
        .matches(/^\d+$/, DONATE_VALIDATION.getDigitsOnlyError())
        .min(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMinError())
        .max(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMaxError())
        .required(DONATE_VALIDATION.edrpou.getRequiredError()),
    iban: Yup.string()
        .matches(/UA/, DONATE_VALIDATION.iban.getRequiredError())
        .matches(/^UA\d+$/, DONATE_VALIDATION.getDigitsOnlyError())
        .min(DONATE_VALIDATION.iban.count, DONATE_VALIDATION.iban.getMinError())
        .max(DONATE_VALIDATION.iban.count, DONATE_VALIDATION.iban.getMaxError()),
    paymentPurpose: Yup.string().trim().required(DONATE_VALIDATION.paymentPurpose.getRequiredError()),
    swift: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.swift.getRequiredError())
        .min(DONATE_VALIDATION.swift.count, DONATE_VALIDATION.swift.getMinError())
        .max(DONATE_VALIDATION.swift.count, DONATE_VALIDATION.swift.getMaxError()),
    address: Yup.string().trim().required(DONATE_VALIDATION.address.getRequiredError()),
    account: Yup.string().trim().required(DONATE_VALIDATION.account.getRequiredError()),
});

export const BANK_DETAILS_VALIDATION_FUNCTIONS = {
    validateName: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('name', { name: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateReceiver: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('receiver', { receiver: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateEdrpou: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('edrpou', { edrpou: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateIban: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('iban', { iban: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validatePaymentPurpose: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('paymentPurpose', { paymentPurpose: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateSwift: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('swift', { swift: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateAddress: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('address', { address: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },

    validateAccount: (value: string): string | undefined => {
        try {
            BankDetailsValidationSchema.validateSyncAt('account', { account: value });
            return undefined;
        } catch (error: any) {
            return error.message;
        }
    },
};
