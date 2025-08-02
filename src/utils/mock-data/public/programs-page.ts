import firstImg from '../../../../assets/images/public/programs-page/first.png';
import secondImg from '../../../../assets/images/public/programs-page/second.png';
import thirdImg from '../../../../assets/images/public/programs-page/third.png';
import fourthImg from '../../../../assets/images/public/programs-page/fourth.png';
import fifthImg from '../../../../assets/images/public/programs-page/fifth.png';
export const MockCards = {
    programData: [
        {
            image: firstImg,
            title: 'Коні лікують Літо 2025',
            subtitle: 'Ветеранська програма',
            description:
                'Зменшення рівня стресу, тривоги та ПТСР у ветеранів, повернення відчуття контролю, розвиток внутрішньої сили та опори.',
        },
        {
            image: secondImg,
            title: 'Коні лікують Літо 2025',
            subtitle: 'Ветеранська програма',
            description:
                'Зменшення рівня стресу, тривоги та ПТСР у ветеранів, повернення відчуття контролю, розвиток внутрішньої сили та опори.',
        },
        {
            image: thirdImg,
            title: 'Коні лікують Літо 2025',
            subtitle: 'Ветеранська програма',
            description:
                'Зменшення рівня стресу, тривоги та ПТСР у ветеранів, повернення відчуття контролю, розвиток внутрішньої сили та опори.',
        },
        {
            image: fourthImg,
            title: 'Коні лікують Літо 2025',
            subtitle: 'Ветеранська програма',
            description:
                'Зменшення рівня стресу, тривоги та ПТСР у ветеранів, повернення відчуття контролю, розвиток внутрішньої сили та опори.',
        },
        {
            image: fifthImg,
            title: 'Коні лікують Літо 2025',
            subtitle: 'Ветеранська програма',
            description:
                'Зменшення рівня стресу, тривоги та ПТСР у ветеранів, повернення відчуття контролю, розвиток внутрішньої сили та опори.',
        },
    ],
};
export const MockQuestions = {
    questions: [
        {
            question: 'Як долучитись до програми?',
            answer: "Потрібно заповнити коротку анкету або написати координатору через форму на сайті. Після цього ми зв'яжемось для уточнення деталей.",
        },
        {
            question: 'Як проходять терапевтичні сесії?',
            answer: "Потрібно заповнити коротку анкету або написати координатору через форму на сайті. Після цього ми зв'яжемось для уточнення деталей.",
        },
        {
            question: 'Де проходять програми?',
            answer: "Потрібно заповнити коротку анкету або написати координатору через форму на сайті. Після цього ми зв'яжемось для уточнення деталей.",
        },
    ],
};

export const programPageDataFetch = async () => MockCards;
export const questionDataFetch = async () => MockQuestions;
