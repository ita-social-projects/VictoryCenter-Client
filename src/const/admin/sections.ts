import { COMMON_TEXT_ADMIN } from './common';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';

export const SECTIONS_TEXT = {
    BUTTON: {
        ADD_NEW_SECTION: 'Додати нову секцію',
        ADD_SECTION: 'Додати секцію',
        CHOOSE_SECTION: 'Обрати шаблон',
        CANCEL: 'Відмінити',
        SAVE: 'Зберегти',
        ADD: 'Додати',
    },
    SECTION: {
        TITLE_SAMPLE_TEXT: 'ЗАГОЛОВОК',
        DESCRIPTION_SAMPLE_TEXT:
            'Ідея створення Victory Center виникла не як проєкт, а як відповідь на виклик часу - глибокий біль, виснаження, але водночас сильна віра в перемогу.\n\n Розмови з ветеранами/ками та волонтерами/ками, які до останньої краплі віддавали свої сили заради майбутнього країни, висвітлити потребу у просторі, в якому можна знову відчути момент “тут i зараз”.\n\n Так народився задум Victory Center — ініціативи, що допомагає людям, які пройшли крізь жахи війни, зупинитися, відновитися i найголовніше бути почутими. ',
        DESCRIPTION_SAMPLE_TEXT_SHORT:
            'Ідея створення Victory Center виникла не як проєкт, а як відповідь на виклик часу - глибокий біль, виснаження, але водночас сильна віра в перемогу. ',
        SINGLE_TITLE_DESCRIPTION_AUTHOR_PAIRS: {
            DEFAULT_TITLE: 'ЩО КАЖУТЬ УЧАСНИКИ',
            TITLE_PLACEHOLDER: '',
            MODAL: {
                DELETE_BLOCK_CONFIRMATION: 'Блок буде видалено. Бажаєте продовжити?',
            },
        },
        SINGLE_TITLE_QUESTION_ANSWER_PAIRS: {
            MODAL: {
                DELETE_QUESTION_CONFIRMATION: 'Питання буде видалено. Бажаєте продовжити?',
            },
        },
        MODAL: {
            UNSAVED_CHANGES_TITLE: 'Відмінити додавання секції?',
            DELETE_SECTION_TITLE: 'Видалити секцію?',
            REPLACE_TEMPLATE_TITLE: 'Відмінити заміну шаблона?',
        },
        FORM: {
            TITLE: {
                TEXT: 'Заголовок',
                PLACEHOLDER: 'ВВЕДІТЬ ЗАГОЛОВОК',
            },
            DESCRIPTION: {
                TEXT: 'Опис',
            },
        },
        CARD: {
            BUTTON: {
                ADD_CARD: 'Додати блок',
            },
            FORM: {
                TITLE: {
                    TEXT: 'Заголовок',
                    PLACEHOLDER: 'Введіть назву',
                },
                DESCRIPTION: {
                    TEXT: 'Опис',
                    PLACEHOLDER: 'Введіть опис',
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
};

export const SECTION_IMAGE_CONFIGS = {
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
        cropWidth: 1330,
        cropHeight: 680,
        minWidth: 1330,
        minHeight: 680,
    },
    SINGLE_IMAGE_BOTTOM: {
        cropWidth: 1330,
        cropHeight: 680,
        minWidth: 1330,
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
    imageConfig: SECTION_IMAGE_CONFIGS.QUAD_IMAGES,
    elevatedIndices: [0, 2],
    imageLabel: COMMON_TEXT_ADMIN.INPUT.ADD_FILE_HERE,
    editableGridColumns: 4,
    editableImageMaxHeight: 390,
    editableImageMaxWidth: 360,
    swiperBreakpoints: {
        320: { slidesPerView: 1 },
        768: { slidesPerView: 2 },
        1080: { slidesPerView: 3 },
        1440: { slidesPerView: 4 },
    },
};

export const DUAL_IMAGES_CONFIG = {
    imageCount: 2,
    gridColumns: 2,
    imageConfig: SECTION_IMAGE_CONFIGS.DUAL_IMAGES,
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
    imageConfig: SECTION_IMAGE_CONFIGS.TRIPLE_IMAGES,
    elevatedIndices: [0, 2],
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

export const SECTION_VALIDATION = {
    images: {
        maxSizeMB: 5,
    },
};

const createSingleImageTemplateValidation = () =>
    ({
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
    }) as const;

export const SECTION_TEMPLATE_VALIDATION = {
    [SectionTemplate.QuadImagesBottom]: {
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

    [SectionTemplate.DualImagesBottom]: {
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

    [SectionTemplate.TextOnly]: {
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

    [SectionTemplate.TripleImagesBottom]: {
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

    [SectionTemplate.SingleImageBottom]: createSingleImageTemplateValidation(),
    [SectionTemplate.SingleImageTop]: createSingleImageTemplateValidation(),
    [SectionTemplate.SingleImageRight]: createSingleImageTemplateValidation(),

    [SectionTemplate.DualTitleDescriptionPairs]: {
        counts: {
            [ContentType.Title]: { min: 2, max: 2 },
            [ContentType.Description]: { min: 2, max: 2 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 25 },
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

    [SectionTemplate.TripleTitleDescriptionPairs]: {
        counts: {
            [ContentType.Title]: { min: 3, max: 3 },
            [ContentType.Description]: { min: 3, max: 3 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 25 },
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

    [SectionTemplate.QuadTitleDescriptionPairs]: {
        counts: {
            [ContentType.Title]: { min: 4, max: 4 },
            [ContentType.Description]: { min: 4, max: 4 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 25 },
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

    [SectionTemplate.SingleTitleQuintupleDescription]: {
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

    [SectionTemplate.SingleTitleDescriptionAuthorPairs]: {
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

    [SectionTemplate.SingleTitleQuestionAnswerPairs]: {
        counts: {
            [ContentType.Title]: { min: 1, max: 1 },
            [ContentType.Description]: { min: 0, max: 0 },
            [ContentType.Author]: { min: 0, max: 0 },
            [ContentType.Image]: { min: 0, max: 0 },
            [ContentType.FaqQuestion]: { min: 1, max: 10 },
        },
        lengths: {
            [ContentType.Title]: { min: 5, max: 60 },
        },
    },
} as const;
