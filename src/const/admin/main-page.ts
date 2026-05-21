import { COMMON_TEXT_ADMIN } from './common';

export const MAIN_PAGE_TEXT = {
    TABS: {
        TITLE: 'Титульна',
        ABOUT_US: 'Про нас',
        STATISTICS: 'Статистика',
        DONATIONS: COMMON_TEXT_ADMIN.TAB.DONATE,
        PARTNERS: COMMON_TEXT_ADMIN.TAB.PARTNERS,
    },

    BLOCKS: {
        TITLE: {
            TITLE_LABEL: COMMON_TEXT_ADMIN.TYPE.TITLE,
            DESCRIPTION_LABEL: COMMON_TEXT_ADMIN.TYPE.DESCRIPTION,
        },
        ABOUT_US: {
            TITLE_LABEL: COMMON_TEXT_ADMIN.TYPE.TITLE,
            DESCRIPTION_LABEL: COMMON_TEXT_ADMIN.TYPE.DESCRIPTION,
        },
        STATISTICS: {
            TITLE_UA_LABEL: 'Заголовок (UA)',
            TITLE_EN_LABEL: 'Заголовок (ENG)',
            PREVIEW_TITLE: 'PREVIEW МЕТРИК',
            METRICS_TITLE: 'МЕТРИКИ',
            LANG: {
                UKR: 'UKR',
                ENG: 'ENG',
            },
        },
        EDIT_PANEL: {
            TITLE: 'Редагування',
            UKR_NAME_LABEL: 'UKR Назва',
            ENG_NAME_LABEL: 'ENG Назва',
            VALUE_LABEL: 'Значення',
            PREFIX_LABEL: 'Префікс',
            CANCEL_MODAL_TITLE: 'Відмінити зміни?',
            PREFIX_NONE: 'Без префікса',
        },
        PARTNERS: {
            TITLE_LABEL: COMMON_TEXT_ADMIN.TYPE.TITLE,
            DESCRIPTION_LABEL: COMMON_TEXT_ADMIN.TYPE.DESCRIPTION,
        },
    },

    BUTTONS: {
        PUBLISH: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
        CANCEL: COMMON_TEXT_ADMIN.BUTTON.CANCEL,
        SAVE: COMMON_TEXT_ADMIN.BUTTON.SAVE,
    },

    ERRORS: {
        LOAD_FAILED: 'Виникла помилка, не вдалося завантажити дані сторінки',
        TOGGLE_VISIBILITY_FAILED: 'Не вдалося змінити видимість',
        REORDER_FAILED: 'Не вдалося зберегти порядок',
    },
} as const;

export const MAIN_PAGE_VALIDATION = {
    common: {
        REQUIRED: COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
    },

    titleBlock: {
        title: {
            min: 10,
            max: 50,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(50),
        },
        description: {
            min: 10,
            max: 300,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(300),
        },
    },

    aboutUsBlock: {
        title: {
            min: 10,
            max: 50,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(50),
        },
        description: {
            min: 10,
            max: 1000,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(1000),
        },
    },

    partnersBlock: {
        title: {
            min: 10,
            max: 50,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(50),
        },
        description: {
            min: 10,
            max: 1000,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(10),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(1000),
        },
    },

    statisticsBlock: {
        title: {
            min: 5,
            max: 100,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(5),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(100),
        },
    },

    editPanel: {
        name: {
            min: 2,
            max: 20,
            getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2),
            getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(20),
        },
    },
} as const;
