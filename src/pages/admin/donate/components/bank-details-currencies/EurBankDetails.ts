import { createGenericForm, GenericFormField } from '../generic-form/GenericForm';

export interface EurBankDetails {
    id?: number;
    name: string;
    receiver: string;
    iban: string;
    swift: string;
    address: string;
    correspondentBanks: CorrespondentBankDetails[];
}

const eurFields: GenericFormField<EurBankDetails>[] = [
    { name: 'name', isTitle: true },
    { name: 'receiver', label: 'Одержувач' },
    { name: 'iban', label: 'IBAN (EUR)' },
    { name: 'swift', label: 'SWIFT-код банку' },
    { name: 'address', label: 'Адреса' },
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

export const EurBankDetailsForm = createGenericForm<EurBankDetails>(eurFields);
