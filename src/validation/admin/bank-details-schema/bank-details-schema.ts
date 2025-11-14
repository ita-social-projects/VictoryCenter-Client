import { DONATE_VALIDATION } from '../../../const/admin/donate';
import * as Yup from 'yup';

export const BankDetailsValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.name.getRequiredError())
        .max(DONATE_VALIDATION.name.maxLength, DONATE_VALIDATION.name.getMaxError()),
    receiver: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.receiver.getRequiredError())
        .max(DONATE_VALIDATION.receiver.maxLength, DONATE_VALIDATION.receiver.getMaxError()),
    edrpou: Yup.string()
        .trim()
        .matches(/^\d+$/, DONATE_VALIDATION.getDigitsOnlyError())
        .min(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMinError())
        .max(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMaxError())
        .required(DONATE_VALIDATION.edrpou.getRequiredError()),
    ukrainianIban: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.ukrainianIban.getRequiredError())
        .min(DONATE_VALIDATION.ukrainianIban.count, DONATE_VALIDATION.ukrainianIban.getMinError())
        .max(DONATE_VALIDATION.ukrainianIban.count, DONATE_VALIDATION.ukrainianIban.getMaxError()),
    foreignIban: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.foreignIban.getRequiredError())
        .max(DONATE_VALIDATION.foreignIban.count, DONATE_VALIDATION.foreignIban.getMaxError()),
    paymentPurpose: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.paymentPurpose.getRequiredError())
        .max(DONATE_VALIDATION.paymentPurpose.maxLength, DONATE_VALIDATION.paymentPurpose.getMaxError()),
    swift: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.swift.getRequiredError())
        .min(DONATE_VALIDATION.swift.minLength, DONATE_VALIDATION.swift.getMinError())
        .max(DONATE_VALIDATION.swift.maxLength, DONATE_VALIDATION.swift.getMaxError()),
    address: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.address.getRequiredError())
        .max(DONATE_VALIDATION.address.maxLength, DONATE_VALIDATION.address.getMaxError()),
    account: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.account.getRequiredError())
        .max(DONATE_VALIDATION.account.maxLength, DONATE_VALIDATION.account.getMaxError()),
});

export const SupportOptionsValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.supportOptions.name.getRequiredError())
        .max(DONATE_VALIDATION.supportOptions.name.maxLength, DONATE_VALIDATION.supportOptions.name.getMaxError()),
    value: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.supportOptions.value.getRequiredError())
        .max(DONATE_VALIDATION.supportOptions.value.maxLength, DONATE_VALIDATION.supportOptions.value.getMaxError()),
});

function createValidator<T extends Yup.AnyObjectSchema>(schema: T, field: keyof T['fields']) {
    return (value: string): string | undefined => {
        try {
            schema.validateSyncAt(field as string, { [field]: value });
            return undefined;
        } catch (error: unknown) {
            if (error instanceof Yup.ValidationError) {
                return error.message;
            }
            return 'An unexpected validation error occurred.';
        }
    };
}

export const BANK_DETAILS_VALIDATION_FUNCTIONS = {
    validateName: createValidator(BankDetailsValidationSchema, 'name'),
    validateReceiver: createValidator(BankDetailsValidationSchema, 'receiver'),
    validateEdrpou: createValidator(BankDetailsValidationSchema, 'edrpou'),
    validateUkrainianIban: createValidator(BankDetailsValidationSchema, 'ukrainianIban'),
    validateForeignIban: createValidator(BankDetailsValidationSchema, 'foreignIban'),
    validatePaymentPurpose: createValidator(BankDetailsValidationSchema, 'paymentPurpose'),
    validateSwift: createValidator(BankDetailsValidationSchema, 'swift'),
    validateAddress: createValidator(BankDetailsValidationSchema, 'address'),
    validateAccount: createValidator(BankDetailsValidationSchema, 'account'),
};

export const SUPPORT_OPTIONS_VALIDATION_FUNCTIONS = {
    validateName: createValidator(SupportOptionsValidationSchema, 'name'),
    validateValue: createValidator(SupportOptionsValidationSchema, 'value'),
};
