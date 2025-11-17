import { DONATE_VALIDATION } from '../../../const/admin/donate';
import * as Yup from 'yup';

export const BankDetailsValidationSchema = Yup.object({
    name: Yup.string().trim().required(DONATE_VALIDATION.name.getRequiredError()),
    receiver: Yup.string().trim().required(DONATE_VALIDATION.receiver.getRequiredError()),
    edrpou: Yup.string()
        .matches(/^\d+$/, DONATE_VALIDATION.getDigitsOnlyError())
        .min(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMinError())
        .max(DONATE_VALIDATION.edrpou.count, DONATE_VALIDATION.edrpou.getMaxError())
        .required(DONATE_VALIDATION.edrpou.getRequiredError()),
    iban: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.iban.getRequiredError())
        .min(DONATE_VALIDATION.iban.count, DONATE_VALIDATION.iban.getMinError())
        .max(DONATE_VALIDATION.iban.count, DONATE_VALIDATION.iban.getMaxError()),
    paymentPurpose: Yup.string().trim().required(DONATE_VALIDATION.paymentPurpose.getRequiredError()),
    swift: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.swift.getRequiredError())
        .min(DONATE_VALIDATION.swift.minLength, DONATE_VALIDATION.swift.getMinError())
        .max(DONATE_VALIDATION.swift.maxLength, DONATE_VALIDATION.swift.getMaxError()),
    address: Yup.string().trim().required(DONATE_VALIDATION.address.getRequiredError()),
    account: Yup.string().trim().required(DONATE_VALIDATION.account.getRequiredError()),
});

export const SupportOptionsValidationSchema = Yup.object({
    name: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.supportOptions.name.getRequiredError())
        .max(DONATE_VALIDATION.supportOptions.maxLengthTitle, DONATE_VALIDATION.supportOptions.name.getMaxError())
        .min(DONATE_VALIDATION.supportOptions.minLengthTitle, DONATE_VALIDATION.supportOptions.name.getMinError()),
    value: Yup.string()
        .trim()
        .required(DONATE_VALIDATION.supportOptions.value.getRequiredError())
        .max(
            DONATE_VALIDATION.supportOptions.maxLengthDescription,
            DONATE_VALIDATION.supportOptions.value.getMaxError(),
        )
        .min(
            DONATE_VALIDATION.supportOptions.minLengthDescription,
            DONATE_VALIDATION.supportOptions.value.getMinError(),
        ),
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
    validateIban: createValidator(BankDetailsValidationSchema, 'iban'),
    validatePaymentPurpose: createValidator(BankDetailsValidationSchema, 'paymentPurpose'),
    validateSwift: createValidator(BankDetailsValidationSchema, 'swift'),
    validateAddress: createValidator(BankDetailsValidationSchema, 'address'),
    validateAccount: createValidator(BankDetailsValidationSchema, 'account'),
};

export const SUPPORT_OPTIONS_VALIDATION_FUNCTIONS = {
    validateName: createValidator(SupportOptionsValidationSchema, 'name'),
    validateValue: createValidator(SupportOptionsValidationSchema, 'value'),
};
