import { createPublishedEventNewsDto } from '@/utils/mock-data/public/published-event-news';
import { mapToEventsNews } from './event-news';

describe('mapToEventsNews', () => {
    it('maps a full backend dto to the frontend model', () => {
        const background = { id: 2, url: '/background.webp', mimeType: 'image/webp' };
        const dto = createPublishedEventNewsDto({
            id: 42,
            category: { id: 10, name: 'Media', localizations: [] },
            backgroundImage: background,
        });

        expect(mapToEventsNews(dto)).toEqual({
            id: '42',
            name: 'Event title',
            description: 'Event description',
            date: '15/02/2025',
            tag: { id: '10', name: 'Media' },
            resource: 'NV',
            previewImage: '/preview.webp',
            backgroundImage: background,
            slug: 'event-title',
            sections: [],
            localizations: [],
        });
    });

    it('converts numeric ids to strings', () => {
        const result = mapToEventsNews(createPublishedEventNewsDto({ id: 7 }));

        expect(result.id).toBe('7');
        expect(result.tag?.id).toBe('10');
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
        expect(mapToEventsNews(createPublishedEventNewsDto({ category: undefined })).tag).toEqual(undefined);
    });

    it('always returns an empty sections list', () => {
        expect(mapToEventsNews(createPublishedEventNewsDto()).sections).toEqual([]);
    });
});
