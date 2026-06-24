import { EventsNewsPageData, EventsNews } from '@/types/public/events-news';
import { HippotherapyProgramSectionContentDto, HippotherapyProgramSectionDto } from '@/types/common/program-sections';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';
import chooseProgrammImg from '@/assets/images/horse-and-girl.webp';
import girlAndWhiteHorse from '@/assets/images/girl-and-white-horse.webp';
import oldManHorse from '@/assets/images/old-man-horse.webp';
import supportChildren from '@/assets/images/support-children.webp';
import peopleCircle from '@/assets/images/people-circle.webp';
import team from '@/assets/images/team.webp';
import hutirka from '@/assets/images/hutirka.webp';

const toMockImage = (url: string) => ({ id: null, url, mimeType: 'image/webp' });

const createContent = (
    content: Omit<HippotherapyProgramSectionContentDto, 'localizations'>,
): HippotherapyProgramSectionContentDto => ({
    ...content,
    localizations: [],
});

const quadImagesBottomSections: HippotherapyProgramSectionDto[] = [
    {
        id: 1,
        template: SectionTemplate.QuadImagesBottom,
        order: 0,
        contents: [
            createContent({
                contentType: ContentType.Title,
                order: 0,
                title: 'Як минула подія',
            }),
            createContent({
                contentType: ContentType.Description,
                order: 1,
                description:
                    'Учасники поділилися враженнями про заняття з конями, а організатори розповіли про подальші плани розвитку програми.',
            }),
            createContent({ contentType: ContentType.Image, order: 2, image: toMockImage(girlAndWhiteHorse) }),
            createContent({ contentType: ContentType.Image, order: 3, image: toMockImage(supportChildren) }),
            createContent({ contentType: ContentType.Image, order: 4, image: toMockImage(peopleCircle) }),
            createContent({ contentType: ContentType.Image, order: 5, image: toMockImage(oldManHorse) }),
        ],
    },
];

const dualImagesBottomSections: HippotherapyProgramSectionDto[] = [
    {
        id: 2,
        template: SectionTemplate.DualImagesBottom,
        order: 0,
        contents: [
            createContent({
                contentType: ContentType.Title,
                order: 0,
                title: 'Кадри з заходу',
            }),
            createContent({
                contentType: ContentType.Description,
                order: 1,
                description:
                    'Фоторепортаж із події, що демонструє атмосферу довіри й підтримки між учасниками та конями.',
            }),
            createContent({ contentType: ContentType.Image, order: 2, image: toMockImage(team) }),
            createContent({ contentType: ContentType.Image, order: 3, image: toMockImage(hutirka) }),
        ],
    },
];

const textOnlySections: HippotherapyProgramSectionDto[] = [
    {
        id: 3,
        template: SectionTemplate.TextOnly,
        order: 0,
        contents: [
            createContent({
                contentType: ContentType.Title,
                order: 0,
                title: 'Деталі публікації',
            }),
            createContent({
                contentType: ContentType.Description,
                order: 1,
                description:
                    'Повна версія матеріалу доступна за посиланням на ресурс-партнер. Тут наведено короткий виклад ключових тез.',
            }),
        ],
    },
];

export const eventsNewsPageMock: EventsNewsPageData = {
    description:
        'Цей розділ — про ті моменти, коли те, у що ми віримо, стає реальністю. Тут ти знайдеш все: від маленьких зустрічей до великих відкриттів, від перших кроків дітей у стайні до глибоких переживань ветеранів у сідлі.',
    chooseProgram: {
        title: 'Вір у силу події',
        description:
            'Кожна з них — не просто дата в календарі. Це — ще один доказ: відновлення можливе. Слідкуй за анонсами, читай історії, або стань частиною наступної події.',
        imgURL: chooseProgrammImg,
    },
    eventsData: {
        title: 'Що відбувалось',
        tags: [
            { id: '1', name: 'Новини' },
            { id: '2', name: 'Медіа' },
            { id: '3', name: 'Програми' },
        ],
    },
};

const tags = [
    {
        id: '1',
        name: 'Новини',
    },
    {
        id: '2',
        name: 'Медіа',
    },
    {
        id: '3',
        name: 'Програми',
    },
];

export const eventsNewsMock: EventsNews[] = [
    {
        id: '1',
        name: 'Центр психоемоційної підтримки Victory Center реалізує програму іповенції — подробиці',
        description:
            'На NV.ua вийшов великий матеріал про нашу роботу з ветеранами й дітьми. Журналісти побували на сесіях і побачили, як відбувається зцілення через довіру, тишу й спільність.',
        date: '16/02/2025',
        tags: [tags[1]],
        resource: 'Канал Дім',
        previewImage: girlAndWhiteHorse,
        backgroundImage: girlAndWhiteHorse,
        slug: 'victory-center-realizes-ipovencziya-program-details',
        sections: quadImagesBottomSections,
    },
    {
        id: '2',
        name: 'Як коні допомагають дітям і ветеранам',
        description:
            'На NV.ua вийшов великий матеріал про нашу роботу з ветеранами й дітьми. Журналісти побували на сесіях і побачили, як відбувається зцілення через довіру, тишу й спільність.',
        date: '16/02/2025',
        tags: [tags[2]],
        resource: 'NV',
        previewImage: supportChildren,
        backgroundImage: supportChildren,
        slug: 'how-horses-help-children-and-veterans',
        sections: dualImagesBottomSections,
    },
    {
        id: '3',
        name: 'Терапевтична роль коней у реабілітації дітей і військових',
        description:
            'Журналісти дізналися подробиці про нашу програму з дітьми та вояками. Вони були свідками того, як довіра до коня становить ключовим елементом у процесі зцілення.',
        date: '16/02/2025',
        tags: [tags[0]],
        previewImage: peopleCircle,
        backgroundImage: peopleCircle,
        slug: 'therapeutic-role-of-horses-in-rehabilitation-of-children-and-military',
        sections: textOnlySections,
    },
    {
        id: '4',
        name: 'Історії одужання: як коні змінюють життя ветеранів',
        description:
            "На порталі NV.ua опубліковано масштабний матеріал про наші програми з військовослужбовцями та дітьми. Інтерв'юеровані респонденти розповідали про зцілення через спілкування з конем.",
        date: '16/02/2025',
        tags: [tags[1]],
        resource: 'NV',
        previewImage: oldManHorse,
        backgroundImage: oldManHorse,
        slug: 'recovery-stories-how-horses-change-the-lives-of-veterans',
        sections: textOnlySections,
    },
    {
        id: '5',
        name: 'Як проходять реабілітаційні заняття на ранчо під Києвом — репортаж NV',
        description:
            'Репортери побували на сесіях іпотерапії та переконалися в унікальності методу. Атмосфера довіри й спокою, які коні створюють навколо себе, стають фундаментом для відновлення.',
        date: '16/02/2025',
        tags: [tags[1]],
        resource: 'NV Live',
        previewImage: team,
        backgroundImage: team,
        slug: 'how-rehabilitation-sessions-go-at-the-ranch-near-kyiv-nv-report',
        sections: textOnlySections,
    },
    {
        id: '6',
        name: 'Гутірка #2 Настя Попандопулос',
        description:
            'Розмова про те, як конярство впливає на психоемоційний стан учасників програми. Настя поділилася своїм досвідом взаємодії з конями на наших заняттях.',
        date: '16/02/2025',
        tags: [tags[1]],
        resource: 'Андрій Шимановський',
        previewImage: hutirka,
        backgroundImage: hutirka,
        slug: 'hutirka-2-nastya-popandopulos',
        sections: textOnlySections,
    },
    {
        id: '7',
        name: 'Центр психоемоційної підтримки Victory Center розповідає про нові програми іповенції',
        description:
            'Детальна розповідь про структуру та методи наших інноваційних програм. Спеціалісти центру пояснюють, чому іпотерапія виявляється настільки ефективною для всіх вікових груп.',
        date: '15/02/2025',
        tags: [tags[1]],
        resource: 'Канал Дім',
        previewImage: girlAndWhiteHorse,
        backgroundImage: girlAndWhiteHorse,
        slug: 'victory-center-announces-new-ipovencziya-program',
        sections: textOnlySections,
    },
    {
        id: '8',
        name: 'Сила людино-тваринної взаємодії: конярство як шлях до одужання',
        description:
            'Аналіз наукових даних та реальних прикладів того, як взаємодія з конем допомагає подолати психологічні травми. Матеріал охоплює досвід роботи з різними віковими категоріями учасників.',
        date: '15/02/2025',
        tags: [tags[2]],
        resource: 'NV',
        previewImage: supportChildren,
        backgroundImage: supportChildren,
        slug: 'the-power-of-human-animal-interaction-horsemanship-as-a-path-to-recovery',
        sections: textOnlySections,
    },
    {
        id: '9',
        name: 'Як коні підтримують дітей і ветеранів. :)',
        description:
            'NV.ua опублікував великий репортаж про нашу роботу з дітьми та ветеранами. Журналісти побували на заходах і відчули, як відбувається відновлення через довіру, тишу і спільне переживання.',
        date: '15/02/2025',
        tags: [tags[0]],
        previewImage: peopleCircle,
        backgroundImage: peopleCircle,
        slug: 'how-horses-support-children-and-veterans',
        sections: textOnlySections,
    },
    {
        id: '10',
        name: 'Трансформація через контакт: історії учасників нашої програми',
        description:
            'Інтимний погляд на те, як заняття з конями змінюють внутрішній світ дітей та військовослужбовців. Рідкісні моменти відкритого спілкування про те, що важко передати словами.',
        date: '15/02/2025',
        tags: [tags[1]],
        resource: 'NV',
        previewImage: oldManHorse,
        backgroundImage: oldManHorse,
        slug: 'transformation-through-contact-stories-of-participants-in-our-program',
        sections: textOnlySections,
    },
    {
        id: '11',
        name: '«Коні — це тварини, які лікують без слів»',
        description:
            'NV.ua опублікував великий репортаж про нашу роботу з дітьми та ветеранами. Журналісти побували на заходах і відчули, як відбувається відновлення через довіру, тишу і спільне переживання. :)',
        date: '15/02/2025',
        tags: [tags[1]],
        resource: 'NV Live',
        previewImage: team,
        backgroundImage: team,
        slug: 'horses-are-animals-that-heal-without-words',
        sections: textOnlySections,
    },
    {
        id: '12',
        name: 'Гутірка #2 Оксана Грушка',
        description:
            'Розмова з експертом про психологічні аспекти іпотерапії. Оксана поділяється знаннями про те, як розвивається довіра між людиною та конем.',
        date: '15/02/2025',
        tags: [tags[1]],
        resource: 'Оксана Грушка',
        previewImage: hutirka,
        backgroundImage: hutirka,
        slug: 'hutirka-2-oksana-grushka',
        sections: textOnlySections,
    },
];
