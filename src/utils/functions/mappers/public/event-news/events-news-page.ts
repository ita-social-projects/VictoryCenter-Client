import { EventsNewsPageData, PublicEventsPageDto } from '@/types/public/events-news';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { mapToTags } from './localization';

const isBlank = (value?: string | null): boolean => !value?.trim();

export const mapToEventsNewsPage = (
    dto?: PublicEventsPageDto | null,
    languageCode: string = DEFAULT_LOCALE,
): EventsNewsPageData => {
    const description = dto?.pageDescription ?? '';
    const title = dto?.eventsBlockTitle ?? '';

    return {
        description,
        isPageDescriptionHidden: isBlank(description),
        eventsData: {
            title,
            tags: mapToTags(dto?.categories, languageCode),
        },
        isEventsBlockTitleHidden: isBlank(title),
    };
};
