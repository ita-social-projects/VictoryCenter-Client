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
            IMAGE_LABEL: 'Зображення',
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

    title: {
        max: 50,
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(50),
    },

    description: {
        max: 1000,
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(1000),
    },
} as const;
