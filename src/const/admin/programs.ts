import { COMMON_TEXT_ADMIN } from './common';
import { ProgramSectionTemplate } from '@/types/common/program-sections';
import { ContentType } from '@/types/common/programs';

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
        DESCRIPTION_SAMPLE_TEXT_SHORT:
            'Ідея створення Victory Center виникла не як проєкт, а як відповідь на виклик часу - глибокий біль, виснаження, але водночас сильна віра в перемогу. ',
        SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS: {
            DEFAULT_TITLE: 'Що кажуть учасники',
        },
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
        CARD: {
            BUTTON: {
                ADD_CARD: 'Додати карточку',
            },
            FORM: {
                TITLE: {
                    TEXT: 'Заголовок',
                    PLACEHOLDER: 'Введіть назву',
                },
                DESCRIPTION: {
                    TEXT: 'Опис',
                    PLACEHOLDER: 'Введіть текст',
                },
                AUTHOR: {
                    TEXT: "Ім'я",
                    PLACEHOLDER: "Введіть ім'я",
                },
                SAMPLE: {
                    AUTHOR: 'Вікторія Яковенко',
                },
            },
            TITLE_SAMPLE_TEXT: {
                PROGRAM_GOALS: 'Мета програми',
                MAIN_METHODS: 'Основні методи',
                PROGRAM_FORMAT: 'Формат програми',
            },
            DESCRIPTION_SAMPLE_TEXT: {
                PROGRAM_GOALS:
                    'Допомогти військовим:\n' +
                    'зменшити прояви ПТСР, тривожності та емоційного виснаження;\n' +
                    'відновити відчуття безпеки та самоцінності;\n' +
                    'повернутися до мирного життя з підтримкою, спільнотою та внутрішнім ресурсом.',

                MAIN_METHODS:
                    'Іпотерапія (взаємодія з кіньми в терапевтичному контексті)\n' +
                    'Майндфулнес-практики та тілесна терапія\n' +
                    'Групова робота, фасилітовані бесіди\n' +
                    'Музична та арт-терапія\n' +
                    'Індивідуальна підтримка від психолога',

                PROGRAM_FORMAT:
                    'Тривалість: 3–5 днів поспіль\n' +
                    'Локація: партнерські ранчо Victory Center у природному середовищі\n' +
                    'Група: до 12 учасників\n' +
                    'Проживання та харчування: забезпечуються організаторами\n' +
                    'Підготовка: телефонне інтерв’ю та базовий психоемоційний скринінг',
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
            PROGRAM_SAVED_SUCCESSFULLY: 'Програма успішно збережена',
            PROGRAM_PUBLISHED_SUCCESSFULLY: 'Програма успішно опублікована',
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

export const PROGRAM_SECTION_IMAGE_CONFIGS = {
    QUAD_IMAGES: {
        cropWidth: 360,
        cropHeight: 390,
        minWidth: 360,
        minHeight: 390,
    },
    DUAL_IMAGES: {
        cropWidth: 730,
        cropHeight: 430,
        minWidth: 730,
        minHeight: 430,
    },
    TRIPLE_IMAGES: {
        cropWidth: 480,
        cropHeight: 480,
        minWidth: 480,
        minHeight: 480,
    },
    SINGLE_IMAGE_TOP: {
        cropWidth: 1440,
        cropHeight: 680,
        minWidth: 1440,
        minHeight: 680,
    },
    SINGLE_IMAGE_BOTTOM: {
        cropWidth: 1440,
        cropHeight: 680,
        minWidth: 1440,
        minHeight: 680,
    },
    SINGLE_IMAGE_RIGHT: {
        cropWidth: 700,
        cropHeight: 600,
        minWidth: 700,
        minHeight: 600,
    },
};

export const QUAD_IMAGES_CONFIG = {
    imageCount: 4,
    gridColumns: 4,
    imageConfig: PROGRAM_SECTION_IMAGE_CONFIGS.QUAD_IMAGES,
    elevatedIndices: [0, 2],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableGridColumns: 4,
    editableImageMaxHeight: 390,
    editableImageMaxWidth: 360,
    swiperBreakpoints: {
        320: { slidesPerView: 1 },
        720: { slidesPerView: 2 },
        1080: { slidesPerView: 3 },
        1440: { slidesPerView: 4 },
    },
};

export const DUAL_IMAGES_CONFIG = {
    imageCount: 2,
    gridColumns: 2,
    imageConfig: PROGRAM_SECTION_IMAGE_CONFIGS.DUAL_IMAGES,
    elevatedIndices: [0],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableImageMaxHeight: 430,
    editableImageMaxWidth: 730,
    swiperBreakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1440: { slidesPerView: 2 },
    },
};

export const TRIPLE_IMAGES_CONFIG = {
    imageCount: 3,
    gridColumns: 3,
    imageConfig: PROGRAM_SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES,
    elevatedIndices: [0, 2],
    //elevatedIndices: [0, 1],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableGridColumns: 4,
    editableImageMaxHeight: 480,
    editableImageMaxWidth: 480,
    swiperBreakpoints: {
        320: { slidesPerView: 1 },
        560: { slidesPerView: 2 },
        768: { slidesPerView: 3 },
        1440: { slidesPerView: 3 },
    },
};

export const SINGLE_TITLE_QUINTUPLE_DESCRIPTION_CONFIG = {
    descriptionsCount: 5,
};

export const SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS_CONFIG = {
    blocks: {
        defaultCount: 1,
    },
} as const;

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

export const PROGRAM_SECTION_VALIDATION = {
    title: {
        getRequiredError: () => "Заголовок обов'язковий",
    },
    description: {
        getRequiredError: () => "Опис обов'язковий",
    },
    author: {
        getRequiredError: () => "Ім'я обов'язкове",
    },
} as const;

export const PROGRAM_SECTION_TEMPLATE_VALIDATION = {
    [ProgramSectionTemplate.QuadImagesBottom]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 1 },
            [ContentType.Image]: { min: 4, max: 4 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 600 },
        },
    },

    [ProgramSectionTemplate.DualImagesBottom]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 1 },
            [ContentType.Image]: { min: 2, max: 2 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 600 },
        },
    },

    [ProgramSectionTemplate.TextOnly]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 1 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 600 },
        },
    },

    [ProgramSectionTemplate.TripleImagesBottom]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 1 },
            [ContentType.Image]: { min: 3, max: 3 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 600 },
        },
    },

    [ProgramSectionTemplate.SingleImageBottom]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 1 },
            [ContentType.Image]: { min: 1, max: 1 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 600 },
        },
    },

    [ProgramSectionTemplate.SingleImageTop]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 1 },
            [ContentType.Image]: { min: 1, max: 1 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 600 },
        },
    },

    [ProgramSectionTemplate.SingleImageRight]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 1 },
            [ContentType.Image]: { min: 1, max: 1 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 600 },
        },
    },

    [ProgramSectionTemplate.DualTitleDescriptionPairs]: {
        counts: {
            [ContentType.Title]: { min: 2, max: 2 },
            [ContentType.Description]: { min: 2, max: 2 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 300 },
        },
        grouping: {
            groupCount: { min: 2, max: 2 },
            perGroupCounts: {
                [ContentType.Title]: { min: 1, max: 1 },
                [ContentType.Description]: { min: 1, max: 1 },
            },
        },
    },

    [ProgramSectionTemplate.TripleTitleDescriptionPairs]: {
        counts: {
            [ContentType.Title]: { min: 3, max: 3 },
            [ContentType.Description]: { min: 3, max: 3 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 300 },
        },
        grouping: {
            groupCount: { min: 3, max: 3 },
            perGroupCounts: {
                [ContentType.Title]: { min: 1, max: 1 },
                [ContentType.Description]: { min: 1, max: 1 },
            },
        },
    },

    [ProgramSectionTemplate.QuadTitleDescriptionPairs]: {
        counts: {
            [ContentType.Title]: { min: 4, max: 4 },
            [ContentType.Description]: { min: 4, max: 4 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 300 },
        },
        grouping: {
            groupCount: { min: 4, max: 4 },
            perGroupCounts: {
                [ContentType.Title]: { min: 1, max: 1 },
                [ContentType.Description]: { min: 1, max: 1 },
            },
        },
    },

    [ProgramSectionTemplate.SingleTitleQuintupleDescription]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 5, max: 5 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
            [ContentType.Description]: { min: 10, max: 300 },
        },
    },

    [ProgramSectionTemplate.SingleTitleDescriptionAuthorPairs]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 1, max: 5 },
            [ContentType.Author]: { min: 1, max: 5 },
            [ContentType.Image]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 50 },
            [ContentType.Description]: { min: 10, max: 100 },
            [ContentType.Author]: { min: 2, max: 50 },
        },
        grouping: {
            groupCount: { min: 1, max: 5 },
            perGroupCounts: {
                [ContentType.Description]: { min: 1, max: 1 },
                [ContentType.Author]: { min: 1, max: 1 },
            },
        },
    },
} as const;
