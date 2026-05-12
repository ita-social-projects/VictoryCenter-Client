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
    },

    BUTTONS: {
        PUBLISH: COMMON_TEXT_ADMIN.BUTTON.SAVE_AS_PUBLISHED,
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
} as const;
