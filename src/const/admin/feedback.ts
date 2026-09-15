import { FeedbackCategory, FeedbackCategoryItem } from '@/types/admin/feedback';

export const FEEDBACK_TEXT = {
    BUTTON: {
        ADD_MATERIAL: 'Додати матеріал',
        ADD_FEEDBACK: 'Додати відгук',
    },
    PLACEHOLDER: {
        SEARCH_HISTORY: 'Введіть історію',
        SEARCH_REVIEWS: "Введіть відгук або ім'я",
        SEARCH_VIDEOS: "Введіть відгук або ім'я",
    },
    LIST: {
        NO_MATERIALS: 'Ще немає матеріалів',
    },
    TABS: {
        HISTORY: 'Історії',
        REVIEWS: 'Що кажуть учасники',
        VIDEOS: 'Відео відгуки',
    },
    ACTIONS: {
        REORDER: 'Змінити порядок елемента',
        EDIT: 'Редагувати',
        DELETE: 'Видалити',
    },
    MESSAGE: {
        FAIL_TO_FETCH_ITEMS: 'Не вдалося завантажити матеріали',
        FAIL_TO_REORDER: 'Виникла помилка, не вдалося змінити порядок елемента',
        SUCCESS_DELETE_HISTORY: 'Історію успішно видалено',
    },
    DELETE_HISTORY_MODAL: {
        TITLE: 'Видалити історію?',
        FAIL_TO_DELETE: 'Виникла помилка під час видалення історії',
    },
    ADD_REVIEW_MODAL: {
        TITLE: 'Додати відгук',
        PUBLISH: 'Опублікувати',
        LABEL: {
            AUTHOR_NAME: "Ім'я",
            TEXT: 'Відгук',
        },
    },
};

export const FEEDBACK_CATEGORIES: FeedbackCategoryItem[] = [
    { id: FeedbackCategory.HISTORY, name: FEEDBACK_TEXT.TABS.HISTORY },
    { id: FeedbackCategory.REVIEWS, name: FEEDBACK_TEXT.TABS.REVIEWS },
    { id: FeedbackCategory.VIDEOS, name: FEEDBACK_TEXT.TABS.VIDEOS },
];

export const FEEDBACK_REVIEW_VALIDATION = {
    authorName: {
        min: 2,
        max: 200,
        getRequiredError: () => "Поле обов'язкове",
        getMinError: () => `Не менше ${FEEDBACK_REVIEW_VALIDATION.authorName.min} символів`,
        getMaxError: () => `Не більше ${FEEDBACK_REVIEW_VALIDATION.authorName.max} символів`,
    },
    text: {
        min: 10,
        max: 500,
        getRequiredError: () => "Поле обов'язкове",
        getMinError: () => `Не менше ${FEEDBACK_REVIEW_VALIDATION.text.min} символів`,
        getMaxError: () => `Не більше ${FEEDBACK_REVIEW_VALIDATION.text.max} символів`,
    },
};

export const FEEDBACK_PAGINATION_LIMIT = 7;
