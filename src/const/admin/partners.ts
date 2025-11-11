export const PARTNERS_TEXT = {
    BUTTON: {
        ADD_PARTNER_SECTION: 'Додати секцію партнерів',
        ADD_PARTNER: 'Додати партнера',
        TRY_AGAIN: 'Спробувати ще',
    },
    FORM: {
        LABEL: {
            IMAGE: 'Фото',
            TITLE: 'Заголовок',
            DESCRIPTION: 'Опис',
        },
        TITLE: {
            DELETE_SECTION: 'Видалити секцію',
        },
        MESSAGE: {
            FAIL_TO_DELETE_PARTNER_SECTION: 'Виникла помилка під час видалення секції партнерів',
        },
        IMAGE: {
            SIZE_DESCRIPTION: 'Розмір: 208x208',
            ADD_FILE_DESCRIPTION: 'Додайте файл сюди',
        },
    },
    BANNER: {
        ADD_IMAGE_HERE: 'Додайте файл сюди',
    },
    SECTION: {
        TITLE_PLACEHOLDER: 'Введіть заголовок секції',
        DESCRIPTION_PLACEHOLDER: 'Введіть опис секції',
        EMPTY_MESSAGE: 'Додайте хоча б одного партнера до секції',
        MAX_PARTNERS: 'Максимальна кількість партнерів: 10',
        ADD_PARTNER: 'Додати партнера',
        DELETE_SECTION: 'Видалити секцію',
    },
    PARTNER: {
        IMAGE_LABEL: 'Фото',
        DESCRIPTION_LABEL: 'Опис',
        DESCRIPTION_PLACEHOLDER: 'Введіть опис партнера',
        DELETE: 'Видалити партнера',
        EDIT: 'Редагувати партнера',
    },
    MESSAGE: {
        SECTION_CREATED: 'Секція успішно створена',
        SECTION_UPDATED: 'Секція успішно оновлена',
        SECTION_DELETED: 'Секція успішно видалена',
        SECTION_PUBLISHED: 'Секція успішно опублікована',
        BANNER_SAVED: 'Банер успішно збережено',
        FAIL_TO_LOAD_PARTNERS: 'Виникла помилка, не вдалося завантажити партнерів',
        FAIL_TO_UPDATE_BANNER: 'Виникла помилка під час оновлення банера',
        FAIL_TO_CREATE_SECTION: 'Виникла помилка під час створення секції',
        FAIL_TO_PUBLISH_SECTION: 'Виникла помилка під час публікації секції',
        FAIL_TO_DELETE_SECTION: 'Виникла помилка під час видалення секції',
        FAIL_TO_LOAD_BANNER: 'Виникла проблема завантажити банер',
    },
};

export const PARTNER_BANNER_VALIDATION = {
    title: {
        min: 10,
        max: 30,
        getRequiredError: () => `Заголовок обов'язковий`,
    },
    description: {
        min: 10,
        max: 50,
        getRequiredError: () => `Опис обов'язковий`,
    },
    image: {
        width: 1440,
        height: 860,
    },
};

export const PARTNER_SECTION_VALIDATION = {
    title: {
        min: 10,
        max: 50,
        getRequiredError: () => `Заголовок обов'язковий`,
    },
    description: {
        min: 10,
        max: 70,
        getRequiredError: () => `Опис обов'язковий`,
    },
    partners: {
        max: 30,
        getAtLeastOnePartnerRequiredError: () => 'Потрібен хоча б один партнер',
        getMaxError: () => `Максимум ${PARTNER_SECTION_VALIDATION.partners.max} партнерів`,
    },
};

export const PARTNER_VALIDATION = {
    description: {
        min: 5,
        max: 50,
        getRequiredError: () => `Опис обов'язковий`,
    },
    image: {
        width: 208,
        height: 208,
    },
};
