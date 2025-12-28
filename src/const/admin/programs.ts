import { TEXT } from '../public/notfound-page';
import { COMMON_TEXT_ADMIN } from './common';

export const PROGRAMS_TEXT = {
    BUTTON: {
        ADD_PROGRAM: 'Додати програму',
        ADD_NEW_SECTION: 'Додати нову секцію',
        ADD_SECTION: 'Додати секцію',
        CHOOSE_SECTION: 'Обрати шаблон',
        CANCEL: 'Відмінити',
        SAVE: 'Зберегти',
    },
    PLACEHOLDER: {
        SEARCH_PROGRAMS: 'Шукати програми...',
        INSERT_PROGRAM_NAME: 'Введіть назву програми',
        INSERT_PROGRAM_LOCATION: 'Введіть місце проведення',
        INSERT_PROGRAM_PARTICIPANTS_COUNT: 'Введіть кількість учасників',
        INSERT_PROGRAM_MEETINGS_COUNT: 'Введіть кількість зустрічей',
    },

    MESSAGE: {
        FAIL_TO_FETCH_PROGRAMS: 'Виникла помилка, не вдалось завантажити програми',
        FAIL_TO_FETCH_PROGRAM: 'Не вдалося знайти вибрану програму',
        SELECTED_PROGRAM_HAS_NO_CATEGORIES: 'У вибраної програми відсутні категорії',
        NO_SECTIONS_YET: 'Ще немає секцій опису програми',
    },
    SECTION: {
        TITLE_SAMPLE_TEXT: 'ЗАГОЛОВОК',
        DESCRIPTION_SAMPLE_TEXT:
            'Ідея створення Victory Center виникла не як проєкт, а як відповідь на виклик часу - глибокий біль, виснаження, але водночас сильна віра в перемогу.\n\n Розмови з ветеранами/ками та волонтерами/ками, які до останньої краплі віддавали свої сили заради майбутнього країни, висвітлити потребу у просторі, в якому можна знову відчути момент “тут i зараз”.\n\n Так народився задум Victory Center — ініціативи, що допомагає людям, які пройшли крізь жахи війни, зупинитися, відновитися i найголовніше бути почутими. ',
        MODAL: {
            UNSAVED_CHANGES_TITLE: 'Відмінити додавання секції?',
        },
        FORM: {
            TITLE: {
                TEXT: 'Заголовок',
                PLACEHOLDER: 'ВВЕДІТЬ НАЗВУ',
            },
            DESCRIPTION: {
                TEXT: 'Опис',
            },
        },
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
        width: 440,
        height: 480,
        cropWidth: 440,
        cropHeight: 480,
        minWidth: 440,
        minHeight: 480,
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
};

export const PROGRAM_CATEGORY_VALIDATION = {
    name: {
        min: 5,
        max: 20,
        getRequiredError: () => 'Назва обов’язкова',
        getCategoryWithThisNameAlreadyExistsError: () =>
            COMMON_TEXT_ADMIN.CATEGORIES.FORM.MESSAGE.ALREADY_CONTAIN_CATEGORY_WITH_NAME,
    },
    programsCount: {
        getRelocationOrRemovalHint: () => 'Перенесіть їх в іншу категорію або видаліть, щоб продовжити',
        getHasProgramsCountError: (count: number) => `Категорія містить ${count} програм`,
    },
};
