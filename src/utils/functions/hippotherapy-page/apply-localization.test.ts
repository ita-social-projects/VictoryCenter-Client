import { applyHippotherapyLocalization } from './apply-localization';
import { HippotherapyPageContentModel, HippotherapyPageLocalization } from '@/types/admin/hippotherapy-page';
import { TranslationStatus } from '@/types/common/language';

const text = (title: string, description: string) => ({ title, description });
const quote = (quoteText: string, authorName: string) => ({ quoteText, authorName, image: null, imageId: null });
const card = (description: string) => ({ description, image: null, imageId: null });
const reference = (id: number, name: string) => ({ localId: `l-${id}`, id, name, url: `https://ref${id}.com` });

const createBaseContent = (): HippotherapyPageContentModel => ({
    localizations: [],
    translationStatuses: [],
    introSection: { ...text('Укр Інтро', 'Опис Інтро'), image: null, imageId: null },
    descriptionSection: text('Укр Опис', 'Текст Опису'),
    quoteSection: quote('Укр Цитата', 'Автор'),
    hippoventionSection: text('Укр Гіпповенція', 'Опис Гіпповенції'),
    hippoventionCenterSection: {
        ...text('Укр Центр', 'Опис Центру'),
        pros: 'Плюси',
        image: null,
        imageId: null,
    },
    advantagesSection: { title: 'Укр Переваги', cards: [card('Картка 1 Укр'), card('Картка 2 Укр')] },
    analysisSection: text('Укр Аналіз', 'Опис Аналізу'),
    scientificReferencesSection: {
        ...text('Укр Джерела', 'Опис Джерел'),
        scientificReferences: [reference(10, 'Джерело 10 Укр'), reference(20, 'Джерело 20 Укр')],
    },
    anotherQuoteSection: quote('Укр Ще Цитата', 'Ще Автор'),
    participantsSection: { title: 'Укр Учасники', cards: [card('Учасник 1 Укр'), card('Учасник 2 Укр')] },
    ethicsSection: {
        ...text('Укр Етика', 'Опис Етики'),
        principles: ['Принцип 1', 'Принцип 2'],
        image: null,
        imageId: null,
    },
});

const createLocalization = (sections: Partial<HippotherapyPageLocalization>): HippotherapyPageLocalization => ({
    language: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
    ...sections,
});

const apply = (sections: Partial<HippotherapyPageLocalization>) =>
    applyHippotherapyLocalization(createBaseContent(), createLocalization(sections));

describe('applyHippotherapyLocalization', () => {
    it('returns original content as is when localization is null', () => {
        const base = createBaseContent();

        expect(applyHippotherapyLocalization(base, null)).toEqual(base);
    });

    it('does not mutate the base content', () => {
        const base = createBaseContent();
        const snapshot = JSON.parse(JSON.stringify(base));

        applyHippotherapyLocalization(base, createLocalization({ introSection: text('EN', 'EN') }));

        expect(base).toEqual(snapshot);
    });

    describe('simple sections', () => {
        const sections = [
            ['introSection', 'EN Intro', 'EN Intro Desc'],
            ['descriptionSection', 'EN Desc', 'EN Desc Text'],
            ['hippoventionSection', 'EN Hippovention', 'EN Hippovention Desc'],
            ['analysisSection', 'EN Analysis', 'EN Analysis Desc'],
        ] as const;

        it.each(sections)('applies translated title and description for %s', (key, title, description) => {
            const result = apply({ [key]: text(title, description) });

            expect(result![key].title).toBe(title);
            expect(result![key].description).toBe(description);
        });

        it.each(sections)('falls back to base for empty or whitespace values in %s', (key) => {
            const base = createBaseContent();
            const result = apply({ [key]: text('   ', '') });

            expect(result![key].title).toBe(base[key].title);
            expect(result![key].description).toBe(base[key].description);
        });
    });

    describe('quote sections', () => {
        it.each(['quoteSection', 'anotherQuoteSection'] as const)('applies quote and author for %s', (key) => {
            const result = apply({ [key]: { quoteText: 'EN Quote', authorName: 'EN Author' } });

            expect(result![key].quoteText).toBe('EN Quote');
            expect(result![key].authorName).toBe('EN Author');
        });

        it('falls back per field: translated quote with blank author keeps base author', () => {
            const result = apply({ quoteSection: { quoteText: 'EN Quote', authorName: '   ' } });

            expect(result!.quoteSection.quoteText).toBe('EN Quote');
            expect(result!.quoteSection.authorName).toBe('Автор');
        });

        it('keeps base author when translated author is null', () => {
            const result = apply({ quoteSection: { quoteText: 'EN Quote', authorName: null } });

            expect(result!.quoteSection.authorName).toBe('Автор');
        });
    });

    it('applies translated hippovention center fields', () => {
        const result = apply({
            hippoventionCenterSection: { title: 'EN Center', description: 'EN Center Desc', pros: 'EN Pros' },
        });

        expect(result!.hippoventionCenterSection).toMatchObject({
            title: 'EN Center',
            description: 'EN Center Desc',
            pros: 'EN Pros',
        });
    });

    describe('gallery sections', () => {
        it.each([
            ['advantagesSection', 'EN Advantages'],
            ['participantsSection', 'EN Participants'],
        ] as const)('applies title and cards for %s', (key, title) => {
            const result = apply({
                [key]: {
                    title,
                    cards: [
                        { cardId: 1, description: 'EN Card 1' },
                        { cardId: 2, description: 'EN Card 2' },
                    ],
                },
            });

            expect(result![key].title).toBe(title);
            expect(result![key].cards.map((c) => c.description)).toEqual(['EN Card 1', 'EN Card 2']);
        });

        it.each(['advantagesSection', 'participantsSection'] as const)(
            'keeps base card text for blank and missing translations in %s',
            (key) => {
                const base = createBaseContent();
                const result = apply({ [key]: { title: '   ', cards: [{ cardId: 1, description: '   ' }] } });

                expect(result![key].title).toBe(base[key].title);
                expect(result![key].cards.map((c) => c.description)).toEqual(base[key].cards.map((c) => c.description));
            },
        );

        it('does not touch card images', () => {
            const result = apply({ advantagesSection: { title: 'EN', cards: [{ cardId: 1, description: 'EN 1' }] } });

            expect(result!.advantagesSection.cards[0]).toMatchObject({ image: null, imageId: null });
        });
    });

    describe('scientific references', () => {
        it('applies title, description and names', () => {
            const result = apply({
                scientificReferencesSection: {
                    title: 'EN References',
                    description: 'EN Ref Desc',
                    references: [
                        { referenceId: 10, name: 'EN Ref 10' },
                        { referenceId: 20, name: 'EN Ref 20' },
                    ],
                },
            });

            expect(result!.scientificReferencesSection.title).toBe('EN References');
            expect(result!.scientificReferencesSection.scientificReferences.map((r) => r.name)).toEqual([
                'EN Ref 10',
                'EN Ref 20',
            ]);
        });

        it('matches by persistent id rather than array order', () => {
            const result = apply({
                scientificReferencesSection: {
                    title: 'EN',
                    description: 'EN',
                    references: [
                        { referenceId: 20, name: 'EN Ref 20' },
                        { referenceId: 10, name: 'EN Ref 10' },
                    ],
                },
            });

            expect(
                result!.scientificReferencesSection.scientificReferences.map(({ id, name }) => ({ id, name })),
            ).toEqual([
                { id: 10, name: 'EN Ref 10' },
                { id: 20, name: 'EN Ref 20' },
            ]);
        });

        it('keeps base name for blank translation and for references without translation', () => {
            const result = apply({
                scientificReferencesSection: {
                    title: '',
                    description: '   ',
                    references: [{ referenceId: 10, name: '   ' }],
                },
            });

            expect(result!.scientificReferencesSection.scientificReferences.map((r) => r.name)).toEqual([
                'Джерело 10 Укр',
                'Джерело 20 Укр',
            ]);
        });

        it('keeps urls and local ids untouched', () => {
            const result = apply({
                scientificReferencesSection: {
                    title: 'EN',
                    description: 'EN',
                    references: [{ referenceId: 10, name: 'EN' }],
                },
            });

            expect(result!.scientificReferencesSection.scientificReferences[0]).toMatchObject({
                localId: 'l-10',
                url: 'https://ref10.com',
            });
        });
    });

    describe('ethics', () => {
        it('applies title, description and principles', () => {
            const result = apply({
                ethicsSection: {
                    title: 'EN Ethics',
                    description: 'EN Ethics Desc',
                    principles: [
                        { principleId: 1, text: 'EN Principle 1' },
                        { principleId: 2, text: 'EN Principle 2' },
                    ],
                },
            });

            expect(result!.ethicsSection.title).toBe('EN Ethics');
            expect(result!.ethicsSection.principles).toEqual(['EN Principle 1', 'EN Principle 2']);
        });

        it('keeps base principle for blank or missing translation', () => {
            const result = apply({
                ethicsSection: { title: '', description: '', principles: [{ principleId: 1, text: '   ' }] },
            });

            expect(result!.ethicsSection.principles).toEqual(['Принцип 1', 'Принцип 2']);
        });
    });

    it('translates only the provided sections and leaves the others in Ukrainian', () => {
        const base = createBaseContent();
        const result = apply({ introSection: text('EN Intro', 'EN Intro Desc') });

        expect(result!.descriptionSection).toEqual(base.descriptionSection);
        expect(result!.ethicsSection).toEqual(base.ethicsSection);
    });
});
