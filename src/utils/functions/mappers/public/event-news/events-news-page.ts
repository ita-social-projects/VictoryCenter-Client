import { EventsNewsPageData, PublicEventsPageDto, Tag } from '@/types/public/events-news';

const isBlank = (value?: string | null): boolean => !value?.trim();

export const mapToEventsNewsPage = (dto?: PublicEventsPageDto | null): EventsNewsPageData => {
    const description = dto?.pageDescription ?? '';
    const title = dto?.eventsBlockTitle ?? '';

    return {
        description,
        isPageDescriptionHidden: isBlank(description),
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
        isEventsBlockTitleHidden: isBlank(title),
    };
};
