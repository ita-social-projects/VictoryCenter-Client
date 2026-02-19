export const REPORTS_TEXT = {
    FORM: {
        LABEL: {
            TITLE: 'Заголовок',
            COLLECTED_FUNDS_WINDOW: 'Вікно 1: Зібрано коштів',
            CHANGED_LIVES_WINDOW: 'Вікно 2: Змінено життів',
            COLLECTED_FUNDS: 'Зібрані кошти',
            CHANGED_LIVES: 'Кількість змінених життів',
            WINDOW_DESCRIPTION: 'Фото «Репрезентативне фото»',
        },
        MAX_LENGTH: {
            TITLE: 50,
        },
    },
    BUTTON: {
        PUBLISH: 'Опублікувати',
        CANCEL: 'Відмінити',
        EDIT_PAGE: 'Редагувати сторінку',
        TRY_AGAIN: 'Спробувати ще',
    },
    MESSAGE: {
        FAIL_TO_FETCH_REPORTS: 'Виникла помилка, не вдалось завантажити звітність',
        FAIL_TO_UPDATE_REPORT: 'Виникла помилка під час оновлення звітності',
        SUCCESSFULLY_PUBLISHED: 'Успішно опубліковано',
        INVALID_VALUE: 'Значення повинно бути числом',
    },
};

export const REPORTS_MEDIA_SETTINGS_COLLECTED_FUNDS_VALIDATION = {
    title: {
        min: 10,
        max: 50,
        getRequiredError: () => `Заголовок обов'язковий`,
    },
    collectedAmount: {
        max: 15,
    },
    image: {
        width: 600,
        height: 500,
    },
};

export const REPORTS_MEDIA_SETTINGS_CHANGED_LIVES_VALIDATION = {
    title: {
        min: 10,
        max: 50,
        getRequiredError: () => `Заголовок обов'язковий`,
    },
    changedLives: {
        max: 10,
    },
    image: {
        width: 280,
        height: 890,
    },
};
