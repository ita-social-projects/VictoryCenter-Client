import { applyHippotherapyLocalization } from './apply-localization';
import { HippotherapyPageContentModel, HippotherapyPageLocalization } from '@/types/admin/hippotherapy-page';

const createBaseContent = (): HippotherapyPageContentModel => ({
    localizations: [],
    translationStatuses: [],
    introSection: { title: 'Укр Інтро', description: 'Опис Інтро', image: null, imageId: null },
    descriptionSection: { title: 'Укр Опис', description: 'Текст Опису' },
    quoteSection: { quoteText: 'Укр Цитата', authorName: 'Автор', image: null, imageId: null },
    hippoventionSection: { title: 'Укр Гіпповенція', description: 'Опис Гіпповенції' },
    hippoventionCenterSection: {
        title: 'Укр Центр',
        description: 'Опис Центру',
        pros: 'Плюси',
        image: null,
        imageId: null,
    },
    advantagesSection: {
        title: 'Укр Переваги',
        cards: [
            { description: 'Картка 1 Укр', image: null, imageId: null },
            { description: 'Картка 2 Укр', image: null, imageId: null },
        ],
    },
    analysisSection: { title: 'Укр Аналіз', description: 'Опис Аналізу' },
    scientificReferencesSection: {
        title: 'Укр Джерела',
        description: 'Опис Джерел',
        scientificReferences: [
            { localId: 'l-1', id: 10, name: 'Джерело 10 Укр', url: 'https://ref1.com' },
            { localId: 'l-2', id: 20, name: 'Джерело 20 Укр', url: 'https://ref2.com' },
        ],
    },
    anotherQuoteSection: { quoteText: 'Укр Ще Цитата', authorName: 'Ще Автор', image: null, imageId: null },
    participantsSection: {
        title: 'Укр Учасники',
        cards: [
            { description: 'Учасник 1 Укр', image: null, imageId: null },
            { description: 'Учасник 2 Укр', image: null, imageId: null },
        ],
    },
    ethicsSection: {
        title: 'Укр Етика',
        description: 'Опис Етики',
        principles: ['Принцип 1', 'Принцип 2'],
        image: null,
        imageId: null,
    },
});

describe('applyHippotherapyLocalization', () => {
    it('returns original content as is when localization is null', () => {
        const base = createBaseContent();
        expect(applyHippotherapyLocalization(base, null)).toEqual(base);
    });

    it('applies translated values for all sections when localization is fully populated', () => {
        const base = createBaseContent();
        const localization: HippotherapyPageLocalization = {
            language: { id: 2, code: 'en' },
            translationStatus: 1 as any,
            introSection: { title: 'EN Intro', description: 'EN Intro Desc' },
            descriptionSection: { title: 'EN Desc', description: 'EN Desc Text' },
            quoteSection: { quoteText: 'EN Quote', authorName: 'EN Author' },
            hippoventionSection: { title: 'EN Hippovention', description: 'EN Hippovention Desc' },
            hippoventionCenterSection: { title: 'EN Center', description: 'EN Center Desc', pros: 'EN Pros' },
            advantagesSection: {
                title: 'EN Advantages',
                cards: [
                    { cardId: 1, description: 'EN Card 1' },
                    { cardId: 2, description: 'EN Card 2' },
                ],
            },
            analysisSection: { title: 'EN Analysis', description: 'EN Analysis Desc' },
            scientificReferencesSection: {
                title: 'EN References',
                description: 'EN Ref Desc',
                scientificReferences: [
                    { id: 10, name: 'EN Ref 10' },
                    { id: 20, name: 'EN Ref 20' },
                ],
            },
            anotherQuoteSection: { quoteText: 'EN Another Quote', authorName: 'EN Another Author' },
            participantsSection: {
                title: 'EN Participants',
                cards: [
                    { cardId: 1, description: 'EN Part 1' },
                    { cardId: 2, description: 'EN Part 2' },
                ],
            },
            ethicsSection: {
                title: 'EN Ethics',
                description: 'EN Ethics Desc',
                principles: [
                    { principleId: 1, text: 'EN Principle 1' },
                    { principleId: 2, text: 'EN Principle 2' },
                ],
            },
        };

        const result = applyHippotherapyLocalization(base, localization);

        expect(result.introSection.title).toBe('EN Intro');
        expect(result.introSection.description).toBe('EN Intro Desc');
        expect(result.descriptionSection.title).toBe('EN Desc');
        expect(result.quoteSection.quoteText).toBe('EN Quote');
        expect(result.hippoventionCenterSection.pros).toBe('EN Pros');
        expect(result.advantagesSection.cards[0].description).toBe('EN Card 1');
        expect(result.participantsSection.cards[0].description).toBe('EN Part 1');
        expect(result.scientificReferencesSection.scientificReferences[0].name).toBe('EN Ref 10');
        expect(result.ethicsSection.principles).toEqual(['EN Principle 1', 'EN Principle 2']);
    });

    it('falls back to base content if translated value is empty or whitespace-only', () => {
        const base = createBaseContent();
        const localization: HippotherapyPageLocalization = {
            language: { id: 2, code: 'en' },
            translationStatus: 1 as any,
            introSection: { title: '   ', description: '' },
            quoteSection: { quoteText: 'EN Quote', authorName: '   ' },
            advantagesSection: {
                title: '   ',
                cards: [{ cardId: 1, description: '   ' }],
            },
            scientificReferencesSection: {
                title: '',
                description: '   ',
                scientificReferences: [{ id: 10, name: '   ' }],
            },
            ethicsSection: {
                title: '',
                description: '',
                principles: [{ principleId: 1, text: '   ' }],
            },
        };

        const result = applyHippotherapyLocalization(base, localization);

        expect(result.introSection.title).toBe('Укр Інтро');
        expect(result.introSection.description).toBe('Опис Інтро');
        expect(result.quoteSection.quoteText).toBe('EN Quote');
        expect(result.quoteSection.authorName).toBe('Автор');
        expect(result.advantagesSection.cards[0].description).toBe('Картка 1 Укр');
        expect(result.scientificReferencesSection.scientificReferences[0].name).toBe('Джерело 10 Укр');
        expect(result.ethicsSection.principles[0]).toBe('Принцип 1');
    });

    it('matches scientific references by persistent id rather than array order', () => {
        const base = createBaseContent();
        const localization: HippotherapyPageLocalization = {
            language: { id: 2, code: 'en' },
            translationStatus: 1 as any,
            scientificReferencesSection: {
                title: 'EN Sci',
                description: 'Desc',
                scientificReferences: [
                    { id: 20, name: 'EN Ref 20' }, // зворотний порядок
                    { id: 10, name: 'EN Ref 10' },
                ],
            },
        };

        const result = applyHippotherapyLocalization(base, localization);

        expect(result.scientificReferencesSection.scientificReferences[0].id).toBe(10);
        expect(result.scientificReferencesSection.scientificReferences[0].name).toBe('EN Ref 10');
        expect(result.scientificReferencesSection.scientificReferences[1].id).toBe(20);
        expect(result.scientificReferencesSection.scientificReferences[1].name).toBe('EN Ref 20');
    });
});
