// const/admin/partners.ts
export const PARTNERS_TEXT = {
    BUTTON: {
        ADD_PARTNER_SECTION: 'Додати секцію партнерів',
        PUBLISH: 'Опублікувати',
        YES: 'Так',
        NO: 'Ні',
        ADD_PARTNER: 'Додати партнера',
    },
    FORM: {
        LABEL: {
            TITLE: 'Заголовок',
            DESCRIPTION: 'Опис',
        },
        TITLE: {
            DELETE_SECTION: 'Видалити секцію',
        },
        MESSAGE: {
            FAIL_TO_DELETE_PARTNER_SECTION: 'Виникла помилка під час видалення секції партнерів',
        },
    },
    IMAGE: {
        INPUT: 'Додайте файл сюди',
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
        DESCRIPTION_LABEL: 'Опис партнера',
        DESCRIPTION_PLACEHOLDER: 'Введіть опис партнера',
        DELETE: 'Видалити партнера',
    },
    MESSAGE: {
        SECTION_CREATED: 'Секція успішно створена',
        SECTION_UPDATED: 'Секція успішно оновлена',
        SECTION_DELETED: 'Секція успішно видалена',
        SECTION_PUBLISHED: 'Секція успішно опублікована',
        BANNER_SAVED: 'Банер успішно збережено',
    },
};

export const PARTNER_VALIDATION = {
    title: {
        min: 10,
        max: 30,
        getMinError: () => `Не менше ${PARTNER_VALIDATION.title.min} символів`,
        getMaxError: () => `Не більше ${PARTNER_VALIDATION.title.max} символів`,
        getRequiredError: () => `Заголовок обов'язковий`,
    },
    description: {
        min: 10,
        max: 30,
        getMinError: () => `Не менше ${PARTNER_VALIDATION.description.min} символів`,
        getMaxError: () => `Не більше ${PARTNER_VALIDATION.description.max} символів`,
        getRequiredError: () => `Опис обов'язковий`,
    },
    image: {
        maxSizeBytes: 3 * 1024 * 1024,
        maxSizeMB: 3,
        allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        allowedExtensions: ['jpg', 'jpeg', 'png', 'webp'],
        getRequiredError: () => `Зображення обов'язкове`,
        getRequiredWhenPublishingError: () => `Зображення обов'язкове при публікації`,
        getSizeError: () => `Розмір файлу не повинен перевищувати ${PARTNER_VALIDATION.image.maxSizeMB}MB`,
        getFormatError: () => `Дозволені формати: ${PARTNER_VALIDATION.image.allowedExtensions.join(', ')}`,
    },
};
