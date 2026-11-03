import { PublishedEventNewsDto } from '@/types/public/events-news';

export const createPublishedEventNewsDto = (overrides: Partial<PublishedEventNewsDto> = {}): PublishedEventNewsDto => ({
    id: 1,
    title: 'Event title',
    description: 'Event description',
    additionalDescription: undefined,
    slug: 'event-title',
    resource: 'NV',
    resourceEn: undefined,
    publishedAt: '2025-02-15T00:00:00+02:00',
    previewImage: { id: 1, url: '/preview.webp', mimeType: 'image/webp' },
    backgroundImage: undefined,
    category: { id: 10, name: 'Media', localizations: [] },
    localizations: [],
    ...overrides,
});
