export const EVENTS_TEXT = {
    BUTTON: {
        ADD_EVENT: 'Додати новину, подію',
    },
    PLACEHOLDER: {
        SEARCH_EVENTS: 'Введіть назву',
    },
    FORM: {
        MODAL_TITLE: 'Додати матеріал',
        LINKS_SECTION_TITLE: 'Додати посилання на матеріал',
        LABEL: {
            TITLE: 'Заголовок',
            DESCRIPTION: 'Опис',
            ADDITIONAL_DESCRIPTION: 'Додатковий опис',
            PUBLISH_DATE: 'Дата публікації',
            IMAGE: 'Фото',
            LINK_UKR: 'Посилання для UKR',
            LINK_ENG: 'Посилання для ENG',
        },
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

export const EVENT_VALIDATION = {
    title: {
        max: 60,
    },
    description: {
        max: 140,
    },
    additionalDescription: {
        max: 20,
    },
    link: {
        max: 10000,
    },
};
