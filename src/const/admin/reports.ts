import { COMMON_TEXT_ADMIN } from './common';

export const REPORTS_TEXT = {
    FORM: {
        LABEL: {
            TITLE: 'Заголовок/EN',
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
        min: 2,
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
        min: 2,
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
    max_file_size_bytes: 10 * 1024 * 1024,
    title: {
        min: 2,
        max: 30,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(30),
    },
    description: {
        min: 2,
        max: 160,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(160),
    },
    page_size: 4,
};

export const PDF_FILES_SECTION_TEXT = {
    TITLE: 'Заголовок розділу PDF',
    DESCRIPTION: 'Короткий опис для користувачів',
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
        ERROR_FILE_TOO_LARGE: 'Розмір файлу не повинен перевищувати 10 МБ',
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
    DELETE_CONFIRMATION: {
        TITLE: 'Файл буде видалено. Бажаєте продовжити?',
    },
    DELETE_SUCCESS: 'Файл успішно видалено',
    DELETE_ERROR: 'Не вдалося видалити файл. Спробуйте ще раз.',
    VIEW_ERROR: 'Не вдалося завантажити файл для перегляду. Спробуйте ще раз.',
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
        RECORD_DELETED_SUCCESSFULLY: 'Запис успішно видалено',
        RECORD_DELETE_FAILED_RETRY: 'Не вдалося видалити запис. Спробуйте ще раз',
        AMOUNT_USD_NOT_MATCH: 'Сума в USD не відповідає сумі в UAH',
    },
    MODAL: {
        SHARED: {
            REPORTING_YEAR_LABEL: 'Звітній рік',
            REPORTING_YEAR_PLACEHOLDER: 'Оберіть звітній рік',
            AMOUNT_UAH_LABEL: 'Сума (UAH)',
            AMOUNT_USD_LABEL: 'Сума (USD)',
            CONFIRM_CLOSE_TITLE: 'Зміни будуть втрачені. Бажаєте продовжити?',
            CATEGORY_NO_AVAILABLE: 'Немає доступних категорій. Спочатку створіть категорію',
        },
        DELETE: {
            TITLE: 'Видалити запис?',
        },
        INCOME: {
            TITLE: 'Додати надходження',
            SUBTITLE: 'Розподіл надходжень за категоріями',
            CATEGORY_LABEL: 'Категорія надходження',
            CATEGORY_PLACEHOLDER: 'Оберіть категорію надходження',
            SUBMIT_BUTTON: 'Додати надходження',
            CONFIRM_ADD_TITLE: 'Додати нове надходження?',
        },
        EXPENSE: {
            TITLE: 'Додати витрату',
            SUBTITLE: 'Розподіл витрат за статтями',
            CATEGORY_LABEL: 'Категорія витрат',
            CATEGORY_PLACEHOLDER: 'Оберіть категорію витрат',
            SUBMIT_BUTTON: 'Додати витрату',
            CONFIRM_ADD_TITLE: 'Додати нову витрату?',
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
            TITLE: 'Немає записів',
            ADD_RECORD: 'додайте перший запис надходження або витрати',
        },
    },
    VALIDATION: {
        CATEGORY_UNIQUE_INCOME: 'Категорія вже додана до надходжень',
        CATEGORY_UNIQUE_EXPENSE: 'Категорія вже додана до витрат',
        AMOUNT_ONLY_NUMBER: 'Дозволено лише цифри',
        AMOUNT_MAX_DIGITS: 'Не більше 9 цифр до коми',
        AMOUNT_NOT_NEGATIVE: "Сума не може бути від'ємною",
        AMOUNT_NOT_ZERO: 'Сума не може дорівнювати 0',
        EXCHANGE_RATE_ONLY_NUMERIC: 'Дозволено тільки числові значення десяткові та цілі',
        EXCHANGE_RATE_GT_ZERO: 'Значення має бути більше 0',
        EXCHANGE_RATE_MAX_DIGITS: "Не більше 9 цифр, 6 після ','",
    },
};

export const PROGRAM_EXPENSES_TEXT = {
    BUTTON: {
        ADD_PROGRAM_EXPENSE: 'Витрата по програмі',
    },
    FILTER: {
        PROGRAMS_PLACEHOLDER: 'Програми',
        ALL_OPTION: 'Всі',
        getProgramsCounterLabel: (count: number) => `Програми (${count})`,
    },
    EMPTY_STATE: {
        ADD_RECORD: 'додайте перший запис Програмної витрати',
    },
    SUMMARY_CARD: {
        TITLE: 'Всього програмні витрати',
    },
    TABLE: {
        COLUMNS: {
            PROGRAM: 'Програма',
        },
    },
};
