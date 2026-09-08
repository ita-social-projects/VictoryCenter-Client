import { mapHippotherapyPageToAbout } from './hippotherapy';
import { HippotherapyPageContentDto } from '@/types/admin/hippotherapy-page';

const image = (url: string) => ({ id: 1, url, mimeType: 'image/png' });

const buildDto = (): HippotherapyPageContentDto => ({
    introSection: {
        title: '<h3>Intro title</h3>',
        description: '<p>Intro description</p>',
        image: image('https://example.com/intro.png'),
        imageId: 1,
    },
    descriptionSection: { title: 'Description title', description: '<p>Description text</p>' },
    quoteSection: {
        quoteText: 'Quote text',
        authorName: '<p>Author</p>',
        image: image('https://example.com/quote.png'),
        imageId: 2,
    },
    hippoventionSection: { title: 'Hippovention title', description: 'Hippovention text' },
    hippoventionCenterSection: {
        title: '<p>Center title</p>',
        description: '<p>Center text</p>',
        pros: 'First<br>Second<br />Third',
        image: image('https://example.com/center.png'),
        imageId: 3,
    },
    advantagesSection: {
        title: '<p>Advantages title</p>',
        cards: [{ description: '<p>Advantage one</p>', image: image('https://example.com/card.png'), imageId: 4 }],
    },
    analysisSection: { title: 'Analysis title', description: 'Analysis text' },
    scientificReferencesSection: {
        title: '<p>Research title</p>',
        description: '<p>Research description</p>',
        scientificReferences: [{ id: 1, name: 'Reference name', url: 'https://example.com/reference' }],
    },
    anotherQuoteSection: { quoteText: 'Another quote', authorName: '', image: null, imageId: null },
    participantsSection: {
        title: 'Participants title',
        cards: [{ description: 'Participant one', image: null, imageId: null }],
    },
    ethicsSection: {
        title: '<p>Ethics title</p>',
        description: '<p>Ethics text</p>',
        principles: ['<p>Principle one</p>', 'Principle two'],
        image: image('https://example.com/ethics.png'),
        imageId: 5,
    },
});

describe('mapHippotherapyPageToAbout', () => {
    it('takes the image url from the image object and falls back to an empty string', () => {
        const result = mapHippotherapyPageToAbout(buildDto());

        expect(result.introSection.imgURL).toBe('https://example.com/intro.png');
        expect(result.anotherQuoteSection.imgURL).toBe('');
    });

    it('keeps html in the sections that render it', () => {
        const result = mapHippotherapyPageToAbout(buildDto());

        expect(result.introSection.title).toBe('<h3>Intro title</h3>');
        expect(result.descriptionSection.text).toBe('<p>Description text</p>');
    });

    it('strips html in the sections that render plain text', () => {
        const result = mapHippotherapyPageToAbout(buildDto());

        expect(result.ethicsSection.title).toBe('Ethics title');
        expect(result.ethicsSection.principles).toEqual(['Principle one', 'Principle two']);
        expect(result.advantagesSection.advantages[0].text).toBe('Advantage one');
        expect(result.researchSection.description).toBe('Research description');
    });

    it('joins the quote with its author and leaves it alone when there is none', () => {
        const result = mapHippotherapyPageToAbout(buildDto());

        expect(result.quoteSection.text).toBe('Quote text<br /><br /><p>Author</p>');
        expect(result.anotherQuoteSection.text).toBe('Another quote');
    });

    it('splits pros into a list regardless of the br notation', () => {
        const result = mapHippotherapyPageToAbout(buildDto());

        expect(result.hippoventionCenterSection.pros).toEqual(['First', 'Second', 'Third']);
    });

    it('maps scientific references into researches', () => {
        const result = mapHippotherapyPageToAbout(buildDto());

        expect(result.researchSection.title).toBe('Research title');
        expect(result.researchSection.researches).toEqual([
            { text: 'Reference name', url: 'https://example.com/reference' },
        ]);
    });
});
