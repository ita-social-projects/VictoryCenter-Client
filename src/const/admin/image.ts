export const COMMON_IMAGE_TEXT = {
    DELETE: {
        TITLE: 'Видалити фото?',
    },
};

export const IMAGE_VALIDATION = {
    maxSizeBytes: 5 * 1024 * 1024,
    allowedFormats: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    ImageDimensionsTooSmallError: 'Розмір зображення менший за рекомендований',
    ImageDimensionsTooLargeError: 'Зображення завелике. Це може вплинути на якість. Обріжте до рекомендованого.',
    UnexpectedError: () => 'Невідома помилка валідації фото',
    getFormatError: () => 'Невірний формат фото, дозволено jpeg, jpg, png, webp',
    getSizeError: (maxSizeMB: number) => `Фото не більше ${maxSizeMB} MB`,
};
