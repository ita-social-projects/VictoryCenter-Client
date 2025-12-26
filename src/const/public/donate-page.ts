import { Currency } from '@/types/public/donate-page';

export const DONATION_AMOUNTS = {
    [Currency.UAH]: {
        small: 100,
        medium: 200,
        large: 500,
    },
    [Currency.USD]: {
        small: 10,
        medium: 50,
        large: 100,
    },
    [Currency.EUR]: {
        small: 10,
        medium: 50,
        large: 100,
    },
};

export const UKRAINE_PAYMENT_DETAILS = {
    IBAN_UAH_LABEL: 'IBAN (UAH)',
};

export const PAYMENT_DETAILS_COMMON = {
    RECIPIENT_NAME_LABEL: 'ГО «ЦЕНТР ПЕРЕМОГИ»',
};

export const ABROAD_PAYMENT_DETAILS = {
    IBAN_EUR_LABEL: 'IBAN (EUR)',
    IBAN_EUR_NUMBER_LABEL: 'UA813052990000026001030140880',
    SWIFT_CODE_LABEL: 'SWIFT-код банку',
    SWIFT_CODE_VALUE_LABEL: 'PBANUA2X',
    BANK_NAME_TRANSLITERATED_LABEL: 'JSC CB "PRIVATBANK", ',
    BANK_STREET_TRANSLITERATED_LABEL: '1D Hrushevskoho Str., ',
    COUNTRY_LABEL: '01001, Україна, ',
    CITY_LABEL: 'м. Київ, вул. Шулявська, б. 20/22, кв. 41',
    CORRESPONDENT_BANKS_LABEL: 'Кореспондентські банки (один із варіантів на вибір)',
    JP_MORGAN_CHASE_BANK_USA_LABEL: 'JP Morgan Chase Bank, New York, USA',
    SWIFT_LABEL: 'SWIFT: ',
    SWIFT_JP_MORGAN_CODE_USA_LABEL: 'CHASUS33',
    ACCOUNT_LABEL: 'Account: ',
    ACCOUNT_JP_MORGAN_CODE_USA_LABEL: '001-1-000080',
    BANK_OF_NEW_YORK_MELLON_USA_LABEL: 'The Bank of New York Mellon, New York, USA',
    SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL: 'IRVTUS3N',
    ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL: '890-0085-754',
    CITY_BANK_USA_LABEL: 'Citibank N.A., New York, USA',
    SWIFT_CITY_BANK_USA_CODE_LABEL: 'CITIUS33',
    ACCOUNT_CITY_BANK_USA_CODE_LABEL: '36445343',
    COMMERZBANK_AG_GERMANY_LABEL: 'Commerzbank AG, Frankfurt am Main, Germany',
    SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL: 'COBADEFF',
    ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL: '400886700401',
    JP_MORGAN_AG_GERMANY_LABEL: 'J.P. Morgan AG, Frankfurt am Main, Germany',
    SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL: 'CHASDEFX',
    ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL: '6231605145',
    BANK_OF_NEW_YORK_MELLON_FRANKFURT_LABEL: 'The Bank of New York Mellon, Frankfurt am Main',
    SWIFT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL: 'IRVTDEFX',
    ACCOUNT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL: '5184099710',
    IBAN_LABEL: 'IBAN: ',
    IBAN_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL: 'DE39503303005184099710',
    CITY_BANK_IRELAND_LABEL: 'Citibank Europe PLC, Ireland',
    SWIFT_CITY_BANK_IRELAND_CODE_LABEL: 'CITIIE2X',
    ACCOUNT_CITY_BANK_IRELAND_CODE_LABEL: '0042997188',
    IBAN_CITY_BANK_IRELAND_CODE_LABEL: 'IE96CITI99005142997188',
    IBAN_USD_LABEL: 'IBAN (USD)',
    IBAN_USD_NUMBER_LABEL: 'UA613052990000026006020145317',
    BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL: 'Kyiv, 01001, Ukraine',
};

export const CORRESPONDENT_BANKS = {
    USD: [
        {
            title: ABROAD_PAYMENT_DETAILS.JP_MORGAN_CHASE_BANK_USA_LABEL,
            fields: [
                {
                    label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.SWIFT_JP_MORGAN_CODE_USA_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.ACCOUNT_JP_MORGAN_CODE_USA_LABEL,
                },
            ],
        },
        {
            title: ABROAD_PAYMENT_DETAILS.BANK_OF_NEW_YORK_MELLON_USA_LABEL,
            fields: [
                {
                    label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.SWIFT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.ACCOUNT_BANK_OF_NEW_YORK_MELLON_USA_CODE_LABEL,
                },
            ],
        },
        {
            title: ABROAD_PAYMENT_DETAILS.CITY_BANK_USA_LABEL,
            fields: [
                {
                    label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.SWIFT_CITY_BANK_USA_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.ACCOUNT_CITY_BANK_USA_CODE_LABEL,
                },
            ],
        },
    ],
    EUR: [
        {
            title: ABROAD_PAYMENT_DETAILS.COMMERZBANK_AG_GERMANY_LABEL,
            fields: [
                {
                    label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.SWIFT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.ACCOUNT_COMMERZBANK_AG_GERMANY_CODE_LABEL,
                },
            ],
        },
        {
            title: ABROAD_PAYMENT_DETAILS.JP_MORGAN_AG_GERMANY_LABEL,
            fields: [
                {
                    label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.SWIFT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.ACCOUNT_JP_MORGAN_AG_GERMANY_CODE_LABEL,
                },
            ],
        },
        {
            title: ABROAD_PAYMENT_DETAILS.BANK_OF_NEW_YORK_MELLON_FRANKFURT_LABEL,
            fields: [
                {
                    label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.SWIFT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.ACCOUNT_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.IBAN_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.IBAN_BANK_OF_NEW_YORK_MELLON_FRANKFURT_CODE_LABEL,
                },
            ],
        },
        {
            title: ABROAD_PAYMENT_DETAILS.CITY_BANK_IRELAND_LABEL,
            fields: [
                {
                    label: ABROAD_PAYMENT_DETAILS.SWIFT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.SWIFT_CITY_BANK_IRELAND_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.ACCOUNT_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.ACCOUNT_CITY_BANK_IRELAND_CODE_LABEL,
                },
                {
                    label: ABROAD_PAYMENT_DETAILS.IBAN_LABEL,
                    value: ABROAD_PAYMENT_DETAILS.IBAN_CITY_BANK_IRELAND_CODE_LABEL,
                },
            ],
        },
    ],
};
