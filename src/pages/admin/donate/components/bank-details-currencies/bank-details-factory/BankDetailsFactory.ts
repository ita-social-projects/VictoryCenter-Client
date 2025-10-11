import { DONATE_TEXT } from '../../../../../../const/admin/donate';
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
        placeholder: DONATE_TEXT.BANK_DETAILS.NAME.PLACEHOLDER,
        maxLength: 200,
    },
    {
        name: 'receiver',
        label: DONATE_TEXT.BANK_DETAILS.RECEIVER.TITLE,
        validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver(String(val ?? '')),
        isRequired: true,
        maxLength: 200,
    },
];

function createForeignFields(currency: 'USD' | 'EUR'): GenericFormField<ForeignBankDetails>[] {
    return [
        ...baseFields,
        {
            name: 'iban',
            label: `${DONATE_TEXT.BANK_DETAILS.IBAN.TITLE} (${currency})`,
            prefix: 'UA',
            onlyNumbers: true,
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? '')),
            isRequired: true,
            maxLength: 29,
        },
        {
            name: 'swift',
            label: DONATE_TEXT.BANK_DETAILS.SWIFT.TITLE,
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift(String(val ?? '')),
            isRequired: true,
            placeholder: DONATE_TEXT.BANK_DETAILS.SWIFT.PLACEHOLDER,
            maxLength: 20,
        },
        {
            name: 'address',
            label: DONATE_TEXT.BANK_DETAILS.ADDRESS.TITLE,
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress(String(val ?? '')),
            isRequired: true,
            maxLength: 200,
        },
    ];
}

function createUahFields(): GenericFormField<UahBankDetails>[] {
    return [
        ...baseFields,
        {
            name: 'edrpou',
            label: DONATE_TEXT.BANK_DETAILS.EDRPOU.TITLE,
            onlyNumbers: true,
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou(String(val ?? '')),
            isRequired: true,
            placeholder: DONATE_TEXT.BANK_DETAILS.EDRPOU.PLACEHOLDER,
            maxLength: 10,
        },
        {
            name: 'iban',
            label: `${DONATE_TEXT.BANK_DETAILS.IBAN.TITLE} (UAH)`,
            prefix: 'UA',
            onlyNumbers: true,
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? '')),
            isRequired: true,
            maxLength: 29,
        },
        {
            name: 'paymentPurpose',
            label: DONATE_TEXT.BANK_DETAILS.PAYMENT_PURPOSE.TITLE,
            validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose(String(val ?? '')),
            isRequired: true,
            maxLength: 500,
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
    {
        name: 'name',
        isTitle: true,
        validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateName(String(val ?? '')),
        isRequired: true,
    },
    {
        name: 'swift',
        label: DONATE_TEXT.CORRESPONDENT_BANKS.SWIFT.TITLE,
        validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift(String(val ?? '')),
        isRequired: true,
        placeholder: DONATE_TEXT.CORRESPONDENT_BANKS.DEFAULT_PLACEHOLDER,
        maxLength: 20,
    },
    {
        name: 'account',
        label: DONATE_TEXT.CORRESPONDENT_BANKS.ACCOUNT.TITLE,
        validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateAccount(String(val ?? '')),
        isRequired: true,
        placeholder: DONATE_TEXT.CORRESPONDENT_BANKS.DEFAULT_PLACEHOLDER,
        maxLength: 20,
    },
    {
        name: 'iban',
        label: DONATE_TEXT.CORRESPONDENT_BANKS.IBAN.TITLE,
        validate: (val) => BANK_DETAILS_VALIDATION_FUNCTIONS.validateIban(String(val ?? '')),
        placeholder: DONATE_TEXT.CORRESPONDENT_BANKS.DEFAULT_PLACEHOLDER,
        maxLength: 29,
    },
];

export const CorrespondentBankDetailsForm = createGenericForm<CorrespondentBankDetails>(correspondentBanksFields);
