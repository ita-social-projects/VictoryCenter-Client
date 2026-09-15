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
        SUCCESS_ADD_HISTORY: 'Історію успішно додано',
        FAIL_TO_CREATE_HISTORY: 'Виникла помилка під час додавання історії',
    },
    DELETE_HISTORY_MODAL: {
        TITLE: 'Видалити історію?',
        FAIL_TO_DELETE: 'Виникла помилка під час видалення історії',
    },
    ADD_HISTORY_MODAL: {
        TITLE: 'Додати історію',
        LABEL: {
            TITLE: 'Заголовок',
            STORY: 'Історія',
            PHOTO: 'Фото',
        },
        PLACEHOLDER: {
            PHOTO_LABEL: 'Додайте файл сюди',
            PHOTO_SUBTEXT: 'Розмір: 650х360',
        },
    },
};

export const FEEDBACK_HISTORY_VALIDATION = {
    title: {
        max: 50,
        getRequiredError: () => "Поле обов'язкове",
        getMaxError: () => 'Не більше 50 символів',
    },
    story: {
        max: 1000,
        getRequiredError: () => "Поле обов'язкове",
        getMaxError: () => 'Не більше 1000 символів',
    },
    image: {
        cropWidth: 650,
        cropHeight: 360,
        minWidth: 650,
        minHeight: 360,
        getRequiredError: () => "Фото обов'язкове",
    },
};

export const FEEDBACK_CATEGORIES: FeedbackCategoryItem[] = [
    { id: FeedbackCategory.HISTORY, name: FEEDBACK_TEXT.TABS.HISTORY },
    { id: FeedbackCategory.REVIEWS, name: FEEDBACK_TEXT.TABS.REVIEWS },
    { id: FeedbackCategory.VIDEOS, name: FEEDBACK_TEXT.TABS.VIDEOS },
];

export const FEEDBACK_PAGINATION_LIMIT = 7;
