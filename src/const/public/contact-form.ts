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
