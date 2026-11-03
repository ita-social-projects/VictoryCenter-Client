import { EventNewsCategoryDto } from '@/types/public/events-news';
import { mapToEventsNewsPage } from './events-news-page';

const createCategory = (overrides: Partial<EventNewsCategoryDto> = {}): EventNewsCategoryDto => ({
    id: 10,
    name: 'Media',
    localizations: [],
    ...overrides,
});

describe('mapToEventsNewsPage', () => {
    it('maps title, description and categories to tags', () => {
        const result = mapToEventsNewsPage({
            eventsBlockTitle: '<p>T</p>',
            pageDescription: '<p>D</p>',
            categories: [createCategory()],
        });

        expect(result.description).toBe('<p>D</p>');
        expect(result.eventsData).toEqual({
            title: '<p>T</p>',
            tags: [{ id: '10', name: 'Media', localizations: [] }],
        });
    });

    it('maps every category to a tag with a string id and properly initialized localizations', () => {
        const result = mapToEventsNewsPage({
            categories: [createCategory({ id: 1, name: 'News' }), createCategory({ id: 2, name: 'Events' })],
        });

        expect(result.eventsData.tags).toEqual([
            { id: '1', name: 'News', localizations: [] },
            { id: '2', name: 'Events', localizations: [] },
        ]);
    });

    it('maps category localizations safely into the tag object', () => {
        const category = createCategory({
            localizations: [
                { language: { code: 'en' }, name: 'Media EN' },
                { language: { code: 'uk' }, name: 'Медіа' },
            ],
        });

        const result = mapToEventsNewsPage({ categories: [category] });

        expect(result.eventsData.tags).toEqual([
            {
                id: '10',
                name: 'Media',
                localizations: [
                    { language: { code: 'en' }, name: 'Media EN' },
                    { language: { code: 'uk' }, name: 'Медіа' },
                ],
            },
        ]);
    });

    it('uses each available English intro translation independently', () => {
        const result = mapToEventsNewsPage(
            {
                eventsBlockTitle: 'Base title',
                pageDescription: 'Base description',
                localizations: [
                    {
                        language: { code: 'en' },
                        pageDescription: 'English description',
                    },
                ],
            },
            'en',
        );

        expect(result.description).toBe('English description');
        expect(result.eventsData.title).toBe('Base title');
    });

    it('honors the server visibility flags even when translated content exists', () => {
        const result = mapToEventsNewsPage(
            {
                eventsBlockTitle: 'Base title',
                pageDescription: 'Base description',
                isEventsBlockTitleHidden: true,
                isPageDescriptionHidden: true,
                localizations: [
                    {
                        language: { code: 'en' },
                        eventsBlockTitle: 'English title',
                        pageDescription: 'English description',
                    },
                ],
            },
            'en',
        );

        expect(result.isPageDescriptionHidden).toBe(true);
        expect(result.isEventsBlockTitleHidden).toBe(true);
    });

    it('hides empty intro blocks when the server visibility flags are false', () => {
        const result = mapToEventsNewsPage({
            eventsBlockTitle: '',
            pageDescription: '',
            isEventsBlockTitleHidden: false,
            isPageDescriptionHidden: false,
        });

        expect(result.isPageDescriptionHidden).toBe(true);
        expect(result.isEventsBlockTitleHidden).toBe(true);
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
