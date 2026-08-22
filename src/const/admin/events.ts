export const EVENTS_TEXT = {
    BUTTON: {
        ADD_EVENT: 'Додати новину, подію',
    },
    PLACEHOLDER: {
        SEARCH_EVENTS: 'Введіть назву',
    },
    MESSAGE: {
        FAIL_TO_FETCH_CATEGORIES: 'Не вдалось завантажити категорії.',
    },
};

export const EVENT_CATEGORY_VALIDATION = {
    name: {
        min: 2,
        max: 20,
        getMinError: () => `Не менше ${EVENT_CATEGORY_VALIDATION.name.min} символів.`,
        getMaxError: () => `Не більше ${EVENT_CATEGORY_VALIDATION.name.max} символів.`,
        getRequiredError: () => 'Назва обов’язкова',
    },
};

export const EVENT_CATEGORY_TEXT = {
    FORM: {
        LABEL: {
            NAME: 'Назва',
            CATEGORY: 'Категорія',
        },
        NAME_PLACEHOLDER: 'Введіть назву категорії',
        SELECT_CATEGORY_PLACEHOLDER: 'Виберіть категорію',
    },
};