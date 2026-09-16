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
    ADD_VIDEO_REVIEW_MODAL: {
        TITLE: 'Додати відео відгук',
        LABEL: {
            TITLE: 'Заголовок',
            LINK: 'Посилання на відео відгук',
        },
    },
};

export const VIDEO_REVIEW_VALIDATION = {
    title: {
        min: 5,
        max: 200,
    },
    link: {
        min: 10,
        max: 10000,
        getFormatError: () => 'Посилання має бути дійсною URL-адресою (http/https)',
    },
};

export const FEEDBACK_CATEGORIES: FeedbackCategoryItem[] = [
    { id: FeedbackCategory.HISTORY, name: FEEDBACK_TEXT.TABS.HISTORY },
    { id: FeedbackCategory.REVIEWS, name: FEEDBACK_TEXT.TABS.REVIEWS },
    { id: FeedbackCategory.VIDEOS, name: FEEDBACK_TEXT.TABS.VIDEOS },
];

export const FEEDBACK_PAGINATION_LIMIT = 7;
