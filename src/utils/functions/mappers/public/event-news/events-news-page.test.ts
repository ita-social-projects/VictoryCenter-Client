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
            tags: [{ id: '10', name: 'Media' }],
        });
    });

    it('maps every category to a tag with a string id', () => {
        const result = mapToEventsNewsPage({
            categories: [createCategory({ id: 1, name: 'News' }), createCategory({ id: 2, name: 'Events' })],
        });

        expect(result.eventsData.tags).toEqual([
            { id: '1', name: 'News' },
            { id: '2', name: 'Events' },
        ]);
    });

    it('uses the localized category name for the given language', () => {
        const category = createCategory({
            localizations: [
                { language: { code: 'en' }, name: 'Media EN' },
                { language: { code: 'uk' }, name: 'Медіа' },
            ],
        });

        expect(mapToEventsNewsPage({ categories: [category] }, 'en').eventsData.tags).toEqual([
            { id: '10', name: 'Media EN' },
        ]);
        expect(mapToEventsNewsPage({ categories: [category] }, 'uk').eventsData.tags).toEqual([
            { id: '10', name: 'Медіа' },
        ]);
    });

    it('falls back to the base category name when no localization matches', () => {
        const category = createCategory({
            localizations: [{ language: { code: 'uk' }, name: 'Медіа' }],
        });

        const result = mapToEventsNewsPage({ categories: [category] }, 'en');

        expect(result.eventsData.tags).toEqual([{ id: '10', name: 'Media' }]);
    });

    it('falls back to the base category name when the localized name is blank', () => {
        const category = createCategory({
            localizations: [{ language: { code: 'en' }, name: '   ' }],
        });

        const result = mapToEventsNewsPage({ categories: [category] }, 'en');

        expect(result.eventsData.tags).toEqual([{ id: '10', name: 'Media' }]);
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
