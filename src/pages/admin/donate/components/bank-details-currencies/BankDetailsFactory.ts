import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/bank-details-schema/bank-details-schema';
import { createGenericForm, GenericFormField } from '../generic-form/GenericForm';

export interface BaseBankDetails {
    id?: number;
    name: string;
    receiver: string;
    iban: string;
}

export interface ForeignBankDetails extends BaseBankDetails {
    swift: string;
    address: string;
    correspondentBanks: CorrespondentBankDetails[];
}

export interface UahBankDetails extends BaseBankDetails {
    edrpou: string;
    paymentPurpose: string;
}

export interface CorrespondentBankDetails {
    id?: number;
    name: string;
    swift: string;
    account: string;
    iban?: string;
}

const baseFields: GenericFormField<BaseBankDetails>[] = [
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
];

function createForeignFields(currency: 'USD' | 'EUR'): GenericFormField<ForeignBankDetails>[] {
    return [
        ...baseFields,
        {
            name: 'iban',
            label: `IBAN (${currency})`,
            prefix: 'UA',
            onlyNumbers: true,
            validate: (val, isPublishing) =>
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? ''), isPublishing ?? false),
            isRequired: true,
        },
        {
            name: 'swift',
            label: 'SWIFT-код банку',
            validate: (val, isPublishing) =>
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift(String(val ?? ''), isPublishing ?? false),
            isRequired: true,
        },
        {
            name: 'address',
            label: 'Адреса',
            validate: (val, isPublishing) =>
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress(String(val ?? ''), isPublishing ?? false),
            isRequired: true,
        },
    ];
}

function createUahFields(): GenericFormField<UahBankDetails>[] {
    return [
        ...baseFields,
        {
            name: 'edrpou',
            label: 'ЄДРПОУ',
            onlyNumbers: true,
            validate: (val, isPublishing) =>
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou(String(val ?? ''), isPublishing ?? false),
            isRequired: true,
        },
        {
            name: 'iban',
            label: 'IBAN (UAH)',
            prefix: 'UA',
            onlyNumbers: true,
            validate: (val, isPublishing) =>
                BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? ''), isPublishing ?? false),
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
}

export function createBankDetailsForm(type: 'USD' | 'EUR' | 'UAH') {
    switch (type) {
        case 'USD':
        case 'EUR':
            return createGenericForm<ForeignBankDetails>(createForeignFields(type));
        case 'UAH':
            return createGenericForm<UahBankDetails>(createUahFields());
    }
}

const correspondentBanksFields: GenericFormField<CorrespondentBankDetails>[] = [
    { name: 'name', isTitle: true, isRequired: true },
    { name: 'swift', label: 'SWIFT', isRequired: true },
    { name: 'account', label: 'Account', isRequired: true },
    { name: 'iban', label: 'IBAN' },
];

export const CorrespondentBankDetialsForm = createGenericForm<CorrespondentBankDetails>(correspondentBanksFields);
