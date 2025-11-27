const getMinDigitsError = (count: number) => `Введено менше ${count} цифр`;
const getMaxDigitsError = (count: number) => `Введено більше ${count} цифр`;
const getMinSymbolsError = (count: number) => `Введено менше ${count} символів`;
const getMaxSymbolsError = (count: number) => `Введено більше ${count} символів`;
const getRequiredError = (field: string) => `${field} є обов'язковим полем`;
const getGenericRequiredError = () => `Поле обов'язкове`;

const COMMON_TEXT = {
    TITLE_IBAN: 'IBAN',
    TITLE_SWIFT: 'SWIFT',
    TITLE_EDRPOU: 'ЄДРПОУ',
    PLACEHOLDER_CODE: 'Введіть код',
    PLACEHOLDER_BANK_NAME: 'Введіть назву банку',
    BANK_NAME: 'Назва банку',
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
        SUPPORT_OPTIONS: {
            PUBLISHED: 'Варіант підтримки успішно опубліковано',
            DELETED: 'Варіант підтримки видалено успішно',
        },
        CHANGES_SAVED: 'Зміни успішно опубліковано',
        CORRESPONDENT_BANKS: {
            DELETED: 'Банк-кореспондент видалено успішно',
        },
    },
};

export const VALIDATION_PARAMS = {
    edrpou: { maxLength: 8 },
    ukrainianIban: { maxLength: 29, maxLengthWithoutPrefix: 27 },
    foreignIban: { maxLength: 34 },
    swift: { minLength: 8, maxLength: 11 },
    name: { maxLength: 200 },
    receiver: { maxLength: 200 },
    address: { maxLength: 200 },
    account: { maxLength: 34 },
    paymentPurpose: { maxLength: 500 },
    supportOptions: {
        name: { maxLength: 50 },
        value: { maxLength: 100 },
    },
};

export const DONATE_VALIDATION = {
    getDigitsOnlyError: () => `Мають бути цифри`,
    name: {
        maxLength: VALIDATION_PARAMS.name.maxLength,
        getRequiredError: () => getRequiredError(COMMON_TEXT.BANK_NAME),
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.name.maxLength),
    },
    receiver: {
        maxLength: VALIDATION_PARAMS.receiver.maxLength,
        getRequiredError: () => getRequiredError(DONATE_TEXT.BANK_DETAILS.RECEIVER.TITLE),
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.receiver.maxLength),
    },
    edrpou: {
        maxLength: VALIDATION_PARAMS.edrpou.maxLength,
        getMinError: () => getMinDigitsError(VALIDATION_PARAMS.edrpou.maxLength),
        getMaxError: () => getMaxDigitsError(VALIDATION_PARAMS.edrpou.maxLength),
        getRequiredError: () => getRequiredError(COMMON_TEXT.TITLE_EDRPOU),
    },
    ukrainianIban: {
        maxLength: VALIDATION_PARAMS.ukrainianIban.maxLength,
        getMinError: () => getMinDigitsError(VALIDATION_PARAMS.ukrainianIban.maxLengthWithoutPrefix),
        getMaxError: () => getMaxDigitsError(VALIDATION_PARAMS.ukrainianIban.maxLengthWithoutPrefix),
        getRequiredError: () => getRequiredError(COMMON_TEXT.TITLE_IBAN),
    },
    foreignIban: {
        maxLength: VALIDATION_PARAMS.foreignIban.maxLength,
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.foreignIban.maxLength),
    },
    paymentPurpose: {
        maxLength: VALIDATION_PARAMS.paymentPurpose.maxLength,
        getRequiredError: () => getRequiredError(DONATE_TEXT.BANK_DETAILS.PAYMENT_PURPOSE.TITLE),
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.paymentPurpose.maxLength),
    },
    swift: {
        minLength: VALIDATION_PARAMS.swift.minLength,
        maxLength: VALIDATION_PARAMS.swift.maxLength,
        getMinError: () => getMinSymbolsError(VALIDATION_PARAMS.swift.minLength),
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.swift.maxLength),
        getRequiredError: () => getRequiredError(COMMON_TEXT.TITLE_SWIFT),
    },
    address: {
        maxLength: VALIDATION_PARAMS.address.maxLength,
        getRequiredError: () => getRequiredError(DONATE_TEXT.BANK_DETAILS.ADDRESS.TITLE),
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.address.maxLength),
    },
    account: {
        maxLength: VALIDATION_PARAMS.account.maxLength,
        getRequiredError: () => getRequiredError(DONATE_TEXT.CORRESPONDENT_BANKS.ACCOUNT.TITLE),
        getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.account.maxLength),
    },
    supportOptions: {
        name: {
            maxLength: VALIDATION_PARAMS.supportOptions.name.maxLength,
            getRequiredError: () => getGenericRequiredError(),
            getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.supportOptions.name.maxLength),
        },
        value: {
            maxLength: VALIDATION_PARAMS.supportOptions.value.maxLength,
            getRequiredError: () => getGenericRequiredError(),
            getMaxError: () => getMaxSymbolsError(VALIDATION_PARAMS.supportOptions.value.maxLength),
        },
    },
};
