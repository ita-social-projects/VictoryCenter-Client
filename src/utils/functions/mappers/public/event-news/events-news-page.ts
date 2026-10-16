import { EventsNewsPageData, PublicEventsPageDto } from '@/types/public/events-news';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { mapToTags } from './localization';
export const mapToEventsNewsPage = (
    dto?: PublicEventsPageDto | null,
    languageCode: string = DEFAULT_LOCALE,
): EventsNewsPageData => ({
    description: dto?.pageDescription ?? '',
    eventsData: {
        title: dto?.eventsBlockTitle ?? '',
        tags: mapToTags(dto?.categories, languageCode),
    },
});
