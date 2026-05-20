export const COMMON_TEXT_ADMIN = {
    TAB: {
        MAIN: 'Головна',
        PROFILE_COMPANY: 'Профіль',
        REPORTS: 'Звітність',
        TEAM_MEMBERS: 'Команда',
        PROGRAMS: 'Програми',
        DONATE: 'Донати',
        HISTORY: 'Історія',
        FAQ: 'Часті питання',
        WHO_WE_ARE: 'Хто ми',
        PARTNERS: 'Партнери',
    },

    ALT: {
        IMAGE_PREVIEW: "Прев'ю зображення",
    },

    INPUT: {
        IMAGE_PLACEHOLDER: 'Перетягніть файл сюди або натисніть для завантаження',
        UPLOAD_IMAGE: 'Upload image',
        DRAG_AND_DROP_FILE_HERE: 'Перетягніть файл сюди',
        ADD_FILE_HERE: 'Додайте файл сюди',
        getImageSizeSubText: (height: number, width: number) => `Розмір:${width}x${height}`,
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
        SUCCESSFULLY_PUBLISHED: 'Успішно опубліковано',
        UPDATES_SUCCESSFULLY_PUBLISHED: 'Зміни успішно опубліковані',
        FAIL_TO_PUBLISH_CHANGES: 'Не вдалося опублікувати зміни',
        TRANSLATION_SAVED_SUCCESS: 'Переклад збережено успішно',
        TRANSLATION_PUBLISHED_SUCCESS: 'Переклад опубліковано успішно',
    },

    BUTTON: {
        YES: 'Так',
        NO: 'Ні',
        SAVE: 'Зберегти',
        DELETE: 'Видалити',
        CANCEL: 'Відмінити',
        SAVE_AS_DRAFT: 'Зберегти як чернетку',
        SAVE_AS_PUBLISHED: 'Опублікувати',
        SAVE_TRANSLATION: 'Зберегти переклад',
        GENERATE_TRANSLATION: 'Згенерувати переклад',
        TRY_AGAIN: 'Спробувати ще раз',
        EXIT: 'Вихід',
    },

    LOCALIZATION: {
        FORM: {
            TITLE: {
                ADD_TRANSLATION: 'Додати переклад',
                UPDATE_TRANSLATION: 'Редагувати переклад',
            },
        },
        LANGUAGES: {
            MESSAGE: {
                FAILED_TO_FETCH_LANGUAGES: 'Виникла помилка, не вдалось завантажити мови',
            },
        },
    },

    CATEGORIES: {
        MESSAGE: {
            FAIL_TO_FETCH_CATEGORIES: 'Виникла помилка, не вдалось завантажити категорії',
        },

        BUTTON: {
            ADD_CATEGORY: 'Додати категорію',
            EDIT_CATEGORY: 'Редагувати',
            DELETE_CATEGORY: 'Видалити',
            ADD_TRANSLATION: 'Додати переклад',
        },

        FORM: {
            TITLE: {
                ADD_CATEGORY: 'Додати категорію',
                EDIT_CATEGORY: 'Редагувати категорію',
                DELETE_CATEGORY: 'Видалити категорію',
                DELETE_CATEGORY_CONFIRM: 'Видалити категорію?',
            },
            MESSAGE: {
                ALREADY_CONTAIN_CATEGORY_WITH_NAME: 'Категорія з такою назвою вже існує',
                FAIL_TO_CREATE_CATEGORY: 'Виникла помилка під час додавання категорії',
                FAIL_TO_UPDATE_CATEGORY: 'Виникла помилка під час оновлення категорії',
                FAIL_TO_DELETE_CATEGORY: 'Виникла помилка під час видалення категорії',
            },
            LABEL: {
                NAME: 'Назва',
                EDIT_NAME: 'Редагувати назву',
                CATEGORY: 'Категорія',
            },
        },
    },

    TYPE: {
        DESCRIPTION: 'Опис',
        TITLE: 'Заголовок',
    },

    VALIDATION_MESSAGE: {
        FIELD_REQUIRED: "Поле обов'язкове",
        getMinError: (min: number) => `Не менше ${min} символів`,
        getMaxError: (max: number) => `Не більше ${max} символів`,
        getImageDimensionError: (height: number, width: number) => `Розмір фото має бути ${width}X${height}`,
    },
};

export const UI_CONFIG = {
    SEARCH_BAR: {
        SEARCH_DELAY_MS: 100,
        MIN_CHARACTERS_FOR_SEARCH: 3,
        MAX_CHARACTERS_FOR_SEARCH: {
            FAQ: 150,
            PROGRAMS: 90,
            TEAM_MEMBERS: 50,
        },
    },
};

export const LANGUAGES = {
    EN: 'Англійська',
    UK: 'Українська',
};
