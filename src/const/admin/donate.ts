const getMinDigitsError = (count: number) => `Введено менше ${count} цифр`;
const getMaxDigitsError = (count: number) => `Введено більше ${count} цифр`;
const getMinSymbolsError = (count: number) => `Введено менше ${count} символів`;
const getMaxSymbolsError = (count: number) => `Введено більше ${count} символів`;
const getRequiredError = (field: string) => `${field} є обов'язковим полем`;

const COMMON_TEXT = {
    TITLE_IBAN: 'IBAN',
    TITLE_SWIFT: 'SWIFT',
    TITLE_EDRPOU: 'ЄДРПОУ',
    PLACEHOLDER_CODE: 'Введіть код',
    PLACEHOLDER_BANK_NAME: 'Введіть назву банку',
};

export const DONATE_TEXT = {
    BANK_DETAILS: {
        NOT_FOUND: 'Ще немає реквізитів',
        ADD_FIRST: 'Додати реквізити',
        ADD_NEW: 'Додати нові реквізити',

        DEFAULT_PLACEHOLDER: 'Введіть назву',
        NAME: {
            PLACEHOLDER: COMMON_TEXT.PLACEHOLDER_BANK_NAME,
        },
        RECEIVER: {
            TITLE: 'Одержувач',
        },
        EDRPOU: {
            TITLE: COMMON_TEXT.TITLE_EDRPOU,
            PLACEHOLDER: COMMON_TEXT.PLACEHOLDER_CODE,
        },
        IBAN: {
            TITLE: COMMON_TEXT.TITLE_IBAN,
        },
        PAYMENT_PURPOSE: {
            TITLE: 'Призначення платежу',
        },
        SWIFT: {
            TITLE: 'SWIFT-код банку',
            PLACEHOLDER: COMMON_TEXT.PLACEHOLDER_CODE,
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
            PLACEHOLDER: COMMON_TEXT.PLACEHOLDER_BANK_NAME,
        },
        SWIFT: {
            TITLE: COMMON_TEXT.TITLE_SWIFT,
        },
        ACCOUNT: {
            TITLE: 'Account',
        },
        IBAN: {
            TITLE: COMMON_TEXT.TITLE_IBAN,
        },
    },
    SUPPORT_OPTIONS: {
        TITLE: 'Інші варіанти підтримки',
        NOT_FOUND: 'Ще немає варіантів підтримки',
        ADD_FIRST: 'Додати варіант підтримки',
        ADD_NEW: 'Додати варіант',
        NAME: 'Назва',
        VALUE: 'Реквізити',
    },
    QUESTION: {
        BANK_DETAILS: {
            ADD: 'Додати нові реквізити?',
            CANCEL_CREATE: 'Відмінити додавання реквізитів?',
            DELETE: 'Видалити реквізити?',
            UPDATE: 'Опублікувати зміни?',
            FOREIGN: {
                DELETE: 'Основний та кореспондентські банки буде видалено. Видалити реквізити?',
            },
        },
        SUPPORT_OPTION: {
            ADD: 'Опублікувати новий варіант підтримки?',
            DELETE: 'Видалити варіант підтримки?',
            CANCEL_CREATE: 'Відмінити додавання варіанту підтримки?',
        },
        CORRESPONDENT_BANKS: {
            DELETE: 'Видалити банк-кореспондент?',
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
    MESSAGE: {
        SUPPORT_OPTION_PUBLISHED: 'Варіант підтримки успішно опубліковано',
        CHANGES_SAVED: 'Зміни успішно опубліковано',
        CORRESPONDENT_BANKS: {
            DELETED: 'Банк-кореспондент видалено успішно',
        },
    },
};

export const VALIDATION_PARAMS = {
    edrpou: { count: 8 },
    iban: { count: 29, errorLength: 27 },
    swift: { minLength: 8, maxLength: 11 },
};

export const DONATE_VALIDATION = {
    getDigitsOnlyError: () => `Мають бути цифри`,
    name: {
        getRequiredError: () => getRequiredError('Назва банку'),
    },
    receiver: {
        getRequiredError: () => getRequiredError(DONATE_TEXT.BANK_DETAILS.RECEIVER.TITLE),
    },
    edrpou: {
        count: VALIDATION_PARAMS.edrpou.count,
        getMinError: () => getMinDigitsError(VALIDATION_PARAMS.edrpou.count),
        getMaxError: () => getMaxDigitsError(VALIDATION_PARAMS.edrpou.count),
        getRequiredError: () => getRequiredError(COMMON_TEXT.TITLE_EDRPOU),
    },
    iban: {
        count: VALIDATION_PARAMS.iban.count,
        getMinError: () => getMinDigitsError(VALIDATION_PARAMS.iban.errorLength),
        getMaxError: () => getMaxDigitsError(VALIDATION_PARAMS.iban.errorLength),
        getRequiredError: () => getRequiredError(COMMON_TEXT.TITLE_IBAN),
    },
    paymentPurpose: {
        getRequiredError: () => getRequiredError(DONATE_TEXT.BANK_DETAILS.PAYMENT_PURPOSE.TITLE),
    },
    swift: {
        minLength: VALIDATION_PARAMS.swift.minLength,
        maxLength: VALIDATION_PARAMS.swift.maxLength,
        getMinError: () => getMinSymbolsError(VALIDATION_PARAMS.swift.minLength),
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.swift.maxLength),
        getRequiredError: () => getRequiredError(COMMON_TEXT.TITLE_SWIFT),
    },
    address: {
        getRequiredError: () => getRequiredError(DONATE_TEXT.BANK_DETAILS.ADDRESS.TITLE),
    },
    account: {
        getRequiredError: () => getRequiredError(DONATE_TEXT.CORRESPONDENT_BANKS.ACCOUNT.TITLE),
    },
    supportOptions: {
        name: {
            getRequiredError: () => getRequiredError(DONATE_TEXT.SUPPORT_OPTIONS.NAME),
        },
        value: {
            getRequiredError: () => getRequiredError(DONATE_TEXT.SUPPORT_OPTIONS.VALUE),
        },
    },
};
