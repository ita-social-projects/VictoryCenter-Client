import { Program, ProgramCategory } from '../../../types/admin/Programs';

export const mockCategories: ProgramCategory[] = [
    { id: 1, name: 'Ветеранські', programsCount: 5 },
    { id: 2, name: 'Дитячі', programsCount: 7 },
    { id: 3, name: 'Інклюзивні', programsCount: 4 },
    { id: 4, name: 'Без елементів', programsCount: 0 },
];

export const mockPrograms: Program[] = [
    {
        id: 1,
        name: 'Кони лікують Літо 2025',
        description: 'Зменшення рівня стресу, тривоги та ПТСР у ветеранів, розвиток внутрішньої сили та опори.',
        categories: [mockCategories[0]],
        status: 'Published',
        img: null,
    },
    {
        id: 2,
        name: 'Кінна терапія для дітей з аутизмом',
        description:
            'Покращення комунікаційних навичок, моторики та соціалізації для дітей з розладами спектру аутизму.',
        categories: [mockCategories[1], mockCategories[2]],
        status: 'Draft',
        img: null,
    },
    {
        id: 3,
        name: 'Реабілітація після поранень',
        description:
            'Програма для військових з фізичними травмами: підтримка рухливості, баланс, м’язова стабільність.',
        categories: [mockCategories[0]],
        status: 'Published',
        img: null,
    },
    {
        id: 4,
        name: 'Ігрова іпотерапія для молодших школярів',
        description: 'Розвиток уваги, емоційної стабільності та впевненості через взаємодію з кіньми в ігровій формі.',
        categories: [mockCategories[1]],
        status: 'Draft',
        img: null,
    },
    {
        id: 5,
        name: 'Психоемоційна підтримка для ветеранів АТО',
        description:
            'Повернення відчуття контролю та безпеки, адаптація до мирного життя через тілесно-орієнтовану терапію.',
        categories: [mockCategories[0], mockCategories[2]],
        status: 'Published',
        img: null,
    },
    {
        id: 6,
        name: 'Кінна адаптація для дітей з ДЦП',
        description: 'Покращення координації, зменшення м’язової спастики та розвиток моторики у дітей з ДЦП.',
        categories: [mockCategories[1], mockCategories[2]],
        status: 'Published',
        img: null,
    },
    {
        id: 7,
        name: 'Соціальна адаптація дітей із кризових сімей',
        description: 'Розвиток довіри, емоційної безпеки та самоповаги через контакт із тваринами.',
        categories: [mockCategories[1]],
        status: 'Draft',
        img: null,
    },
    {
        id: 8,
        name: 'Кінна терапія в роботі з синдромом Дауна',
        description:
            'Підтримка когнітивного та емоційного розвитку у дітей із синдромом Дауна через рухову активність.',
        categories: [mockCategories[1], mockCategories[2]],
        status: 'Published',
        img: null,
    },
    {
        id: 9,
        name: 'Кінна психотерапія після бойових дій',
        description: 'Зменшення тривоги, агресії, повернення до мирного ритму життя.',
        categories: [mockCategories[0]],
        status: 'Draft',
        img: null,
    },
    {
        id: 10,
        name: 'Дитячий табір з елементами іпотерапії',
        description: 'Розвиток навичок співпраці, самоконтролю, самовираження.',
        categories: [mockCategories[1]],
        status: 'Published',
        img: null,
    },
    {
        id: 11,
        name: 'Стабілізаційна програма для ветеранів',
        description: 'Відновлення довіри до тіла, нормалізація сну та емоційний контакт через роботу з конем.',
        categories: [mockCategories[0]],
        status: 'Published',
        img: null,
    },
    {
        id: 12,
        name: 'Групова терапія для дітей з тривожністю',
        description: 'Зниження соціальної ізоляції та підтримка самовираження в групі.',
        categories: [mockCategories[1]],
        status: 'Draft',
        img: null,
    },
];
