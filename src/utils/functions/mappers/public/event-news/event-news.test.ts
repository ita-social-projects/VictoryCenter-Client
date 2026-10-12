import { createPublishedEventNewsDto } from '@/utils/mock-data/public/published-event-news';
import { mapToEventsNews } from './event-news';

describe('mapToEventsNews', () => {
    it('maps a full backend dto to the frontend model', () => {
        const background = { id: 2, url: '/background.webp', mimeType: 'image/webp' };
        const dto = createPublishedEventNewsDto({
            id: 42,
            categories: [
                { id: 10, name: 'Media', localizations: [] },
                { id: 11, name: 'News', localizations: [] },
            ],
            backgroundImage: background,
        });

        expect(mapToEventsNews(dto)).toEqual({
            id: '42',
            name: 'Event title',
            description: 'Event description',
            date: '15/02/2025',
            tags: [
                { id: '10', name: 'Media' },
                { id: '11', name: 'News' },
            ],
            resource: 'NV',
            previewImage: '/preview.webp',
            backgroundImage: background,
            slug: 'event-title',
            sections: [],
        });
    });

    it('converts numeric ids to strings', () => {
        const result = mapToEventsNews(createPublishedEventNewsDto({ id: 7 }));

        expect(result.id).toBe('7');
        expect(result.tags[0].id).toBe('10');
    });

    it.each([
        ['title', { title: null }, 'name', ''],
        ['description', { description: null }, 'description', ''],
        ['publishedAt', { publishedAt: null }, 'date', ''],
        ['preview image', { previewImage: null }, 'previewImage', ''],
        ['background image', { backgroundImage: null }, 'backgroundImage', null],
        ['slug', { slug: null }, 'slug', ''],
        ['resource', { resource: null }, 'resource', undefined],
    ] as const)('uses a fallback when %s is missing', (_field, overrides, resultKey, expected) => {
        const result = mapToEventsNews(createPublishedEventNewsDto(overrides));

        expect(result[resultKey]).toBe(expected);
    });

    it('returns an empty date when publishedAt has an unexpected format', () => {
        expect(mapToEventsNews(createPublishedEventNewsDto({ publishedAt: 'not-a-date' })).date).toBe('');
    });

    it('returns no tags when the news has no categories', () => {
        expect(mapToEventsNews(createPublishedEventNewsDto({ categories: [] })).tags).toEqual([]);
    });

    it('always returns an empty sections list', () => {
        expect(mapToEventsNews(createPublishedEventNewsDto()).sections).toEqual([]);
    });
});
