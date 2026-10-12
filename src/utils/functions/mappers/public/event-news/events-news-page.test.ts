import { mapToEventsNewsPage } from './events-news-page';

describe('mapToEventsNewsPage', () => {
    it('maps title, description and categories to tags', () => {
        const result = mapToEventsNewsPage({
            eventsBlockTitle: '<p>T</p>',
            pageDescription: '<p>D</p>',
            categories: [{ id: 10, name: 'Media', localizations: [] }],
        });

        expect(result.description).toBe('<p>D</p>');
        expect(result.eventsData).toEqual({ title: '<p>T</p>', tags: [{ id: '10', name: 'Media' }] });
    });

    it.each([undefined, null, {}, { categories: null }, { categories: [] }])(
        'returns empty tags and strings for %p',
        (dto) => {
            const result = mapToEventsNewsPage(dto as never);
            expect(result.eventsData.tags).toEqual([]);
            expect(result.eventsData.title).toBe('');
            expect(result.description).toBe('');
        },
    );
});
