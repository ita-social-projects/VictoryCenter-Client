export const COMMON_TEXT_ADMIN = {
    TAB: {
        TEAM_MEMBERS: 'Команда',
        PROGRAMS: 'Програми',
        DONATE: 'Донати',
        FAQ: 'Часті питання',
        WHO_WE_ARE: 'Хто ми',
    },

    ALT: {
        IMAGE_PREVIEW: "Прев'ю зображення",
    },

    INPUT: {
        IMAGE_PLACEHOLDER: 'Перетягніть файл сюди або натисніть для завантаження',
        UPLOAD_IMAGE: 'Upload image',
    },

    STATUS: {
        DEFAULT: 'Статус',
        DRAFT: 'Чернетка',
        PUBLISHED: 'Опубліковано',
    },

    TOOLTIP: {
        PUBLISHED_IN: 'Опубліковано в:',
        DRAFTED_IN: 'Збережено в:',
    },

    LIST: {
        NOT_FOUND: 'Нічого не знайдено',
    },

    FILTER: {
        SEARCH_BY_NAME: 'Пошук за назвою',
        STATUS: {
            ALL: 'Усі',
            PUBLISHED: 'Опубліковано',
            DRAFT: 'Чернетка',
        },
        CATEGORY: {
            CATEGORY_LABEL: 'Категорія',
            SELECT_CATEGORY: 'Оберіть категорію',
        },
    },

    QUESTION: {
        SAVE_CHANGES: 'Зберегти зміни?',
        CHANGES_WILL_BE_LOST_WISH_TO_CONTINUE: 'Зміни будуть втрачені. Бажаєте продовжити?',
        REMOVE_FROM_PUBLICATION: 'Зняти з публікації?',
        PUBLISH_CHANGES: 'Опублікувати зміни?',
    },

    MESSAGE: {
        SUCCESSFULLY_PUBLISHED: 'успішно опубліковано',
        FAIL_TO_PUBLISH_CHANGES: 'Не вдалося опублікувати зміни',
    },

    BUTTON: {
        YES: 'Так',
        NO: 'Ні',
        SAVE: 'Зберегти',
        DELETE: 'Видалити',
        CANCEL: 'Відмінити',
        SAVE_AS_DRAFT: 'Зберегти як чернетку',
        SAVE_AS_PUBLISHED: 'Опублікувати',
        TRY_AGAIN: 'Спробувати ще раз',
        EXIT: 'Вихід',
    },
    TYPE: {
        DESCRIPTION: 'Опис',
        TITLE: 'Заголовок',
    },

    VALIDATION_MESSAGE: {
        FIELD_REQUIRED: "Поле обов'язкове",
        getMinError: (min: number) => `Не менше ${min} символів`,
    },
};

export const UI_CONFIG = {
    SEARCH_BAR: {
        MIN_CHARACTERS_FOR_SEARCH: 3,
        SEARCH_DELAY_MS: 100,
    },
};
