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
    REPORT_AND_ANALYTICS: {
        TITLE: 'Управління фінансами',
        TAB: {
            INCOME_EXPENSES: 'Доходи та витрати',
            PROGRAM_EXPENSES: 'Програмні витрати',
            PDF_FILES: 'PDF Файли',
        },
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

export const PDF_FILES_SECTION_VALIDATION = {
    title: {
        max: 100,
    },
    description: {
        max: 500,
    },
};

export const PDF_FILES_SECTION_TEXT = {
    VIEW: {
        TITLE: 'Заголовок розділу PDF',
        DESCRIPTION: 'Короткий опис для користувачів',
    },
    FORM: {
        LABEL: {
            TITLE: 'Заголовок',
            DESCRIPTION: 'Опис',
        },
    },
    TABLE: {
        HEADER: {
            NAME: 'Назва',
            DATE_TIME: 'Дата/Час',
            SIZE: 'Розмір',
            ACTIONS: 'Дії',
        },
        ACTION: {
            VIEW: 'Переглянути',
            DELETE: 'Видалити',
            DOWNLOAD: 'Завантажити',
        },
    },
};

export const FUNDS_EXPENDITURES_TEXT = {
    DISCLAIMER_LABEL: 'Дісклеймер/ENG',
    EXCHANGE_RATE_LABEL: 'Курс USD/UAH',
    FILTER: {
        TYPE_PLACEHOLDER: 'Тип',
        CATEGORY_PLACEHOLDER: 'Категорія',
        ALL_OPTION: 'Всі',
    },
    SUMMARY_CARDS: {
        COLLECTED: 'Зібрано коштів',
        SPENT: 'Витрачено коштів',
        INCOME_CATEGORIES: 'Категорії надходжень',
        EXPENSE_CATEGORIES: 'Категорії витрат',
        AMOUNT_SUFFIX_UAH: 'UA',
        AMOUNT_SUFFIX_USD: 'USD',
        CATEGORY_SUFFIX: 'категорії',
    },
    TABLE: {
        COLUMNS: {
            REPORTING_YEAR: 'Звітній рік',
            TYPE: 'Тип',
            CATEGORY: 'Категорія',
            AMOUNT_UAH: 'Сума UA',
            AMOUNT_USD: 'Сума USD',
        },
        TYPE_LABELS: {
            INCOME: 'Надходження',
            EXPENSE: 'Витрати',
        },
    },
};
