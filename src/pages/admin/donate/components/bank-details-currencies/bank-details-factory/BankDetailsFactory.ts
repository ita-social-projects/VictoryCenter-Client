import { DONATE_TEXT, VALIDATION_PARAMS } from '../../../../../../const/admin/donate';
import { BANK_DETAILS_VALIDATION_FUNCTIONS } from '../../../../../../validation/admin/bank-details-schema/bank-details-schema';
import { createGenericForm, GenericFormField } from '../../generic-form/GenericForm';

export interface BaseBankDetails {
    id?: number;
    name: string;
    receiver: string;
    ukrainianIban: string;
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
    foreignIban?: string;
}

type Validatable = string | number | boolean | Date | null | undefined;

const toStringSafe = (v: Validatable): string => {
    if (v === null || v === undefined) return '';
    if (typeof v === 'string') return v;
    if (typeof v === 'number' || typeof v === 'boolean') return String(v);
    if (v instanceof Date) return v.toISOString();
    return '';
};

const withNullCheck =
    (validator: (val: string) => string | undefined) =>
    (val: unknown): string | undefined =>
        validator(toStringSafe(val as Validatable));

const baseFields = [
    {
        name: 'name' as const,
        isTitle: true,
        validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateName),
        isRequired: true,
        placeholder: DONATE_TEXT.BANK_DETAILS.NAME.PLACEHOLDER,
        maxLength: VALIDATION_PARAMS.name.maxLength,
    },
    {
        name: 'receiver' as const,
        label: DONATE_TEXT.BANK_DETAILS.RECEIVER.TITLE,
        validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateReceiver),
        isRequired: true,
        maxLength: VALIDATION_PARAMS.receiver.maxLength,
    },
];

function createForeignFields(currency: 'USD' | 'EUR'): GenericFormField<ForeignBankDetails>[] {
    return [
        ...baseFields,
        {
            name: 'ukrainianIban',
            label: `${DONATE_TEXT.BANK_DETAILS.IBAN.TITLE} (${currency})`,
            prefix: 'UA',
            onlyNumbers: true,
            validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateUkrainianIban),
            isRequired: true,
            maxLength: VALIDATION_PARAMS.ukrainianIban.maxLengthWithoutPrefix,
        },
        {
            name: 'swift',
            label: DONATE_TEXT.BANK_DETAILS.SWIFT.TITLE,
            validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift),
            isRequired: true,
            placeholder: DONATE_TEXT.BANK_DETAILS.SWIFT.PLACEHOLDER,
            maxLength: VALIDATION_PARAMS.swift.maxLength,
        },
        {
            name: 'address',
            label: DONATE_TEXT.BANK_DETAILS.ADDRESS.TITLE,
            validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateAddress),
            isRequired: true,
            maxLength: VALIDATION_PARAMS.address.maxLength,
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
            validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateEdrpou),
            isRequired: true,
            placeholder: DONATE_TEXT.BANK_DETAILS.EDRPOU.PLACEHOLDER,
            maxLength: VALIDATION_PARAMS.edrpou.maxLength,
        },
        {
            name: 'ukrainianIban',
            label: `${DONATE_TEXT.BANK_DETAILS.IBAN.TITLE} (UAH)`,
            prefix: 'UA',
            onlyNumbers: true,
            validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateUkrainianIban),
            isRequired: true,
            maxLength: VALIDATION_PARAMS.ukrainianIban.maxLengthWithoutPrefix,
        },
        {
            name: 'paymentPurpose',
            label: DONATE_TEXT.BANK_DETAILS.PAYMENT_PURPOSE.TITLE,
            validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validatePaymentPurpose),
            isRequired: true,
            maxLength: VALIDATION_PARAMS.paymentPurpose.maxLength,
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
        validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateName),
        isRequired: true,
        maxLength: VALIDATION_PARAMS.name.maxLength,
        placeholder: DONATE_TEXT.CORRESPONDENT_BANKS.NAME.PLACEHOLDER,
    },
    {
        name: 'swift',
        label: DONATE_TEXT.CORRESPONDENT_BANKS.SWIFT.TITLE,
        validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateSwift),
        isRequired: true,
        placeholder: DONATE_TEXT.CORRESPONDENT_BANKS.DEFAULT_PLACEHOLDER,
        maxLength: VALIDATION_PARAMS.swift.maxLength,
    },
    {
        name: 'account',
        label: DONATE_TEXT.CORRESPONDENT_BANKS.ACCOUNT.TITLE,
        validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateAccount),
        placeholder: DONATE_TEXT.CORRESPONDENT_BANKS.DEFAULT_PLACEHOLDER,
        maxLength: VALIDATION_PARAMS.account.maxLength,
    },
    {
        name: 'foreignIban',
        label: DONATE_TEXT.CORRESPONDENT_BANKS.IBAN.TITLE,
        validate: withNullCheck(BANK_DETAILS_VALIDATION_FUNCTIONS.validateForeignIban),
        placeholder: DONATE_TEXT.CORRESPONDENT_BANKS.DEFAULT_PLACEHOLDER,
        maxLength: VALIDATION_PARAMS.foreignIban.maxLength,
    },
];

export const CorrespondentBankDetailsForm = createGenericForm<CorrespondentBankDetails>(correspondentBanksFields);
