import { mapHippotherapyPageToAbout } from './hippotherapy';
import { HippotherapyPageContentDto } from '@/types/admin/hippotherapy-page';

const withImage = (name: string) => ({
    image: { id: 1, url: `https://example.com/${name}.png`, mimeType: 'image/png' },
    imageId: 1,
});

const noImage = { image: null, imageId: null };

const buildDto = (): HippotherapyPageContentDto => ({
    introSection: { title: '<h3>Intro title</h3>', description: '<p>Intro description</p>', ...withImage('intro') },
    descriptionSection: { title: 'Description title', description: '<p>Description text</p>' },
    quoteSection: { quoteText: 'Quote text', authorName: '<p>Author</p>', ...withImage('quote') },
    hippoventionSection: { title: 'Hippovention title', description: 'Hippovention text' },
    hippoventionCenterSection: {
        title: '<p>Center title</p>',
        description: '<p>Center text</p>',
        pros: 'First<br>Second<br />Third',
        ...withImage('center'),
    },
    advantagesSection: {
        title: '<p>Advantages title</p>',
        cards: [{ description: '<p>Advantage one</p>', ...withImage('card') }],
    },
    analysisSection: { title: 'Analysis title', description: 'Analysis text' },
    scientificReferencesSection: {
        title: '<p>Research title</p>',
        description: '<p>Research description</p>',
        scientificReferences: [{ id: 1, name: 'Reference name', url: 'https://example.com/reference' }],
    },
    anotherQuoteSection: { quoteText: 'Another quote', authorName: '', ...noImage },
    participantsSection: { title: 'Participants title', cards: [{ description: 'Participant one', ...noImage }] },
    ethicsSection: {
        title: '<p>Ethics title</p>',
        description: '<p>Ethics text</p>',
        principles: ['<p>Principle one</p>', 'Principle two'],
        ...withImage('ethics'),
    },
});

describe('mapHippotherapyPageToAbout', () => {
    const result = mapHippotherapyPageToAbout(buildDto());

    it('takes the image url from the image object and falls back to an empty string', () => {
        expect(result.introSection.imgURL).toBe('https://example.com/intro.png');
        expect(result.anotherQuoteSection.imgURL).toBe('');
    });

    it('keeps html in the sections that render it', () => {
        expect(result.introSection.title).toBe('<h3>Intro title</h3>');
        expect(result.descriptionSection.text).toBe('<p>Description text</p>');
    });

    it('strips html in the sections that render plain text', () => {
        expect(result.ethicsSection.title).toBe('Ethics title');
        expect(result.ethicsSection.principles).toEqual(['Principle one', 'Principle two']);
        expect(result.advantagesSection.advantages[0].text).toBe('Advantage one');
        expect(result.researchSection.description).toBe('Research description');
    });

    it('joins the quote with its author and leaves it alone when there is none', () => {
        expect(result.quoteSection.text).toBe('Quote text<br /><br /><p>Author</p>');
        expect(result.anotherQuoteSection.text).toBe('Another quote');
    });

    it('splits pros into a list regardless of the br notation', () => {
        expect(result.hippoventionCenterSection.pros).toEqual(['First', 'Second', 'Third']);
    });

    it('maps scientific references into researches', () => {
        expect(result.researchSection.title).toBe('Research title');
        expect(result.researchSection.researches).toEqual([
            { text: 'Reference name', url: 'https://example.com/reference' },
        ]);
    });

    it('ignores an author that only contains empty html', () => {
        const dto = buildDto();
        dto.quoteSection.authorName = '<p><br></p>';

        expect(mapHippotherapyPageToAbout(dto).quoteSection.text).toBe('Quote text');
    });
});
