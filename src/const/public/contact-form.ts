export const CONTACT_FORM_LIMITS = {
    SUBJECT: {
        MIN: 5,
        MAX: 100,
        INFO_AT: 80,
    },
    MESSAGE: {
        MIN: 10,
        MAX: 2000,
        INFO_AT: 1800,
    },
} as const;

export const CONTACT_FORM_MESSAGES = {
    NAME: {
        REQUIRED: "Введіть Ваше ім'я",
    },
    EMAIL: {
        REQUIRED: "Введіть E-mail для зв'язку",
        INVALID: 'Некоректний E-mail',
    },
    SUBJECT: {
        REQUIRED: 'Введіть тему звернення',
        MIN_ERROR: `Не менше ${CONTACT_FORM_LIMITS.SUBJECT.MIN} символів`,
        LIMIT_REACHED: 'Ліміт символів вичерпано',
        getInfoMessage: (remaining: number) => `Залишилось ${remaining} символів`,
    },
    MESSAGE: {
        REQUIRED: 'Введіть повідомлення',
        MIN_ERROR: `Не менше ${CONTACT_FORM_LIMITS.MESSAGE.MIN} символів`,
        LIMIT_REACHED: 'Ліміт символів вичерпано',
        getInfoMessage: (remaining: number) => `Залишилось ${remaining} символів`,
    },
} as const;
