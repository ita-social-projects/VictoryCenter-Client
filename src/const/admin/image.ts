export const COMMON_IMAGE_TEXT = {
    DELETE: {
        TITLE: 'Видалити фото?',
    },
};

export const IMAGE_VALIDATION = {
    maxSizeBytes: 3 * 1024 * 1024,
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    UnexpectedError: () => 'Невідома помилка валідації файлу',
    getFormatError: () => 'Невірний формат фото, дозволено jpeg, jpg, png, webp',
    getSizeError: () => `Фото не більше ${IMAGE_VALIDATION.maxSizeBytes / (1024 * 1024)} MB`,
};
