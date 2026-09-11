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
