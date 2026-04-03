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
        RECORD_UPDATED_SUCCESSFULLY: 'Зміни збережено успішно',
        RECORD_UPDATE_FAILED_RETRY: 'Виникла помилка, спробуйте ще раз',
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
        min: 2,
        max: 30,
    },
    description: {
        min: 2,
        max: 160,
    },
    page_size: 4,
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
        NO_FILES: 'PDF файли відсутні',
    },
    DROPZONE: {
        TITLE: 'Натисніть або перетягніть PDF файл сюди',
        UPLOADING: 'Завантаження...',
        SUBTITLE: 'Тільки формат pdf',
        ERROR_INVALID_FORMAT: 'Дозволено лише PDF формат',
        ERROR_UPLOAD_FAILED: 'Помилка при завантаженні файлу. Спробуйте ще раз.',
    },
    ACTIONS: {
        EDIT: 'Редагувати основну інформацію',
        FILE: {
            EDIT: 'Редагувати назву файлу',
            VIEW: 'Переглянути файл',
            DELETE: 'Видалити файл',
        },
    },
};

export const FUNDS_EXPENDITURES_VALIDATION = {
    disclaimer: { min: 2, max: 1000 },
    exchangeRate: {
        maxIntegerDigits: 9,
        maxDecimalDigits: 6,
    },
    maxCategoriesPerType: 4,
};

export const FUNDS_EXPENDITURES_TEXT = {
    DISCLAIMER_LABEL: 'Дісклеймер/ENG',
    EXCHANGE_RATE_LABEL: 'Курс USD/UAH',
    MESSAGE: {
        RECORD_CREATED_SUCCESSFULLY: 'Запис додано успішно',
        RECORD_CREATE_FAILED_RETRY: 'Не вдалося додати запис. Спробуйте ще раз',
        RECORD_UPDATED_SUCCESSFULLY: 'Зміни збережено успішно',
        RECORD_UPDATE_FAILED_RETRY: 'Виникла помилка, спробуйте ще раз',
    },
    MODAL: {
        SHARED: {
            REPORTING_YEAR_LABEL: 'Звітній рік',
            REPORTING_YEAR_PLACEHOLDER: 'Оберіть звітній рік',
            AMOUNT_UAH_LABEL: 'Сума (UAH)',
            AMOUNT_USD_LABEL: 'Сума (USD)',
            CONFIRM_CLOSE_TITLE: 'Зміни будуть втрачені. Бажаєте продовжити?',
        },
        INCOME: {
            TITLE: 'Додати надходження',
            SUBTITLE: 'Розподіл надходжень за категоріями',
            CATEGORY_LABEL: 'Категорія надходження',
            CATEGORY_PLACEHOLDER: 'Оберіть категорію надходження',
            SUBMIT_BUTTON: 'Додати надходження',
        },
        EXPENSE: {
            TITLE: 'Додати витрату',
            SUBTITLE: 'Розподіл витрат за статтями',
            CATEGORY_LABEL: 'Категорія витрат',
            CATEGORY_PLACEHOLDER: 'Оберіть категорію витрат',
            SUBMIT_BUTTON: 'Додати витрату',
        },
    },
    BUTTON: {
        EDIT: 'Редагувати Доходи та витрати',
        ADD_INCOME: 'Надходження',
        ADD_EXPENSE: 'Витрати',
    },
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
        AMOUNT_SUFFIX_UAH: 'UAH',
        AMOUNT_SUFFIX_USD: 'USD',
        CATEGORY_SUFFIX_FORMS: ['категорія', 'категорії', 'категорій'],
    },
    TABLE: {
        COLUMNS: {
            REPORTING_YEAR: 'Звітній рік',
            TYPE: 'Тип',
            CATEGORY: 'Категорія',
            AMOUNT_UAH: 'Сума UAH',
            AMOUNT_USD: 'Сума USD',
        },
        TYPE_LABELS: {
            INCOME: 'Надходження',
            EXPENSE: 'Витрата',
        },
        EMPTY_STATE: {
            MESSAGE: 'За вашим запитом нічого не знайдено',
            ALT_TEXT: 'Записів не знайдено',
        },
    },
    VALIDATION: {
        CATEGORY_UNIQUE: 'Категорія має бути унікальна',
        AMOUNT_ONLY_NUMBER_GT_ZERO: 'Лише число > 0',
        AMOUNT_MAX_DIGITS: "Не більше 11 цифр, 2 після ','",
        AMOUNT_NOT_NEGATIVE: "Сума не може бути від'ємною",
        EXCHANGE_RATE_ONLY_NUMERIC: 'Дозволено тільки числові значення десяткові та цілі',
        EXCHANGE_RATE_GT_ZERO: 'Значення має бути більше 0',
        EXCHANGE_RATE_MAX_DIGITS: "Не більше 9 цифр, 6 після ','",
    },
};
