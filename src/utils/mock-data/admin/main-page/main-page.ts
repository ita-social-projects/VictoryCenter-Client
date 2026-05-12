import { MainPage, MetricPrefix, MetricType } from '@/types/admin/main-page';
import { TranslationStatus } from '@/types/common/language';

export const MOCK_MAIN_PAGE_DATA: MainPage = {
    id: 1,
    title: 'Коні з досвідом зцілення',
    description: 'Коли тіло та душа відновлюються — народжується справжня сила',
    image: null,
    mainAboutUs: {
        id: 1,
        title: 'Трохи про нас',
        description: 'Коли тіло та душа відновлюються — народжується справжня сила',
    },
    mainPartners: {
        id: 1,
        title: 'Наші партнери',
        description: 'Коли тіло та душа відновлюються — народжується справжня сила.',
    },
    impactStatistics: {
        id: 1,
        title: 'Зміни, які можна виміряти',
        image: null,
        localizations: [],
        metrics: [
            {
                id: 1,
                name: 'Партнерів',
                value: 20,
                type: MetricType.Partners,
                prefix: MetricPrefix.Plus,
                localizations: [
                    {
                        language: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Партнерів',
                    },
                    {
                        language: { id: 2, code: 'en' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Partners',
                    },
                ],
            },
            {
                id: 2,
                name: 'Програм',
                value: 21,
                type: MetricType.Programs,
                prefix: MetricPrefix.None,
                localizations: [
                    {
                        language: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Програм',
                    },
                    {
                        language: { id: 2, code: 'en' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Programs',
                    },
                ],
            },
            {
                id: 3,
                name: 'Зібрано',
                value: 51644000,
                type: MetricType.Raised,
                prefix: MetricPrefix.None,
                localizations: [
                    {
                        language: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Зібрано',
                    },
                    {
                        language: { id: 2, code: 'en' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Raised',
                    },
                ],
            },
            {
                id: 4,
                name: 'Годин терапії',
                value: 140,
                type: MetricType.TherapyHours,
                prefix: MetricPrefix.Plus,
                localizations: [
                    {
                        language: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Годин терапії',
                    },
                    {
                        language: { id: 2, code: 'en' },
                        translationStatus: TranslationStatus.Relevant,
                        name: 'Therapy hours',
                    },
                ],
            },
        ],
    },
};
