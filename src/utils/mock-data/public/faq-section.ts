import { PAGE_SLUGS } from '../../../const/public/faq';
import { PublishedFaqQuestion } from '../../../types/public/faq-section';

const mock_answer =
    "Потрібно заповнити коротку анкету або написати координатору через форму на сайті. Після цього ми зв'яжемось для уточнення деталей";

export const MockFaq = {
    PROGRAMS: [
        {
            id: 1,
            questionText: 'Як долучитись до програми?',
            answerText: mock_answer,
        },
        {
            id: 2,
            questionText: 'Як проходять терапевтичні сесії?',
            answerText: mock_answer,
        },
        {
            id: 3,
            questionText: 'Де проходять програми?',
            answerText: mock_answer,
        },
    ],
    ABOUT_HYPPOTHERAPY: [
        { id: 4, questionText: 'Чи потрібно вміти їздити верхи?', answerText: mock_answer },
        { id: 5, questionText: 'А якщо я боюсь коней?', answerText: mock_answer },
        { id: 6, questionText: 'Це психологічна терапія чи щось інше?', answerText: mock_answer },
        { id: 7, questionText: 'Чим іповенція відрізняється від іпотерапії?', answerText: mock_answer },
        { id: 8, questionText: 'Чи це підходить дітям?', answerText: mock_answer },
        { id: 9, questionText: 'Що, якщо я не хочу взаємодіяти з конем?', answerText: mock_answer },
        { id: 10, questionText: 'Чи є обмеження для участі?', answerText: mock_answer },
    ],
    DONATE: [
        { id: 11, questionText: 'Як можна скасувати підписку?', answerText: mock_answer },
        { id: 12, questionText: 'Як я можу впевнитись, що ці донати підуть на допомогу?', answerText: mock_answer },
        { id: 13, questionText: 'Де переглянути звітність стосовно донатів?', answerText: mock_answer },
    ],
};

export const getBySlug = (slug: string): Array<PublishedFaqQuestion> => {
    switch (slug) {
        case PAGE_SLUGS.PROGRAMS:
            return MockFaq.PROGRAMS;
        case PAGE_SLUGS.ABOUT_HYPPOTHERAPY:
            return MockFaq.ABOUT_HYPPOTHERAPY;
        case PAGE_SLUGS.DONATE:
            return MockFaq.DONATE;
        default:
            return [];
    }
};
