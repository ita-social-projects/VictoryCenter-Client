import { WhoWeAreImageConfigParams } from '@/pages/admin/who-we-are/components/sections/SectionsProps';

export const WHO_WE_ARE_TEXT = {
    IMAGE: {
        INPUT: 'Додайте файл сюди',
    },
    WHAT_WE_DO: 'Що ми робимо',
    GO_TO_PROGRAMS: 'Перейти до програм',
    WHO_WE_SUPPORT: 'Кого ми можемо підтримати',

    FAIL_TO_FETCH_PREVIEWS: 'Виникла помилка, не вдалось завантажити назви секцій',
    FAIL_TO_FETCH_SECTION: 'Виникла помилка, не вдалось завантажити секцію',

    FORM: {
        TITLE: {
            ADD_TRANSLATION: 'Додати переклад',
            EDIT_TRANSLATION: 'Редагувати переклад',
        },
        MESSAGE: {
            FAIL_TO_TRANSLATE_SECTION: 'Виникла помилка під час додавання перекладу для секції',
            FAIL_TO_UPDATE_TRANSLATION: 'Виникла помилка під час оновлення перекладу для секції',
        },
        LABEL: {
            TITLE: 'Заголовок',
            DESCRIPTION: 'Опис',
        },
    },

    MIN_LENGTH: 10,
};

export const IMAGE_CONFIGS = {
    MAIN_PAGE: {
        cropWidth: 1440,
        cropHeight: 860,
        minWidth: 1440,
        minHeight: 860,
        displayWidth: 841,
        displayHeight: 530,
    } as WhoWeAreImageConfigParams,
    TEAM_PAGE: {
        cropWidth: 840,
        cropHeight: 750,
        minWidth: 840,
        minHeight: 750,
    } as WhoWeAreImageConfigParams,
    WHO_WE_SUPPORT_CARDS: {
        cropWidth: 500,
        cropHeight: 430,
        minWidth: 500,
        minHeight: 430,
        displayWidth: 480,
        displayHeight: 430,
    } as WhoWeAreImageConfigParams,
    PEOPLE_CARDS: {
        cropWidth: 360,
        cropHeight: 430,
        minWidth: 360,
        minHeight: 430,
        displayWidth: 360,
        displayHeight: 430,
    } as WhoWeAreImageConfigParams,
};
