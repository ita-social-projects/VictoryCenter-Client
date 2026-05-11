import { axiosInstance } from '@/services/api/axios';
import { API_ROUTES } from '@/const/common/api-routes/main-api';
import { HistorySectionDto } from '@/types/common/history-sections';
import { SectionTemplate } from '@/types/common/sections';
import { ContentType } from '@/types/common/section-contents';

// TODO: Remove once backend History/published endpoint is implemented (backend issue #196)
const MOCK_HISTORY_SECTIONS: HistorySectionDto[] = [
    {
        id: 1,
        template: SectionTemplate.QuadImagesBottom,
        order: 0,
        contents: [
            {
                contentType: ContentType.Title,
                order: 0,
                title: '2023 — Осінь',
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description:
                    'Ідея створення Victory Center виникла не як проєкт, а як відповідь на виклик часу — глибокий біль, виснаження, але водночас сильна віра в перемогу.\n\nРозмови з ветеранами/ками та волонтерами/ками, які до останньої краплі віддавали свої сили заради майбутнього країни, висвітлили потребу у просторі, в якому можна знову відчути момент "тут і зараз".\n\nТак народився задум Victory Center — ініціативи, що допомагає людям, які пройшли крізь жахи війни, зупинитися, відновитися і найголовніше — бути почутими.',
                image: null,
            },
            {
                contentType: ContentType.Image,
                order: 2,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-2023a/800/600', mimeType: 'image/jpeg' },
            },
            {
                contentType: ContentType.Image,
                order: 3,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-2023b/800/600', mimeType: 'image/jpeg' },
            },
            {
                contentType: ContentType.Image,
                order: 4,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-2023c/800/600', mimeType: 'image/jpeg' },
            },
            {
                contentType: ContentType.Image,
                order: 5,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-2023d/800/600', mimeType: 'image/jpeg' },
            },
        ],
    },
    {
        id: 2,
        template: SectionTemplate.TextOnly,
        order: 1,
        contents: [
            {
                contentType: ContentType.Title,
                order: 0,
                title: '2024 — Кінець 2023/початок 2024',
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description:
                    'Майбутня засновниця та виконавча директорка Victory Center, Настя, вирушила до США в межах програми International Visitor Leadership Program. Там, на Carousel Ranch у Каліфорнії, вона вперше побачила, як кінна терапія змінює життя глибоко, мʼяко і назавжди.\n\nВона повернулась до України з цим досвідом, не як із натхненням, а як із відповідальністю перед собою, країною та її захисниками.',
                image: null,
            },
        ],
    },
    {
        id: 3,
        template: SectionTemplate.SingleImageRight,
        order: 2,
        contents: [
            {
                contentType: ContentType.Title,
                order: 0,
                title: '2024 — Березень',
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description:
                    'Перша програма. Перші учасників/ці — ветерани/ки. Перший дотик до гриви коня, перший погляд у великі спокійні очі. Це був не просто старт, це була перевірка: чи зможе ідея справді стати точкою опори для інших? Вона змогла.',
                image: null,
            },
            {
                contentType: ContentType.Image,
                order: 2,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-march/800/600', mimeType: 'image/jpeg' },
            },
        ],
    },
    {
        id: 4,
        template: SectionTemplate.TextOnly,
        order: 3,
        contents: [
            {
                contentType: ContentType.Title,
                order: 0,
                title: '2024 — Квітень–жовтень',
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description:
                    'За півроку Victory Center провів більше 20 програм для ветеранів/ок, дітей, жінок полеглих воїнів та фахівці/инь екстренних служб. Кожна сесія була не просто терапевтичним процесом.\n\nУ цей період Victory Center також стає співзасновником Спілки Спеціалістів з Іпотерапії, Іповенції та Адаптивного Кінного Спорту (UEATARA).',
                image: null,
            },
        ],
    },
    {
        id: 5,
        template: SectionTemplate.DualImagesBottom,
        order: 4,
        contents: [
            {
                contentType: ContentType.Title,
                order: 0,
                title: null,
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Image,
                order: 2,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-dual-a/800/600', mimeType: 'image/jpeg' },
            },
            {
                contentType: ContentType.Image,
                order: 3,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-dual-b/800/600', mimeType: 'image/jpeg' },
            },
        ],
    },
    {
        id: 6,
        template: SectionTemplate.TextOnly,
        order: 5,
        contents: [
            {
                contentType: ContentType.Title,
                order: 0,
                title: '2024 — Грудень',
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description:
                    'Наприкінці грудня 2024 року команда Victory Center повертається до США вже не учнями, а надійними й досвідченими партнерами. Разом із DreamPower Horsemanship та Carousel Ranch команда Центру обмінюється досвідом, будує амбітні плани.\n\nМи сильніші, коли ми разом. І сильніші, коли разом рухаємось до спільної мети.',
                image: null,
            },
        ],
    },
    {
        id: 7,
        template: SectionTemplate.SingleImageTop,
        order: 6,
        contents: [
            {
                contentType: ContentType.Title,
                order: 0,
                title: '2025',
                description: null,
                image: null,
            },
            {
                contentType: ContentType.Description,
                order: 1,
                title: null,
                description:
                    'Victory Center продовжує мріяти, зростати і обʼєднувати людей. Ми віримо в те, що через силу турботи, довіру і мудрість коней можна загоювати рани і зцілювати зламані війною життя людей.\n\nІ якщо дитина знову сміється, а ветеран/ка знову відчуває себе живим — значить: ми на правильному шляху.',
                image: null,
            },
            {
                contentType: ContentType.Image,
                order: 2,
                title: null,
                description: null,
                image: { id: null, url: 'https://picsum.photos/seed/vc-2025/1440/685', mimeType: 'image/jpeg' },
            },
        ],
    },
];

const isMockEnabled = (): boolean => !process.env.REACT_APP_HISTORY_BACKEND_READY;

export const PublicHistoryApi = {
    getSections: async (): Promise<HistorySectionDto[]> => {
        if (isMockEnabled()) {
            return Promise.resolve(MOCK_HISTORY_SECTIONS);
        }

        const response = await axiosInstance.get<HistorySectionDto[]>(API_ROUTES.HISTORY.PUBLIC);
        return response.data;
    },
};
