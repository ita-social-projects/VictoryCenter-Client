export const PARTNERS_TEXT = {
    BUTTON: {
        ADD_PARTNER_SECTION: 'Додати секцію партнерів',
        PUBLISH: 'Опублікувати',
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
