import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/bank-details-schema/bank-details-schema';
import { createGenericForm, GenericFormField } from '../generic-form/GenericForm';

export interface UahBankDetails {
    id?: number;
    name: string;
    receiver: string;
    edrpou: string;
    iban: string;
    paymentPurpose: string;
}

export const uahFields: GenericFormField<UahBankDetails>[] = [
    {
        name: 'name',
        isTitle: true,
        validate: (val, isPublishing) =>
            BANK_DETAILS_VALIDATION_FUNCTIONS.validateName(String(val ?? ''), isPublishing ?? false),
        isRequired: true,
    },
    {
        name: 'receiver',
        label: 'Одержувач',
        validate: (val, isPublishing) =>
            BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver(String(val ?? ''), isPublishing ?? false),
        isRequired: true,
    },
    {
        name: 'edrpou',
        label: 'ЄДРПОУ',
        validate: (val, isPublishing) =>
            BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou(String(val ?? ''), isPublishing ?? false),
        onlyNumbers: true,
        isRequired: true,
    },
    {
        name: 'iban',
        label: 'IBAN(UAH)',
        prefix: 'UA',
        validate: (val, isPublishing) =>
            BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? ''), isPublishing ?? false),
        onlyNumbers: true,
        isRequired: true,
    },
    {
        name: 'paymentPurpose',
        label: 'Призначення платежу',
        validate: (val, isPublishing) =>
            BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose(String(val ?? ''), isPublishing ?? false),
        isRequired: true,
    },
];

export const UahBankDetailsForm = createGenericForm<UahBankDetails>(uahFields);
