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
    },
};

export const FEEDBACK_CATEGORIES: FeedbackCategoryItem[] = [
    { id: FeedbackCategory.HISTORY, name: FEEDBACK_TEXT.TABS.HISTORY },
    { id: FeedbackCategory.REVIEWS, name: FEEDBACK_TEXT.TABS.REVIEWS },
    { id: FeedbackCategory.VIDEOS, name: FEEDBACK_TEXT.TABS.VIDEOS },
];
