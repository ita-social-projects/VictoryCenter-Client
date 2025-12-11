import { COMMON_TEXT_ADMIN } from './common';

export const PROGRAMS_TEXT = {
    BUTTON: {
        ADD_PROGRAM: 'Додати програму',
    },
    PLACEHOLDER: {
        SEARCH_PROGRAMS: 'Шукати програми...',
    },

    MESSAGE: {
        FAIL_TO_FETCH_PROGRAMS: 'Виникла помилка, не вдалось завантажити програми',
        FAIL_TO_FETCH_PROGRAM: 'Не вдалося знайти вибрану програму',
        SELECTED_PROGRAM_HAS_NO_CATEGORIES: 'У вибраної програми відсутні категорії',
    },

    QUESTION: {
        PUBLISH_PROGRAM: 'Опублікувати нову програму?',
        DRAFT_PROGRAM: 'Зберегти нову програму?',
    },

    FORM: {
        TITLE: {
            ADD_PROGRAM: 'Додати програму',
            EDIT_PROGRAM: 'Редагування програми',
            DELETE_PROGRAM: 'Видалити програму?',
        },
        MESSAGE: {
            FAIL_TO_CREATE_PROGRAM: 'Виникла помилка під час додавання програми',
            FAIL_TO_UPDATE_PROGRAM: 'Виникла помилка під час оновлення програми',
            FAIL_TO_DELETE_PROGRAM: 'Виникла помилка під час видалення програми',
        },
        LABEL: {
            NAME: 'Назва',
            DESCRIPTION: 'Опис',
            CATEGORY: 'Категорія',
            SELECT_CATEGORY: 'Оберіть категорію',
            PHOTO: 'Фото',
        },
    },
};

export const PROGRAM_CATEGORY_TEXT = {
    FORM: {
        LABEL: {
            NAME: 'Назва',
            EDIT_NAME: 'Редагувати назву',
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
        getRequiredWhenPublishingError: () => 'Опис обов’язковий при публікації',
        getMinError: () => `Не менше ${PROGRAM_VALIDATION.description.min} символів`,
        getMaxError: () => `Не більше ${PROGRAM_VALIDATION.description.max} символів`,
    },
    categories: {
        getAtLeastOneRequiredError: () => 'Потрібно обрати хоча б одну категорію',
    },
    image: {
        cropWidth: 960,
        cropHeight: 870,
        minWidth: 960,
        minHeight: 870,
        maxSizeBytes: 3 * 1024 * 1024,
        allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        getRequiredWhenPublishingError: () => 'Фото обов’язкове при публікації',
        getFormatError: () => 'Невірний формат фото, дозволено jpeg, jpg, png, webp',
        getSizeError: () => `Фото не більше ${PROGRAM_VALIDATION.image.maxSizeBytes / (1024 * 1024)} Mb`,
    },
};

export const PROGRAM_CATEGORY_VALIDATION = {
    name: {
        min: 5,
        max: 20,
        getRequiredError: () => 'Назва обов’язкова',
        getMinError: () => `Не менше ${PROGRAM_CATEGORY_VALIDATION.name.min} символи`,
        getMaxError: () => `Не більше ${PROGRAM_CATEGORY_VALIDATION.name.max} символів`,
        getCategoryWithThisNameAlreadyExistsError: () =>
            COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.ALREADY_CONTAIN_CATEGORY_WITH_NAME,
    },
    programsCount: {
        getRelocationOrRemovalHint: () => 'Перенесіть їх в іншу категорію або видаліть, щоб продовжити',
        getHasProgramsCountError: (count: number) => `Категорія містить ${count} програм`,
    },
};
