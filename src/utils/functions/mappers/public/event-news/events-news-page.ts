import { EventsNewsPageData, PublicEventsPageDto } from '@/types/public/events-news';
import { DEFAULT_LOCALE } from '@/const/common/locales';
import { getPublicLocalization } from '@/utils/functions/localization/get-public-localization';
import { mapToTags } from './localization';

const isBlank = (value?: string | null): boolean => !value?.trim();

export const mapToEventsNewsPage = (
    dto?: PublicEventsPageDto | null,
    languageCode: string = DEFAULT_LOCALE,
): EventsNewsPageData => {
    const localization = getPublicLocalization(dto?.localizations, languageCode);
    const description = localization?.pageDescription || dto?.pageDescription || '';
    const title = localization?.eventsBlockTitle || dto?.eventsBlockTitle || '';

    return {
        description,
        isPageDescriptionHidden: dto?.isPageDescriptionHidden || isBlank(description),
        eventsData: {
            title,
            tags: (dto?.categories || []).map(
                (category): Tag => ({
                    id: String(category.id),
                    name: category.name,
                    localizations: category.localizations ?? [],
                }),
            ),
        },
        isEventsBlockTitleHidden: dto?.isEventsBlockTitleHidden || isBlank(title),
    };
};
