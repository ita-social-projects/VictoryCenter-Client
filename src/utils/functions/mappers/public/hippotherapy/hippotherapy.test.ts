import { mapHippotherapyPageToAbout } from './hippotherapy';
import { HippotherapyPageContentDto } from '@/types/admin/hippotherapy-page';

const withImage = (name: string) => ({
    image: { id: 1, url: `https://example.com/${name}.png`, mimeType: 'image/png' },
    imageId: 1,
});

const noImage = { image: null, imageId: null };

const buildDto = (): HippotherapyPageContentDto => ({
    localizations: [],
    translationStatuses: [],
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
        cards: [
            { id: 10, description: '<p>Advantage one</p>', ...withImage('card1') } as any,
            { id: 20, description: '<p>Advantage two</p>', ...withImage('card2') } as any,
        ],
    },
    analysisSection: { title: 'Analysis title', description: 'Analysis text' },
    scientificReferencesSection: {
        title: '<p>Research title</p>',
        description: '<p>Research description</p>',
        scientificReferences: [
            { id: 100, name: 'Reference one', url: 'https://example.com/ref1' },
            { id: 200, name: 'Reference two', url: 'https://example.com/ref2' },
        ],
    },
    anotherQuoteSection: { quoteText: 'Another quote', authorName: '', ...noImage },
    participantsSection: {
        title: 'Participants title',
        cards: [{ id: 30, description: 'Participant one', ...noImage } as any],
    },
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

    it('adds the image version so a replaced image is not served from the browser cache', () => {
        const updatedAt = '2025-01-01T00:00:00Z';
        const dto = buildDto();
        dto.introSection.image = { ...withImage('intro').image, updatedAt };

        expect(mapHippotherapyPageToAbout(dto).introSection.imgURL).toBe(
            `https://example.com/intro.png?v=${new Date(updatedAt).getTime()}`,
        );
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
            { text: 'Reference one', url: 'https://example.com/ref1' },
            { text: 'Reference two', url: 'https://example.com/ref2' },
        ]);
    });

    it('ignores an author that only contains empty html', () => {
        const dto = buildDto();
        dto.quoteSection.authorName = '<p><br></p>';

        expect(mapHippotherapyPageToAbout(dto).quoteSection.text).toBe('Quote text');
    });

    describe('Localization support', () => {
        const englishLocalization = {
            localizationInfoDto: { id: 2, code: 'en', name: 'English' },
            introSection: { title: '<h3>EN Intro</h3>', description: '<p>EN Intro desc</p>' },
            descriptionSection: { title: 'EN Desc title', description: '<p>EN Desc text</p>' },
            quoteSection: { quoteText: 'EN Quote text', authorName: 'EN Author' },
            hippoventionSection: { title: 'EN Hippovention title', description: 'EN Hippovention text' },
            hippoventionCenterSection: {
                title: '<p>EN Center title</p>',
                description: '<p>EN Center text</p>',
                pros: 'EN First<br>EN Second',
            },
            advantagesSection: {
                title: 'EN Advantages title',
                cards: [
                    { cardId: 10, description: 'EN Advantage one' },
                    { cardId: 20, description: 'EN Advantage two' },
                ],
            },
            analysisSection: { title: 'EN Analysis title', description: 'EN Analysis text' },
            scientificReferencesSection: {
                title: 'EN Research title',
                description: 'EN Research description',
                references: [
                    { referenceId: 100, name: 'EN Reference one' },
                    { referenceId: 200, name: 'EN Reference two' },
                ],
            },
            anotherQuoteSection: { quoteText: 'EN Another quote', authorName: 'EN Another author' },
            participantsSection: {
                title: 'EN Participants title',
                cards: [{ cardId: 30, description: 'EN Participant one' }],
            },
            ethicsSection: {
                title: 'EN Ethics title',
                description: 'EN Ethics text',
                principles: [
                    { principleId: 1, text: 'EN Principle one' },
                    { principleId: 2, text: 'EN Principle two' },
                ],
            },
        };

        it('returns Ukrainian original when language is uk even if English localization exists', () => {
            const dto = buildDto();
            dto.localizations = [englishLocalization as any];

            const localized = mapHippotherapyPageToAbout(dto, 'uk');

            expect(localized.introSection.title).toBe('<h3>Intro title</h3>');
            expect(localized.ethicsSection.title).toBe('Ethics title');
        });

        it('maps all 11 sections to English when language is en and full localization is present', () => {
            const dto = buildDto();
            dto.localizations = [englishLocalization as any];

            const localized = mapHippotherapyPageToAbout(dto, 'en');

            expect(localized.introSection.title).toBe('<h3>EN Intro</h3>');
            expect(localized.introSection.description).toBe('<p>EN Intro desc</p>');
            expect(localized.descriptionSection.title).toBe('EN Desc title');
            expect(localized.descriptionSection.text).toBe('<p>EN Desc text</p>');
            expect(localized.quoteSection.text).toBe('EN Quote text<br /><br />EN Author');
            expect(localized.hippoventionSection.title).toBe('EN Hippovention title');
            expect(localized.hippoventionSection.text).toBe('EN Hippovention text');
            expect(localized.hippoventionCenterSection.title).toBe('EN Center title');
            expect(localized.hippoventionCenterSection.text).toBe('EN Center text');
            expect(localized.hippoventionCenterSection.pros).toEqual(['EN First', 'EN Second']);
            expect(localized.advantagesSection.title).toBe('EN Advantages title');
            expect(localized.advantagesSection.advantages[0].text).toBe('EN Advantage one');
            expect(localized.advantagesSection.advantages[1].text).toBe('EN Advantage two');
            expect(localized.analysisSection.title).toBe('EN Analysis title');
            expect(localized.analysisSection.text).toBe('EN Analysis text');
            expect(localized.researchSection.title).toBe('EN Research title');
            expect(localized.researchSection.description).toBe('EN Research description');
            expect(localized.researchSection.researches[0].text).toBe('EN Reference one');
            expect(localized.anotherQuoteSection.text).toBe('EN Another quote<br /><br />EN Another author');
            expect(localized.participantsSection.title).toBe('EN Participants title');
            expect(localized.participantsSection.participants[0].text).toBe('EN Participant one');
            expect(localized.ethicsSection.title).toBe('EN Ethics title');
            expect(localized.ethicsSection.text).toBe('EN Ethics text');
            expect(localized.ethicsSection.principles).toEqual(['EN Principle one', 'EN Principle two']);
        });

        it('falls back to Ukrainian when English translation is missing', () => {
            const dto = buildDto();
            dto.localizations = [];

            const localized = mapHippotherapyPageToAbout(dto, 'en');

            expect(localized.introSection.title).toBe('<h3>Intro title</h3>');
            expect(localized.ethicsSection.principles).toEqual(['Principle one', 'Principle two']);
        });

        it('partially falls back to Ukrainian when specific localized fields are empty or whitespace', () => {
            const dto = buildDto();
            dto.localizations = [
                {
                    localizationInfoDto: { code: 'en' },
                    introSection: { title: 'EN Intro only', description: '   ' },
                    ethicsSection: {
                        title: '',
                        description: 'EN Ethics desc only',
                        principles: [
                            { principleId: 1, text: 'EN Principle 1' },
                            { principleId: 2, text: '' },
                        ],
                    },
                    advantagesSection: {
                        cards: [
                            { cardId: 10, description: 'EN Card 1' },
                            { cardId: 20, description: '' },
                        ],
                    },
                } as any,
            ];

            const localized = mapHippotherapyPageToAbout(dto, 'en');

            expect(localized.introSection.title).toBe('EN Intro only');
            expect(localized.introSection.description).toBe('<p>Intro description</p>');
            expect(localized.ethicsSection.title).toBe('Ethics title');
            expect(localized.ethicsSection.text).toBe('EN Ethics desc only');
            expect(localized.ethicsSection.principles).toEqual(['EN Principle 1', 'Principle two']);
            expect(localized.advantagesSection.advantages[0].text).toBe('EN Card 1');
            expect(localized.advantagesSection.advantages[1].text).toBe('Advantage two');
        });
    });
});
