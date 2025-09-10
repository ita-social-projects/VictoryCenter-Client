import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../validation/admin/bank-details-schema/bank-details-schema';
import { createGenericForm, GenericFormField } from '../generic-form/GenericForm';

export interface UsdBankDetails {
    id?: number;
    name: string;
    receiver: string;
    iban: string;
    swift: string;
    address: string;
    correspondentBanks: CorrespondentBankDetails[];
}

const usdFields: GenericFormField<UsdBankDetails>[] = [
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
        name: 'iban',
        label: 'IBAN (USD)',
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

export interface CorrespondentBankDetails {
    id?: number;
    name: string;
    swift: string;
    account: string;
    iban?: string;
}

const correspondentBanksFields: GenericFormField<CorrespondentBankDetails>[] = [
    { name: 'name', isTitle: true, isRequired: true },
    { name: 'swift', label: 'SWIFT', isRequired: true },
    { name: 'account', label: 'Account', isRequired: true },
    { name: 'iban', label: 'IBAN' },
];

export const CorrespondentBankDetialsForm = createGenericForm<CorrespondentBankDetails>(correspondentBanksFields);

export const UsdBankDetailsForm = createGenericForm<UsdBankDetails>(usdFields);
