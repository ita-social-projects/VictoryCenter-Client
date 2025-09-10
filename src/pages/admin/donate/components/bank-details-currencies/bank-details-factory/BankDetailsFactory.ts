import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/bank-details-schema/bank-details-schema';
import { createGenericForm, GenericFormField } from '../../generic-form/GenericForm';

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
        validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateName(String(val ?? '')),
        isRequired: true,
    },
    {
        name: 'receiver',
        label: 'Одержувач',
        validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver(String(val ?? '')),
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
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? '')),
            isRequired: true,
        },
        {
            name: 'swift',
            label: 'SWIFT-код банку',
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift(String(val ?? '')),
            isRequired: true,
        },
        {
            name: 'address',
            label: 'Адреса',
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress(String(val ?? '')),
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
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou(String(val ?? '')),
            isRequired: true,
        },
        {
            name: 'iban',
            label: 'IBAN (UAH)',
            prefix: 'UA',
            onlyNumbers: true,
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? '')),
            isRequired: true,
        },
        {
            name: 'paymentPurpose',
            label: 'Призначення платежу',
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose(String(val ?? '')),
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

export const CorrespondentBankDetailsForm = createGenericForm<CorrespondentBankDetails>(correspondentBanksFields);
