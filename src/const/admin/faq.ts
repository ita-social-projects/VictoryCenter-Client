export const FAQ_TEXT = {
    BUTTON: {
        ADD_FAQ: 'Додати питання',
    },

    PLACEHOLDER: {
        SEARCH_FAQ: 'Введіть назву',
    },

    TOOLTIP: {
        PUBLISHED_IN: 'Опубліковано на:',
        DRAFTED_IN: 'Збережено на:',
    },

    MESSAGE: {
        FAIL_TO_FETCH_FAQ: 'Виникла помилка, не вдалось завантажити часті питання',
        FAIL_TO_FETCH_PAGES: 'Виникла помилка, не вдалось завантажити сторінки',
        FAIL_TO_FETCH_SEARCHED_PAGE: 'Не вдалося знайти вибране часте питання',
        FAIL_TO_REORDER_FAQ: 'Виникла помилка, не вдалось змінити порядок питань',
        DONT_FORGET_TO_ORDER: 'Hе забудьте налаштувати порядок відображення питань на сайті',
    },

    QUESTION: {
        PUBLISH_FAQ: 'Опублікувати нове питання?',
        DRAFT_FAQ: 'Зберегти нове питання?',
        DELETE_PUBLISHED_FAQ: 'Питання буде видалено з усіх сторінок сайту, бажаєте продовжити?',
        DELETE_DRAFT_FAQ: 'Питання буде видалено з усіх сторінок сайту, бажаєте продовжити?',
    },

    FORM: {
        TITLE: {
            ADD_FAQ: 'Додати питання',
            EDIT_FAQ: 'Редагування питання',
            DELETE_FAQ: 'Видалити питання?',
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

    ACTIONS: {
        REORDER: 'Змінити порядок елемента',
        EDIT: 'Редагувати питання',
        DELETE: 'Видалити питання',
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
    pages: {
        getAtLeastOneRequiredError: () => 'Потрібно обрати хоча б одну сторінку',
    },
};
