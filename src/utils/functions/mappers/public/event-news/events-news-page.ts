import { EventsNewsPageData, PublicEventsPageDto } from '@/types/public/events-news';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { mapToTags } from './localization';

const isBlank = (value?: string | null): boolean => !value?.trim();

export const mapToEventsNewsPage = (
    dto?: PublicEventsPageDto | null,
    languageCode: string = DEFAULT_LOCALE,
): EventsNewsPageData => {
    const englishLocalization =
        languageCode === 'en'
            ? dto?.localizations?.find((localization) => localization.language.code === 'en')
            : undefined;
    const description = englishLocalization?.pageDescription || dto?.pageDescription || '';
    const title = englishLocalization?.eventsBlockTitle || dto?.eventsBlockTitle || '';

    return {
        description,
        isPageDescriptionHidden: dto?.isPageDescriptionHidden ?? isBlank(description),
        eventsData: {
            title,
            tags: mapToTags(dto?.categories, languageCode),
        },
        isEventsBlockTitleHidden: dto?.isEventsBlockTitleHidden ?? isBlank(title),
    };
};
