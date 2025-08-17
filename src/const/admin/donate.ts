const getMinError = (count: number) => `Введено менше ${count} цифр`;
const getMaxError = (count: number) => `Введено більше ${count} цифр`;
const getRequiredError = (field: string) => `${field} є обов'язковим полем`;

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
        getMinError: () => getMinError(DONATE_VALIDATION.edrpou.count),
        getMaxError: () => getMaxError(DONATE_VALIDATION.edrpou.count),
        getRequiredError: () => getRequiredError('ЄДРПОУ'),
    },
    iban: {
        count: 29,
        getMinError: () => getMinError(DONATE_VALIDATION.iban.count),
        getMaxError: () => getMaxError(DONATE_VALIDATION.iban.count),
        getRequiredError: () => getRequiredError('IBAN'),
    },
    paymentPurpose: {
        getRequiredError: () => getRequiredError('Призначення платежу'),
    },
};
