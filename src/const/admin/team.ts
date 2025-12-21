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
        DONT_FORGET_TO_ORDER: 'Не забудь встановити порядок відображення',
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
        TRANSLATE: 'Зберегти переклад',
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
        pattern: /^[A-Za-zА-Яа-яҐґЄєІіЇї'’\-\s]+$/,
        getPatternError: () => 'Поле може містити лише літери, пробіли, ’ -. Поле не може містити цифри',
        getRequiredError: () => "Ім'я та прізвище обов'язкові",
        getMinError: () => `Не менше ${TEAM_MEMBER_VALIDATION.fullName.min} символів`,
        getMaxError: () => `Не більше ${TEAM_MEMBER_VALIDATION.fullName.max} символів`,
    },
    description: {
        min: 10,
        max: 200,
        getRequiredWhenPublishingError: () => "Опис обов'язковий при публікації",
        getMinError: () => `Не менше ${TEAM_MEMBER_VALIDATION.description.min} символів`,
        getMaxError: () => `Не більше ${TEAM_MEMBER_VALIDATION.description.max} символів`,
        getMultipleSpacesError: () => `Не можна використовувати більше одного пробіла`,
    },
    category: {
        getRequiredError: () => "Категорія обов'язкова",
    },
    img: {
        getRequiredWhenPublishingError: () => "Фото обов'язкове при публікації",
        croppedWidth: 960,
        croppedHeight: 1200,
        minWidth: 960,
        minHeight: 1200,
    },
};

export const TEAM_CATEGORY_TEXT = {
    FORM: {
        LABEL: {
            NAME: 'Назва',
            DESCRIPTION: 'Опис',
            CATEGORY: 'Категорія',
        },
    },
};

export const TEAM_CATEGORY_VALIDATION = {
    name: {
        min: 5,
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
