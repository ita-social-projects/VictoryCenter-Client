import { applyHippotherapyLocalization } from './apply-localization';
import { HippotherapyPageContentModel, HippotherapyPageLocalization } from '@/types/admin/hippotherapy-page';
import { TranslationStatus } from '@/types/common/language';

const text = (title: string, description: string) => ({ title, description });
const quote = (quoteText: string, authorName: string) => ({ quoteText, authorName, image: null, imageId: null });
const card = (id: number | null, description: string) => ({ id, description, image: null, imageId: null });
const principle = (id: number | null, value: string) => ({ id, text: value });
const reference = (id: number, name: string) => ({ localId: `l-${id}`, id, name, url: `https://ref${id}.com` });

const createBaseContent = (): HippotherapyPageContentModel => ({
    localizations: [],
    translationStatuses: [],
    introSection: { ...text('Укр Інтро', 'Опис Інтро'), image: null, imageId: null },
    descriptionSection: text('Укр Опис', 'Текст Опису'),
    quoteSection: quote('Укр Цитата', 'Автор'),
    hippoventionSection: text('Укр Гіпповенція', 'Опис Гіпповенції'),
    hippoventionCenterSection: { ...text('Укр Центр', 'Опис Центру'), pros: 'Плюси', image: null, imageId: null },
    advantagesSection: { title: 'Укр Переваги', cards: [card(1, 'Картка 1 Укр'), card(2, 'Картка 2 Укр')] },
    analysisSection: text('Укр Аналіз', 'Опис Аналізу'),
    scientificReferencesSection: {
        ...text('Укр Джерела', 'Опис Джерел'),
        scientificReferences: [reference(10, 'Джерело 10 Укр'), reference(20, 'Джерело 20 Укр')],
    },
    anotherQuoteSection: quote('Укр Ще Цитата', 'Ще Автор'),
    participantsSection: { title: 'Укр Учасники', cards: [card(5, 'Учасник 1 Укр'), card(6, 'Учасник 2 Укр')] },
    ethicsSection: {
        ...text('Укр Етика', 'Опис Етики'),
        principles: [principle(7, 'Принцип 1'), principle(8, 'Принцип 2')],
        image: null,
        imageId: null,
    },
});

const createLocalization = (sections: Partial<HippotherapyPageLocalization>): HippotherapyPageLocalization => ({
    language: { id: 2, code: 'en' },
    translationStatus: TranslationStatus.Relevant,
    ...sections,
});

const applyTo = (base: HippotherapyPageContentModel, sections: Partial<HippotherapyPageLocalization>) =>
    applyHippotherapyLocalization(base, createLocalization(sections));

const apply = (sections: Partial<HippotherapyPageLocalization>) => applyTo(createBaseContent(), sections);

describe('applyHippotherapyLocalization', () => {
    it('returns original content as is when localization is null', () => {
        const base = createBaseContent();

        expect(applyHippotherapyLocalization(base, null)).toEqual(base);
    });

    it('does not mutate the base content', () => {
        const base = createBaseContent();
        const snapshot = JSON.parse(JSON.stringify(base));

        applyTo(base, { introSection: text('EN', 'EN') });

        expect(base).toEqual(snapshot);
    });

    it('translates only the provided sections and leaves the others in Ukrainian', () => {
        const base = createBaseContent();
        const result = apply({ introSection: text('EN Intro', 'EN Intro Desc') });

        expect(result.descriptionSection).toEqual(base.descriptionSection);
        expect(result.ethicsSection).toEqual(base.ethicsSection);
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

            expect(result[key].title).toBe(title);
            expect(result[key].description).toBe(description);
        });

        it.each(sections)('falls back to base for empty or whitespace values in %s', (key) => {
            const base = createBaseContent();
            const result = applyTo(base, { [key]: text('   ', '') });

            expect(result[key].title).toBe(base[key].title);
            expect(result[key].description).toBe(base[key].description);
        });
    });

    describe('quote sections', () => {
        it.each(['quoteSection', 'anotherQuoteSection'] as const)('applies quote and author for %s', (key) => {
            const result = apply({ [key]: { quoteText: 'EN Quote', authorName: 'EN Author' } });

            expect(result[key].quoteText).toBe('EN Quote');
            expect(result[key].authorName).toBe('EN Author');
        });

        it.each([
            ['blank', '   '],
            ['null', null],
        ])('keeps base author when translated author is %s', (_name, author) => {
            const result = apply({ quoteSection: { quoteText: 'EN Quote', authorName: author } });

            expect(result.quoteSection.quoteText).toBe('EN Quote');
            expect(result.quoteSection.authorName).toBe('Автор');
        });
    });

    it('applies translated hippovention center fields', () => {
        const result = apply({
            hippoventionCenterSection: { title: 'EN Center', description: 'EN Center Desc', pros: 'EN Pros' },
        });

        expect(result.hippoventionCenterSection).toMatchObject({
            title: 'EN Center',
            description: 'EN Center Desc',
            pros: 'EN Pros',
        });
    });

    describe.each([
        ['advantagesSection', [1, 2]],
        ['participantsSection', [5, 6]],
    ] as const)('gallery cards in %s', (key, [firstId, secondId]) => {
        it('applies title and cards by cardId', () => {
            const result = apply({
                [key]: {
                    title: 'EN Title',
                    cards: [
                        { cardId: firstId, description: 'EN Card 1' },
                        { cardId: secondId, description: 'EN Card 2' },
                    ],
                },
            });

            expect(result[key].title).toBe('EN Title');
            expect(result[key].cards.map((c) => c.description)).toEqual(['EN Card 1', 'EN Card 2']);
        });

        it('puts text on the right card when translations come in a different order', () => {
            const result = apply({
                [key]: {
                    title: 'EN',
                    cards: [
                        { cardId: secondId, description: 'EN Card 2' },
                        { cardId: firstId, description: 'EN Card 1' },
                    ],
                },
            });

            expect(result[key].cards.map((c) => [c.id, c.description])).toEqual([
                [firstId, 'EN Card 1'],
                [secondId, 'EN Card 2'],
            ]);
        });

        it('translates only the cards that have a translation (partial)', () => {
            const base = createBaseContent();
            const result = applyTo(base, {
                [key]: { title: '', cards: [{ cardId: secondId, description: 'EN Card 2' }] },
            });

            expect(result[key].cards.map((c) => c.description)).toEqual([base[key].cards[0].description, 'EN Card 2']);
        });

        it('keeps base card text for blank translation and blank title', () => {
            const base = createBaseContent();
            const result = applyTo(base, {
                [key]: { title: '   ', cards: [{ cardId: firstId, description: '   ' }] },
            });

            expect(result[key].title).toBe(base[key].title);
            expect(result[key].cards.map((c) => c.description)).toEqual(base[key].cards.map((c) => c.description));
        });

        it('never gives a translation to a new unsaved card (id: null)', () => {
            const base = createBaseContent();
            base[key].cards.push(card(null, 'Нова картка'));

            const result = applyTo(base, {
                [key]: { title: 'EN', cards: [{ cardId: firstId, description: 'EN Card 1' }] },
            });

            expect(result[key].cards[2]).toMatchObject({ id: null, description: 'Нова картка' });
        });

        it('ignores translations for unknown card ids', () => {
            const base = createBaseContent();
            const result = applyTo(base, { [key]: { title: 'EN', cards: [{ cardId: 999, description: 'EN' }] } });

            expect(result[key].cards.map((c) => c.description)).toEqual(base[key].cards.map((c) => c.description));
        });

        it('does not touch card images and ids', () => {
            const result = apply({ [key]: { title: 'EN', cards: [{ cardId: firstId, description: 'EN 1' }] } });

            expect(result[key].cards[0]).toMatchObject({ id: firstId, image: null, imageId: null });
        });
    });

    describe('scientific references', () => {
        it('applies title, description and names by referenceId', () => {
            const result = apply({
                scientificReferencesSection: {
                    title: 'EN References',
                    description: 'EN Ref Desc',
                    scientificReferences: [
                        { id: 10, name: 'EN Ref 10' },
                        { id: 20, name: 'EN Ref 20' },
                    ],
                },
            });

            expect(result.scientificReferencesSection.title).toBe('EN References');
            expect(result.scientificReferencesSection.scientificReferences.map((r) => r.name)).toEqual([
                'EN Ref 10',
                'EN Ref 20',
            ]);
        });

        it('matches by referenceId rather than array order', () => {
            const result = apply({
                scientificReferencesSection: {
                    title: 'EN',
                    description: 'EN',
                    scientificReferences: [
                        { id: 20, name: 'EN Ref 20' },
                        { id: 10, name: 'EN Ref 10' },
                    ],
                },
            });

            expect(
                result.scientificReferencesSection.scientificReferences.map(({ id, name }) => ({ id, name })),
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
                    scientificReferences: [{ id: 10, name: '   ' }],
                },
            });

            expect(result.scientificReferencesSection.scientificReferences.map((r) => r.name)).toEqual([
                'Джерело 10 Укр',
                'Джерело 20 Укр',
            ]);
        });

        it('keeps urls and local ids untouched', () => {
            const result = apply({
                scientificReferencesSection: {
                    title: 'EN',
                    description: 'EN',
                    scientificReferences: [{ id: 10, name: 'EN' }],
                },
            });

            expect(result.scientificReferencesSection.scientificReferences[0]).toMatchObject({
                localId: 'l-10',
                url: 'https://ref10.com',
            });
        });
    });

    describe('ethics principles', () => {
        it('applies title, description and principles by principleId', () => {
            const result = apply({
                ethicsSection: {
                    title: 'EN Ethics',
                    description: 'EN Ethics Desc',
                    principles: [
                        { principleId: 7, text: 'EN Principle 1' },
                        { principleId: 8, text: 'EN Principle 2' },
                    ],
                },
            });

            expect(result.ethicsSection.title).toBe('EN Ethics');
            expect(result.ethicsSection.principles).toEqual([
                { id: 7, text: 'EN Principle 1' },
                { id: 8, text: 'EN Principle 2' },
            ]);
        });

        it('puts text on the right principle when translations come in a different order', () => {
            const result = apply({
                ethicsSection: {
                    title: '',
                    description: '',
                    principles: [
                        { principleId: 8, text: 'EN Principle 2' },
                        { principleId: 7, text: 'EN Principle 1' },
                    ],
                },
            });

            expect(result.ethicsSection.principles).toEqual([
                { id: 7, text: 'EN Principle 1' },
                { id: 8, text: 'EN Principle 2' },
            ]);
        });

        it('keeps base principle for blank, missing and partial translations', () => {
            const result = apply({
                ethicsSection: {
                    title: '',
                    description: '',
                    principles: [{ principleId: 7, text: '   ' }],
                },
            });

            expect(result.ethicsSection.principles.map((p) => p.text)).toEqual(['Принцип 1', 'Принцип 2']);
        });

        it('never gives a translation to a new unsaved principle (id: null)', () => {
            const base = createBaseContent();
            base.ethicsSection.principles.push(principle(null, 'Новий принцип'));

            const result = applyTo(base, {
                ethicsSection: { title: '', description: '', principles: [{ principleId: 7, text: 'EN 1' }] },
            });

            expect(result.ethicsSection.principles[2]).toEqual({ id: null, text: 'Новий принцип' });
        });
    });
});
