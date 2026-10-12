import { EventNewsCategoryDto, EventsNewsPageData, PublicEventsPageDto, Tag } from '@/types/public/events-news';
import { eventsNewsPageMock } from '@/utils/mock-data/public/event-news';

export const mapToTags = (categories?: EventNewsCategoryDto[] | null): Tag[] =>
    Array.isArray(categories)
        ? categories
              .filter((c): c is EventNewsCategoryDto => c != null && c.id != null)
              .map((c) => ({ id: String(c.id), name: c.name ?? '' }))
        : [];

export const mapToEventsNewsPage = (dto?: PublicEventsPageDto | null): EventsNewsPageData => ({
    description: dto?.pageDescription ?? '',
    chooseProgram: eventsNewsPageMock.chooseProgram,
    eventsData: {
        title: dto?.eventsBlockTitle ?? '',
        tags: mapToTags(dto?.categories),
    },
});
