export const FAQ_TEXT = {
    BUTTON: {
        ADD_FAQ: 'Додати питання',
    },

    MESSAGE: {
        FAIL_TO_FETCH_FAQ: 'Виникла помилка, не вдалось завантажити часті питання',
    },

    QUESTION: {
        PUBLISH_FAQ: 'Опублікувати нове питання?',
        DRAFT_FAQ: 'Зберегти нову програму?',
        DELETE_PUBLISHED_FAQ: 'Питання буде видалено з усіх сторінок сайту',
        DELETE_DRAFT_FAQ: 'Видалити питання?',
    },

    FORM: {
        TITLE: {
            ADD_FAQ: 'Додати питання',
            EDIT_FAQ: 'Редагування питання',
        },
        MESSAGE: {
            FAIL_TO_CREATE_FAQ: 'Виникла помилка під час додавання питання',
            FAIL_TO_UPDATE_FAQ: 'Виникла помилка під час оновлення питання',
            FAIL_TO_DELETE_FAQ: 'Виникла помилка під час видалення питання',
        },
        LABEL: {
            PAGE: 'Сторінка',
            SELECT_PAGE: 'Оберіть одну/декілька сторінок ',
            QUESTION: 'Питання',
            ANSWER: 'Відповідь',
        },
    },
};

export const FAQ_VALIDATION = {
    question: {
        min: 10,
        max: 150,
        getRequiredError: () => 'Питання обов’язкове',
        getMinError: () => `Не менше ${FAQ_VALIDATION.question.min} символів`,
        getMaxError: () => `Не більше ${FAQ_VALIDATION.question.max} символів`,
    },
    answer: {
        min: 50,
        max: 1000,
        getRequiredWhenPublishingError: () => 'Відповідь обов’язкова',
        getMinError: () => `Не менше ${FAQ_VALIDATION.answer.min} символів`,
        getMaxError: () => `Не більше ${FAQ_VALIDATION.answer.max} символів`,
    },
};
