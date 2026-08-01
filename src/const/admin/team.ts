import { COMMON_TEXT_ADMIN } from './common';

export const TEAM_MEMBERS_TEXT = {
    SEARCH: {
        INPUT_FULLNAME: "Введіть ім'я та прізвище",
    },
    BUTTON: {
        ADD_MEMBER: 'Додати в команду',
    },

    MESSAGE: {
        FAIL_TO_FETCH_MEMBERS: 'Виникла помилка, не вдалось завантажити учасників команди',
        FAIL_TO_REORDER_MEMBERS: 'Виникла помилка, не вдалось змінити пріоритет учасників команди',
        DONT_FORGET_TO_ORDER: 'Не забудьте налаштувати порядок відображення члена команди на сайті',
    },

    QUESTION: {
        PUBLISH_MEMBER: 'Опублікувати нового члена команди?',
        DRAFT_MEMBER: 'Зберегти нового члена команди?',
    },

    FORM: {
        TITLE: {
            ADD_MEMBER: 'Додати в команду',
            EDIT_MEMBER: 'Редагування члена команди',
            DELETE_MEMBER: 'Видалити члена команди?',
        },
        MESSAGE: {
            FAIL_TO_CREATE_MEMBER: 'Виникла помилка під час додавання учасника',
            FAIL_TO_UPDATE_MEMBER: 'Виникла помилка під час оновлення учасника',
            FAIL_TO_DELETE_MEMBER: 'Виникла помилка під час видалення учасника',
            FAIL_TO_TRANSLATE_MEMBER: 'Виникла помилка під час додавання перекладу для учасника',
            FAIL_TO_UPDATE_TRANSLATION: 'Виникла помилка під час оновлення перекладу для учасника',
        },
        LABEL: {
            FULLNAME: "Ім'я та Прізвище",
            DESCRIPTION: 'Опис',
            CATEGORY: 'Категорія',
            SELECT_CATEGORY: 'Оберіть категорію',
            PHOTO: 'Фото',
        },
    },

    ACTIONS: {
        REORDER: 'Змінити порядок елемента',
        EDIT: 'Редагувати учасника',
        DELETE: 'Видалити учасника',
        TRANSLATE: 'Додати переклад для учасника',
    },
};

export const TEAM_SEARCH = {
    SUGGESTIONS_PAGE_SIZE: 5,
    MIN_CHARACTERS_TO_SEARCH: 2,
};

export const TEAM_MEMBER_VALIDATION = {
    fullName: {
        min: 2,
        max: 50,
        allowedCharsPattern: /^[A-Za-zА-Яа-яҐґЄєІіЇї'’ʼ`\-\s0-9]+$/,
        digitsPattern: /\d/,
        getInvalidCharsError: () => 'Поле може містити лише літери, пробіли, ’ -',
        getDigitsError: () => 'Поле не може містити цифри',
        getRequiredError: () => "Поле обов'язкове",
        getMinError: () => `Не менше ${TEAM_MEMBER_VALIDATION.fullName.min} символів`,
        getMaxError: () => `Не більше ${TEAM_MEMBER_VALIDATION.fullName.max} символів`,
    },
    description: {
        min: 10,
        max: 200,
        getRequiredError: () => "Поле обов'язкове",
        getRequiredWhenPublishingError: () => "Опис обов'язковий при публікації",
        getMinError: () => `Не менше ${TEAM_MEMBER_VALIDATION.description.min} символів`,
        getMaxError: () => `Не більше ${TEAM_MEMBER_VALIDATION.description.max} символів`,
    },
    category: {
        getRequiredError: () => "Поле обов'язкове",
    },
    img: {
        getRequiredWhenPublishingError: () => "Фото обов'язкове при публікації",
        croppedWidth: 320,
        croppedHeight: 400,
        minWidth: 320,
        minHeight: 400,
    },
};

export const TEAM_CATEGORY_TEXT = {
    FORM: {
        LABEL: {
            NAME: 'Назва',
            DESCRIPTION: 'Опис',
            CATEGORY: 'Категорія',
        },
        MESSAGE: {
            FAIL_TO_TRANSLATE_TEAM_CATEGORY: 'Виникла помилка під час додавання перекладу для категорії учасників',
            FAIL_TO_UPDATE_TRANSLATION_FOR_TEAM_CATEGORY:
                'Виникла помилка під час оновлення перекладу для категорії учасників',
        },
    },
};
export const TEAM_IMAGE_PLACEHOLDER = {
    INPUT: 'Додайте файл сюди',
    SIZE: `Розмір: ${TEAM_MEMBER_VALIDATION.img.croppedWidth}x${TEAM_MEMBER_VALIDATION.img.croppedHeight}`,
};

export const TEAM_CATEGORY_VALIDATION = {
    name: {
        min: 10,
        max: 20,
        getRequiredError: () => 'Назва обов’язкова',
        getMinError: () => `Не менше ${TEAM_CATEGORY_VALIDATION.name.min} символів`,
        getMaxError: () => `Не більше ${TEAM_CATEGORY_VALIDATION.name.max} символів`,
        getDuplicateNameError: () => COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.ALREADY_CONTAIN_CATEGORY_WITH_NAME,
    },
    description: {
        min: 10,
        max: 200,
        getRequiredError: () => 'Опис обов’язковий',
        getMinError: () => `Не менше ${TEAM_CATEGORY_VALIDATION.description.min} символів`,
        getMaxError: () => `Не більше ${TEAM_CATEGORY_VALIDATION.description.max} символів`,
    },
    teamMembersCount: {
        getHasTeamMembersCountError: (count: number) => `Категорія містить ${count} членів команди`,
        getRelocationOrRemovalHint: () => 'Перенесіть їх в іншу категорію або видаліть, щоб продовжити',
    },
};
