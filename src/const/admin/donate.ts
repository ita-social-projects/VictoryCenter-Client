const getMinDigitsError = (count: number) => `Введено менше ${count} цифр`;
const getMaxDigitsError = (count: number) => `Введено більше ${count} цифр`;
const getMinSymbolsError = (count: number) => `Введено менше ${count} символів`;
const getMaxSymbolsError = (count: number) => `Введено більше ${count} символів`;
const getRequiredError = (field: string) => `${field} є обов'язковим полем`;

export const DONATE_TEXT = {
    BANK_DETAILS: {
        NOT_FOUND: 'Ще немає реквізитів',
        ADD_FIRST: 'Додати реквізити',
        ADD_NEW: 'Додати нові реквізити',

        DEFAULT_PLACEHOLDER: 'Введіть назву',
        NAME: {
            PLACEHOLDER: 'Введіть назву банку',
        },
        RECEIVER: {
            TITLE: 'Одержувач',
        },
        EDRPOU: {
            TITLE: 'ЄДРПОУ',
            PLACEHOLDER: 'Введіть код',
        },
        IBAN: {
            TITLE: 'IBAN',
        },
        PAYMENT_PURPOSE: {
            TITLE: 'Призначення платежу',
        },
        SWIFT: {
            TITLE: 'SWIFT-код банку',
            PLACEHOLDER: 'Введіть код',
        },
        ADDRESS: {
            TITLE: 'Адреса',
        },
    },
    CORRESPONDENT_BANKS: {
        TITLE: 'Кореспондентські банки',
        ADD_NEW: 'Додати банк',

        DEFAULT_PLACEHOLDER: 'Введіть номер',
        NAME: {
            PLACEHOLDER: 'Введіть назву банку',
        },
        SWIFT: {
            TITLE: 'SWIFT',
        },
        ACCOUNT: {
            TITLE: 'Account',
        },
        IBAN: {
            TITLE: 'IBAN',
        },
    },
    SUPPORT_OPTIONS: {
        TITLE: 'Інші варіанти підтримки',
        NOT_FOUND: 'Ще немає варіантів підтримки',
        ADD_FIRST: 'Додати варіант підтримки',
        ADD_NEW: 'Додати варіант',
    },
    QUESTION: {
        BANK_DETAILS: {
            ADD: 'Додати нові реквізити?',
            DELETE: 'Видалити реквізити?',
            FOREIGN: {
                DELETE: 'Основний та кореспондентські банки буде видалено. Видалити реквізити?',
            },
        },
        SUPPORT_OPTION: {
            ADD: 'Додати новий варіант підтримки?',
            DELETE: 'Видалити реквізити?',
        },
    },
    BUTTON: {
        PUBLISH: 'Опублікувати',
        DELETE: 'Видалити банк',
    },
    PLACEHOLDER: {
        DEFAULT: 'Введіть назву',
        SUPPORT_OPTION: 'Введіть реквізити',
    },
};

export const DONATE_VALIDATION = {
    getDigitsOnlyError: () => `Мають бути цифри`,
    name: {
        getRequiredError: () => getRequiredError('Назва банку'),
    },
    receiver: {
        getRequiredError: () => getRequiredError('Одержувач'),
    },
    edrpou: {
        count: 8,
        getMinError: () => getMinDigitsError(DONATE_VALIDATION.edrpou.count),
        getMaxError: () => getMaxDigitsError(DONATE_VALIDATION.edrpou.count),
        getRequiredError: () => getRequiredError('ЄДРПОУ'),
    },
    iban: {
        count: 29,
        getMinError: () => getMinDigitsError(DONATE_VALIDATION.iban.count - 2),
        getMaxError: () => getMaxDigitsError(DONATE_VALIDATION.iban.count - 2),
        getRequiredError: () => getRequiredError('IBAN'),
    },
    paymentPurpose: {
        getRequiredError: () => getRequiredError('Призначення платежу'),
    },
    swift: {
        count: 11,
        getMinError: () => getMinSymbolsError(DONATE_VALIDATION.swift.count),
        getMaxError: () => getMaxSymbolsError(DONATE_VALIDATION.swift.count),
        getRequiredError: () => getRequiredError('SWIFT'),
    },
    address: {
        getRequiredError: () => getRequiredError('Адреса'),
    },
};
