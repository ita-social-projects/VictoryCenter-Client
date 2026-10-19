import { PublishedEventNewsDto } from '@/types/public/events-news';

/**
 * Shared builder for backend `PublishedEventNewsDto` objects
 * Used by  API and mapper tests so  DTO shape lives in one place
 */
export const createPublishedEventNewsDto = (overrides: Partial<PublishedEventNewsDto> = {}): PublishedEventNewsDto => ({
    id: 1,
    title: 'Event title',
    description: 'Event description',
    additionalDescription: null,
    slug: 'event-title',
    resource: 'NV',
    resourceEn: null,
    publishedAt: '2025-02-15T00:00:00+02:00',
    previewImage: { id: 1, url: '/preview.webp', mimeType: 'image/webp' },
    backgroundImage: null,
    category: { id: 10, name: 'Media', localizations: [] },
    localizations: [],
    ...overrides,
});
