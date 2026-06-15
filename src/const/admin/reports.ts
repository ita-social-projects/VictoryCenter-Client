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
    fileName: {
        min: 2,
        max: 50,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(50),
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
        TRANSLATE: 'Перекласти',
        FILE: {
            EDIT: 'Редагувати назву файлу',
            VIEW: 'Переглянути файл',
            DELETE: 'Видалити файл',
            ACCEPT_RENAME: 'Прийняти',
            CANCEL_RENAME: 'Скасувати',
        },
    },
    MESSAGE: {
        RENAME_SUCCESS: 'Назву файлу успішно змінено',
        RENAME_ERROR: 'Не вдалося змінити назву файлу. Спробуйте ще раз.',
        DELETE_SUCCESS: 'Файл успішно видалено',
        DELETE_ERROR: 'Не вдалося видалити файл. Спробуйте ще раз.',
        VIEW_ERROR: 'Не вдалося завантажити файл для перегляду. Спробуйте ще раз.',
        FAIL_TO_CREATE_TRANSLATION: 'Виникла помилка під час додавання перекладу для PDF секції',
        FAIL_TO_UPDATE_TRANSLATION: 'Виникла помилка під час оновлення перекладу для PDF секції',
    },
    DELETE_CONFIRMATION: {
        TITLE: 'Файл буде видалено. Бажаєте продовжити?',
    },
};

export const FUNDS_EXPENDITURES_VALIDATION = {
    disclaimer: { min: 2, max: 1000 },
    exchangeRate: {
        maxIntegerDigits: 9,
        maxDecimalDigits: 6,
    },
    maxCategoriesPerType: 4,
    categoryNameMin: 5,
    categoryNameMax: 200,
};

export const PDF_SECTION_LOCALIZATION_VALIDATION = {
    title: {
        min: 2,
        max: 200,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(200),
    },
    description: {
        min: 2,
        max: 200,
        getRequiredError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.FIELD_REQUIRED,
        getMinError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMinError(2),
        getMaxError: () => COMMON_TEXT_ADMIN.VALIDATION_MESSAGE.getMaxError(200),
    },
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
        CATEGORY_CREATED_SUCCESSFULLY: 'Категорію додано успішно',
        CATEGORY_CREATE_FAILED_RETRY: 'Виникла помилка, спробуйте ще раз',
        CATEGORY_DELETED_SUCCESSFULLY: 'Категорію видалено успішно',
        CATEGORY_DELETE_FAILED_RETRY: 'Виникла помилка, спробуйте ще раз',
        CATEGORY_UPDATED_SUCCESSFULLY: 'Категорію оновлено успішно',
        CATEGORY_UPDATE_FAILED_RETRY: 'Виникла помилка, спробуйте ще раз',
        FAIL_TO_TRANSLATE_CATEGORY: 'Не вдалося зберегти переклад категорії. Спробуйте ще раз',
        FAIL_TO_UPDATE_CATEGORY_TRANSLATION: 'Не вдалося оновити переклад категорії. Спробуйте ще раз',
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
        EDIT_CATEGORY: {
            TITLE: 'Редагувати категорію',
            SUBTITLE: 'Редагування категорії витрат/надходжень для формування звітності',
            CATEGORY_LABEL: 'Категорія',
            CATEGORY_PLACEHOLDER: 'Оберіть категорію',
            NAME_LABEL: 'Редагувати назву',
            NAME_PLACEHOLDER: 'Введіть назву категорії',
            SUBMIT_BUTTON: 'Зберегти',
            CONFIRM_SAVE_TITLE: 'Зберегти зміни?',
        },
        DELETE_CATEGORY: {
            TITLE: 'Видалити категорію',
            CATEGORY_LABEL: 'Категорія',
            CATEGORY_PLACEHOLDER: 'Оберіть категорію',
            CONFIRM_TITLE: 'Видалити категорію?',
            ERROR: {
                getHasIncomeRecordTitle: (count: number) =>
                    `Категорія використовується в надходженнях, ${count} ${count === 1 ? 'запис' : count < 5 ? 'записи' : 'записів'}`,
                getHasExpenseRecordTitle: (count: number) =>
                    `Категорія використовується у витратах, ${count} ${count === 1 ? 'запис' : count < 5 ? 'записи' : 'записів'}`,
                HAS_RECORD_TEXT: 'Видаліть або змініть їх',
            },
        },
        CATEGORY: {
            TITLE: 'Додати категорію',
            SUBTITLE: 'Додавання категорії витрат/надходжень для формування звітності',
            TYPE_LABEL: 'Витрата/Надходження',
            TYPE_PLACEHOLDER: 'Витрата/Надходження',
            NAME_LABEL: 'Назва',
            NAME_PLACEHOLDER: 'Введіть назву категорії',
            SUBMIT_BUTTON: 'Зберегти',
            ERROR: {
                NAME_DUPLICATE: 'Категорія з такою назвою вже існує',
            },
        },
        TRANSLATE_CATEGORY: {
            TITLE: 'Переклад категорії',
            CATEGORY_LABEL: 'Категорія',
            CATEGORY_PLACEHOLDER: 'Оберіть категорію',
            NAME_LABEL: 'Назва',
            NAME_PLACEHOLDER: 'Введіть назву категорії',
        },
        TRANSLATE_DISCLAIMER: {
            TITLE: 'Додати переклад',
            DESCRIPTION_LABEL: 'Опис',
            FAIL_TO_TRANSLATE: 'Не вдалося зберегти переклад дісклеймера. Спробуйте ще раз',
            FAIL_TO_UPDATE_TRANSLATION: 'Не вдалося оновити переклад дісклеймера. Спробуйте ще раз',
        },
    },
    BUTTON: {
        EDIT: 'Редагувати Доходи та витрати',
        ADD_INCOME: 'Надходження',
        ADD_EXPENSE: 'Витрати',
        ADD_CATEGORY: 'Додати категорію',
        DELETE_CATEGORY: 'Видалити',
        EDIT_CATEGORY: 'Редагувати',
        TRANSLATE_CATEGORY: 'Перекласти',
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
    BULK: {
        getSelectedLabel: (selected: number, total: number) => `Вибрано ${selected} з ${total}`,
        DELETE_BUTTON: 'Видалити вибрані',
        DELETE_CONFIRM_TITLE: 'Видалити обрані записи?',
        DELETE_SUCCESS: 'Записи видалені успішно',
        DELETE_FAILED: 'Помилка при видаленні записів. Спробуйте ще раз.',
    },
};

export const PROGRAM_EXPENSES_TEXT = {
    BUTTON: {
        ADD_PROGRAM_EXPENSE: 'Витрата по програмі',
    },
    MODAL: {
        ADD: {
            TITLE: 'Додати витрату по програмі',
            SUBTITLE: 'Розподіл програмних витрат по програмах',
            PROGRAM_LABEL: 'Категорія програми',
            PROGRAM_PLACEHOLDER: 'Оберіть програму',
            SUBMIT_BUTTON: 'Додати витрату',
            CONFIRM_ADD_TITLE: 'Додати нову витрату?',
            CONFIRM_CLOSE_TITLE: 'Зміни будуть втрачені. Бажаєте продовжити?',
            PROGRAM_NO_AVAILABLE: 'Немає доступних програм',
        },
        DELETE: {
            TITLE: 'Видалити запис?',
        },
    },
    VALIDATION: {
        PROGRAM_UNIQUE: 'Така категорія вже додана, Оберіть іншу категорію',
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
        TYPE_LABEL: 'Програмні',
        COLUMNS: {
            PROGRAM: 'Програма',
            ACTIONS: 'Дії',
        },
    },
    MESSAGE: {
        RECORD_CREATED_SUCCESSFULLY: 'Новий запис успішно додано',
        RECORD_CREATE_FAILED_RETRY: 'Виникла помилка, спробуйте ще раз',
        RECORD_DELETED_SUCCESSFULLY: 'Запис успішно видалено',
        RECORD_DELETE_FAILED_RETRY: 'Не вдалося видалити запис. Спробуйте ще раз',
    BULK: {
        getSelectedLabel: (selected: number, total: number) => `Вибрано ${selected} з ${total}`,
        DELETE_BUTTON: 'Видалити вибрані',
        DELETE_CONFIRM_TITLE: 'Видалити обрані записи?',
        DELETE_SUCCESS: 'Записи видалені успішно',
        DELETE_FAILED: 'Помилка при видаленні записів. Спробуйте ще раз.',
    },
};
