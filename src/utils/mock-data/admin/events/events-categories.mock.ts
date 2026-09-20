import { EventCategoryDto } from '@/types/admin/event-category';
import { TranslationStatus } from '@/types/common/language';

export const MOCK_EVENT_CATEGORIES: any[] = [
    {
        id: 1,
        name: 'Іпотерапія',
        eventItemsCount: 5,
        localizations: [
            {
                language: { id: 2, code: 'en' },
                name: 'Hippotherapy',
                translationStatus: TranslationStatus.Relevant,
            },
        ],
    },
    {
        id: 2,
        name: 'Походи',
        eventItemsCount: 3,
        localizations: [
            {
                language: { id: 2, code: 'en' },
                name: 'Hiking',
                translationStatus: TranslationStatus.Outdated,
            },
        ],
    },
    {
        id: 4,
        name: 'Презентації',
        eventItemsCount: 0,
        localizations: [],
    },
];
