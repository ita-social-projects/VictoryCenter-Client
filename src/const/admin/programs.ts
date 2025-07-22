export const PROGRAMS_TEXT = {
    BUTTON: {
        ADD_PROGRAM: 'Додати програму',
    },

    QUESTION: {
        PUBLISH_PROGRAM: 'Опублікувати нову програму?',
    },

    FORM: {
        TITLE: {
            ADD_PROGRAM: 'Додати програму',
            EDIT_PROGRAM: 'Редагування програми',
            DELETE_PROGRAM: 'Видалити програму?',
        },
        MESSAGE: {
            FAIL_TO_CREATE_CATEGORY: 'Виникла помилка під час додавання програми',
            FAIL_TO_UPDATE_CATEGORY: 'Виникла помилка під час оновлення програми',
            FAIL_TO_DELETE_CATEGORY: 'Виникла помилка під час видалення програми',
        },
        LABEL: {
            NAME: 'Назва',
            DESCRIPTION: 'Опис',
            CATEGORY: 'Категорія',
            SELECT_CATEGORY: 'Виберіть категорію',
            PHOTO: 'Фото',
            PHOTO_DRAG_DROP: 'Перетягніть файл сюди або натисніть для завантаження',
        },
    },
};

export const PROGRAM_CATEGORY_TEXT = {
    BUTTON: {
        ADD_CATEGORY: 'Додати категорії',
        EDIT_CATEGORY: 'Редагувати',
        DELETE_CATEGORY: 'Видалити',
    },
    FORM: {
        TITLE: {
            ADD_CATEGORY: 'Додати категорію',
            EDIT_CATEGORY: 'Редагувати категорію',
            DELETE_CATEGORY: 'Видалити категорію',
        },
        MESSAGE: {
            ALREADY_CONTAIN_CATEGORY_WITH_NAME: 'Категорія з такою назвою вже існує',
            FAIL_TO_CREATE_CATEGORY: 'Виникла помилка під час додавання категорії',
            FAIL_TO_UPDATE_CATEGORY: 'Виникла помилка під час оновлення категорії',
            FAIL_TO_DELETE_CATEGORY: 'Виникла помилка під час видалення категорії',
        },
        LABEL: {
            NAME: 'Назва',
            CATEGORY: 'Категорія',
        },
    },
};

export const PROGRAM_VALIDATION = {
    name: {
        min: 5,
        max: 200,
        getRequiredError: () => 'Назва обов’язкова',
        getMinError: () => `Не менше ${PROGRAM_VALIDATION.name.min} символів`,
        getMaxError: () => `Не більше ${PROGRAM_VALIDATION.name.max} символів`,
    },
    description: {
        min: 10,
        max: 1000,
        getRequiredError: () => 'Опис обов’язковий',
        getMinError: () => `Не менше ${PROGRAM_VALIDATION.description.min} символів`,
        getMaxError: () => `Не більше ${PROGRAM_VALIDATION.description.max} символів`,
    },
    categories: {
        getAtLeastOneRequiredError: () => 'Потрібно обрати хоча б одну категорію',
    },
    img: {
        maxSizeBytes: 3 * 1024 * 1024,
        allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        getRequiredWhenPublishingError: () => 'Фото обов’язкове при публікації',
        getFormatError: () => 'Невірний формат фото, дозволено jpeg, jpg, png, webp',
        getSizeError: () => `Фото не більше ${PROGRAM_VALIDATION.img.maxSizeBytes / (1024 * 1024)} Mb`,
    },
};

export const PROGRAM_CATEGORY_VALIDATION = {
    name: {
        min: 5,
        max: 20,
        getRequiredError: () => 'Назва обов’язкова',
        getMinError: () => `Не менше ${PROGRAM_CATEGORY_VALIDATION.name.min} символи`,
        getMaxError: () => `Не більше ${PROGRAM_CATEGORY_VALIDATION.name.max} символів`,
        getCategoryWithThisNameAlreadyExistsError: () => 'Категорія з такою назвою вже існує',
    },
    programsCount: {
        getRelocationOrRemovalHint: () => 'Перенесіть їх в іншу категорію або видаліть, щоб продовжити',
        getHasProgramsCountError: (count: number) => `Категорія містить ${count} програм`,
    },
};
