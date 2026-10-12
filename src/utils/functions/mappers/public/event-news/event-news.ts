import { EventsNews, PublishedEventNewsDto } from '@/types/public/events-news';
import { formatDate } from '@/utils/functions/formatters/format-date';

export const mapToEventsNews = (dto: PublishedEventNewsDto): EventsNews => ({
    id: String(dto.id),
    name: dto.title ?? '',
    description: dto.description ?? '',
    date: dto.publishedAt ? formatDate(dto.publishedAt) : '',
    tags: (dto.categories ?? []).map((c) => ({ id: String(c.id), name: c.name })),
    resource: dto.resource ?? undefined,
    previewImage: dto.previewImage?.url ?? '',
    backgroundImage: dto.backgroundImage ?? null,
    slug: dto.slug ?? '',
    sections: [],
});
