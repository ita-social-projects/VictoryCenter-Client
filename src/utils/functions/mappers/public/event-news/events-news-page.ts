import { EventsNewsPageData, PublicEventsPageDto } from '@/types/public/events-news';
import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { mapToTags } from './localization';

export const mapToEventsNewsPage = (
    dto?: PublicEventsPageDto | null,
    languageCode: string = DEFAULT_LOCALE,
): EventsNewsPageData => ({
    description: dto?.pageDescription ?? '',
    chooseProgram: eventsNewsPageMock.chooseProgram,
    eventsData: {
        title: dto?.eventsBlockTitle ?? '',
        tags: mapToTags(dto?.categories, languageCode),
    },
});
