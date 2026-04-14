import { COMMON_TEXT_ADMIN } from './common';
import { SECTIONS_TEXT } from './sections';

export const PROGRAMS_TEXT = {
    BUTTON: {
        ADD_PROGRAM: 'Додати програму',
        ADD_NEW_SECTION: SECTIONS_TEXT.BUTTON.ADD_NEW_SECTION,
        ADD_SECTION: SECTIONS_TEXT.BUTTON.ADD_SECTION,
        CHOOSE_SECTION: SECTIONS_TEXT.BUTTON.CHOOSE_SECTION,
        CANCEL: SECTIONS_TEXT.BUTTON.CANCEL,
        SAVE: SECTIONS_TEXT.BUTTON.SAVE,
        ADD: SECTIONS_TEXT.BUTTON.ADD,
    },
    PLACEHOLDER: {
        SEARCH_PROGRAMS: 'Шукати програми...',
        INSERT_PROGRAM_NAME: 'Введіть назву програми',
        INSERT_PROGRAM_LOCATION: 'Введіть місце проведення',
        INSERT_PROGRAM_PARTICIPANTS_COUNT: 'Введіть кількість учасників',
        INSERT_PROGRAM_MEETINGS_COUNT: 'Введіть кількість зустрічей',
        INSERT_PROGRAM_DESCRIPTION: 'Детальний опис програми',
    },

    MESSAGE: {
        FAIL_TO_FETCH_PROGRAMS: 'Виникла помилка, не вдалось завантажити програми',
        FAIL_TO_FETCH_PROGRAM: 'Не вдалося знайти вибрану програму',
        SELECTED_PROGRAM_HAS_NO_CATEGORIES: 'У вибраної програми відсутні категорії',
        NO_SECTIONS_YET: 'Ще немає секцій опису програми',
    },
    SECTION: {
        TITLE_SAMPLE_TEXT: SECTIONS_TEXT.SECTION.TITLE_SAMPLE_TEXT,
        DESCRIPTION_SAMPLE_TEXT: SECTIONS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT,
        DESCRIPTION_SAMPLE_TEXT_SHORT: SECTIONS_TEXT.SECTION.DESCRIPTION_SAMPLE_TEXT_SHORT,
        SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS: SECTIONS_TEXT.SECTION.SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS,
        SINGLE_TITLE_QUESTION_ANSWER_PAIRS: SECTIONS_TEXT.SECTION.SINGLE_TITLE_QUESTION_ANSWER_PAIRS,
        MODAL: SECTIONS_TEXT.SECTION.MODAL,
        FORM: SECTIONS_TEXT.SECTION.FORM,
        CARD: SECTIONS_TEXT.SECTION.CARD,
    },
    QUESTION: {
        PUBLISH_PROGRAM: 'Опублікувати нову програму?',
        DRAFT_PROGRAM: 'Зберегти нову програму?',
    },

    FORM: {
        TITLE: {
            ADD_PROGRAM: 'Додати програму',
            EDIT_PROGRAM: 'Редагування програми',
            DELETE_PROGRAM: 'Видалити програму?',
        },
        MESSAGE: {
            FAIL_TO_CREATE_PROGRAM: 'Виникла помилка під час додавання програми',
            FAIL_TO_UPDATE_PROGRAM: 'Виникла помилка під час оновлення програми',
            FAIL_TO_DELETE_PROGRAM: 'Виникла помилка під час видалення програми',
            PROGRAM_SAVED_SUCCESSFULLY: 'Програма успішно збережена',
            PROGRAM_PUBLISHED_SUCCESSFULLY: 'Програма успішно опублікована',
            PUBLISHED_PROGRAM_EDITED_SUCCESSFULLY: 'Зміни успішно опубліковано',
        },
        LABEL: {
            NAME: 'Назва',
            DESCRIPTION: 'Опис',
            CATEGORY: 'Категорія',
            SELECT_CATEGORY: 'Оберіть категорію',
            PREVIEW_IMAGE: 'Фото-прев’ю',
            LOCATION: 'Локація',
            PARTICIPANTS_COUNT: 'Кількість учасників',
            MEETING_COUNT: 'Кількість зустрічей',
        },
    },
};

export const PROGRAM_CATEGORY_TEXT = {
    FORM: {
        LABEL: {
            NAME: 'Назва',
            EDIT_NAME: 'Редагувати назву',
            CATEGORY: 'Категорія',
        },
    },
};

export const PROGRAM_VALIDATION = {
    name: {
        min: 5,
        max: 90,
        getRequiredError: () => 'Назва обов’язкова',
    },
    description: {
        min: 10,
        max: 400,
        getRequiredWhenPublishingError: () => 'Опис обов’язковий при публікації',
    },
    categories: {
        getAtLeastOneRequiredError: () => 'Потрібно обрати хоча б одну категорію',
    },
    previewImage: {
        width: 480,
        height: 440,
        cropWidth: 480,
        cropHeight: 440,
        minWidth: 480,
        minHeight: 440,
        getRequiredWhenPublishingError: () => 'Фото обов’язкове при публікації',
    },
    backgroundImage: {
        width: 1440,
        height: 860,
        cropWidth: 1440,
        cropHeight: 860,
        minWidth: 1440,
        minHeight: 860,
        getRequiredWhenPublishingError: () => 'Фото обов’язкове при публікації',
    },
    location: {
        max: 55,
        getRequiredWhenPublishingError: () => 'Локація обов’язкова при публікації',
    },
    participantsCount: {
        max: 55,
        getRequiredWhenPublishingError: () => 'Кількість учасників обов’язкова при публікації',
    },
    meetingCount: {
        max: 55,
        getRequiredWhenPublishingError: () => 'Кількість зустрічей обов’язкова при публікації',
    },
    images: {
        maxSizeMB: 5,
    },
};

export const PROGRAM_CATEGORY_VALIDATION = {
    name: {
        min: 5,
        max: 20,
        getRequiredError: () => "Назва обов'язкова",
        getCategoryWithThisNameAlreadyExistsError: () =>
            COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.ALREADY_CONTAIN_CATEGORY_WITH_NAME,
    },
    programsCount: {
        getRelocationOrRemovalHint: () => 'Перенесіть їх в іншу категорію або видаліть, щоб продовжити',
        getHasProgramsCountError: (count: number) => `Категорія містить ${count} програм`,
    },
};
