import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

const getGenericRequiredError = () => `Поле обов'язкове`;

export const EVENTS_TEXT = {
    BUTTON: {
        ADD_EVENT: 'Додати новину, подію',
        ADD_MATERIAL: 'Додати матеріал',
    },
    PLACEHOLDER: {
        SEARCH_EVENTS: 'Введіть назву',
    },
    PAGE_CONTENT: {
        SECTION: {
            PAGE_DESCRIPTION: {
                ID: 'events-page-description' as const,
                TITLE: 'Опис сторінки для користувачів',
            },
            EVENTS_BLOCK_TITLE: {
                ID: 'events-block-title' as const,
                TITLE: 'Заголовок блоку подій',
            },
        },
        PLACEHOLDER: {
            PAGE_DESCRIPTION: 'Введіть опис сторінки',
            EVENTS_BLOCK_TITLE: 'Введіть заголовок блоку подій',
        },
        ARIA_LABEL: {
            EDIT_SECTION: 'Редагувати секцію',
            VIEW_SECTION: 'Переглянути секцію',
        },
        CHARACTER_LIMIT: {
            PAGE_DESCRIPTION: 1000,
            EVENTS_BLOCK_TITLE: 100,
        },
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

export const EVENTS_PAGE_VALIDATION = {
    PAGE_DESCRIPTION: {
        min: 10,
        max: EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.PAGE_DESCRIPTION,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(EVENTS_PAGE_VALIDATION.PAGE_DESCRIPTION.min),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(EVENTS_PAGE_VALIDATION.PAGE_DESCRIPTION.max),
    },
    EVENTS_BLOCK_TITLE: {
        min: 10,
        max: EVENTS_TEXT.PAGE_CONTENT.CHARACTER_LIMIT.EVENTS_BLOCK_TITLE,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(EVENTS_PAGE_VALIDATION.EVENTS_BLOCK_TITLE.min),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(EVENTS_PAGE_VALIDATION.EVENTS_BLOCK_TITLE.max),
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
    eventItemsCount: {
        getHasEventNewsCountError: (count: number) => `Категорія використовується, ${count} записи`,
        getRelocationOrRemovalHint: () => 'Видаліть або замініть їх',
    },
};

export const EVENT_CATEGORY_TEXT = {
    FORM: {
        LABEL: {
            NAME: 'Назва',
            CATEGORY: 'Категорія',
        },
        NAME_PLACEHOLDER: 'Введіть назву категорії',
    },
};

export const EVENT_VALIDATION = {
    image: {
        cropWidth: 650,
        cropHeight: 360,
        minWidth: 650,
        minHeight: 360,
        maxSizeMB: 5,
        allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        getFormatError: () => 'Невірний формат фото, дозволено jpeg, jpg, png, webp',
        getSizeError: (maxSizeMB: number) => `Фото не більше ${maxSizeMB} Mb`,
        getDimensionTooSmallError: () => 'Розмір зображення менший за рекомендований',
        getRequiredError: () => getGenericRequiredError(),
    },
    title: {
        min: 10,
        max: 60,
        getRequiredError: () => getGenericRequiredError(),
        getMinError: () => `Не менше ${EVENT_VALIDATION.title.min} символів`,
        getMaxError: () => `Не більше ${EVENT_VALIDATION.title.max} символів`,
    },
    description: {
        min: 10,
        max: 140,
        getRequiredError: () => getGenericRequiredError(),
        getMinError: () => `Не менше ${EVENT_VALIDATION.description.min} символів`,
        getMaxError: () => `Не більше ${EVENT_VALIDATION.description.max} символів`,
    },
    additionalDescription: {
        min: 2,
        max: 20,
        getMinError: () => `Не менше ${EVENT_VALIDATION.additionalDescription.min} символів`,
        getMaxError: () => `Не більше ${EVENT_VALIDATION.additionalDescription.max} символів`,
    },
    linkUkr: {
        min: 5,
        max: 10000,
        getRequiredError: () => getGenericRequiredError(),
        getMinError: () => `Не менше ${EVENT_VALIDATION.linkUkr.min} символів`,
        getMaxError: () => `Не більше ${EVENT_VALIDATION.linkUkr.max} символів`,
    },
    linkEng: {
        min: 5,
        max: 10000,
        getMinError: () => `Не менше ${EVENT_VALIDATION.linkEng.min} символів`,
        getMaxError: () => `Не більше ${EVENT_VALIDATION.linkEng.max} символів`,
    },
    publishDate: {
        getInvalidError: () => 'Невірний формат дати',
        getRequiredError: () => getGenericRequiredError(),
    },
};

export const EVENT_NOTIFICATION_TIMERS = {
    SYNC_ERROR_MS: 3000,
};

export const DEFAULT_LOAD_ITEMS_COUNT = 5;
export const LIST_ITEM_HEIGHT_IN_PIXELS = 120;

export const EVENT_ITEMS_TEXT = {
    MESSAGE: {
        FAILED_TO_FETCH_ITEMS: 'Виникла помилка, не вдалось завантажити новини та події',
    },
    ACTIONS: {
        REORDER: 'Змінити порядок елемента',
        EDIT: 'Редагувати матеріал',
        DELETE: 'Видалити матеріал',
    },
    NO_RECORDS: 'Ще немає матеріалу',
};
