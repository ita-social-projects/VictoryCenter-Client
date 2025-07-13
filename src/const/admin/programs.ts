export const PROGRAMS_TEXT = {
    LIST: {
        NOT_FOUND: 'Нічого не знайдено',
    },

    BUTTONS: {
        ADD_PROGRAM: 'Додати програму',
    },

    FILTER: {
        SEARCH_BY_NAME: 'Пошук за назвою',
        STATUS: {
            ALL: 'Усі',
            PUBLISHED: 'Опубліковано',
            DRAFT: 'Чернетка',
        },
    },

    QUESTION: {
        PUBLISH_PROGRAM: 'Опублікувати нову програму?',
        SAVE_AS_DRAFT: 'Зберегти як чернетку?',
        CHANGES_LOST: 'Зміни буде втрачено. Бажаєте продовжити?',
        CONFIRM: 'Так',
        CANCEL: 'Ні',
    },

    FORM: {
        TITLE: {
            ADD_PROGRAM: 'Додати програму',
            EDIT_PROGRAM: 'Редагування програми',
            DELETE_PROGRAM: 'Видалити програму?',
        },
        BUTTON: {
            SAVE_AS_DRAFT: 'Зберегти як чернетку',
            PUBLISH: 'Опублікувати',
        },
        LABEL: {
            CATEGORY: 'Категорія',
            SELECT_CATEGORY: 'Виберіть категорію',
            NAME: 'Назва',
            DESCRIPTION: 'Опис',
            PHOTO: 'Фото',
            PHOTO_DRAG_DROP: 'Перетягніть файл сюди або натисніть для завантаження',
        },
    },
};

export const PROGRAM_VALIDATION = {
    name: {
        min: 2,
        max: 100,
        allowed_chars: /^[A-Za-zА-Яа-яҐґЄєІіЇї'’\-\s]+$/,
        getAllowedCharsError: () => 'Недопустимі символи в назві програми',
        getMinError: () => `Назва повинна містити щонайменше ${PROGRAM_VALIDATION.name.min} символи`,
        getMaxError: () => `Назва не повинна перевищувати ${PROGRAM_VALIDATION.name.max} символів`,
        getRequiredError: () => 'Назва обов’язкова',
    },
    description: {
        max: 400,
        getMaxError: () => `Опис не повинен перевищувати ${PROGRAM_VALIDATION.description.max} символів`,
        getRequiredError: () => 'Опис обов’язковий при публікації',
    },
    categories: {
        getMinError: () => 'Потрібно обрати хоча б одну категорію',
    },
    img: {
        maxSizeBytes: 3 * 1024 * 1024,
        allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        getFormatError: () => 'Невірний формат зображення, дозволено jpeg, jpg, png, webp',
        getSizeError: () => `Зображення має бути не більше ${PROGRAM_VALIDATION.img.maxSizeBytes / (1024 * 1024)} МБ`,
    },
};
