export const CONTACT_FORM_LIMITS = {
    SUBJECT: {
        MIN: 5,
        MAX: 100,
        WARN_AT: 80,
    },
    MESSAGE: {
        MIN: 10,
        MAX: 2000,
        WARN_AT: 1800,
    },
} as const;

export const CONTACT_FORM_MESSAGES = {
    NAME: {
        REQUIRED: "Введіть Ваше ім'я",
    },
    EMAIL: {
        REQUIRED: " Введіть E-mail для зв'язку",
        INVALID: 'Не вірний E-mail',
    },
    SUBJECT: {
        REQUIRED: 'Введіть тему звернення',
        MIN_ERROR: 'Мін 5 символів',
        LIMIT_REACHED: 'Ліміт символів вичерпано',
        getWarnMessage: (remaining: number) => `Залишилось ${remaining} символів`,
    },
    MESSAGE: {
        REQUIRED: 'Введіть повідомлення',
        MIN_ERROR: 'Мін 10 символів',
        LIMIT_REACHED: 'Ліміт символів вичерпано',
        getWarnMessage: (remaining: number) => `Залишилось ${remaining} символів`,
    },
} as const;
