import { HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS, isHippotherapyPageContentValid } from './HippotherapyPageSchema';
import { HippotherapyPageContentModel } from '@/types/admin/hippotherapy-page';

const buildValidContent = (): HippotherapyPageContentModel => ({
    introSection: { title: 'Valid title text', description: 'Valid description text', image: null, imageId: 1 },
    descriptionSection: { title: 'Valid title text', description: 'Valid description text' },
    quoteSection: { quoteText: 'Valid quote text', authorName: 'Valid author', image: null, imageId: 2 },
    hippoventionSection: { title: 'Valid title text', description: 'Valid description text' },
    hippoventionCenterSection: {
        title: 'Valid title text',
        description: 'Valid description text',
        pros: 'Valid pro one and pro two',
        image: null,
        imageId: 3,
    },
    advantagesSection: {
        title: 'Valid title text',
        cards: [{ description: 'Valid card description', image: null, imageId: 4 }],
    },
    analysisSection: { title: 'Valid title text', description: 'Valid description text' },
    scientificReferencesSection: {
        title: 'Valid title text',
        description: 'Valid description text',
        scientificReferences: [
            { localId: 'local-1', id: 1, name: 'Valid research citation', url: 'https://example.com/citation' },
        ],
    },
    anotherQuoteSection: { quoteText: 'Valid quote text', authorName: 'Valid author', image: null, imageId: 5 },
    participantsSection: {
        title: 'Valid title text',
        cards: [{ description: 'Valid card description', image: null, imageId: 6 }],
    },
    ethicsSection: {
        title: 'Valid title text',
        description: 'Valid description text',
        principles: ['Valid principle one'],
        image: null,
        imageId: 7,
    },
});

describe('HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText', () => {
    it('returns undefined for text meeting the minimum length', () => {
        expect(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText('A sufficiently long value')).toBeUndefined();
    });

    it('returns an error message for empty text', () => {
        expect(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText('')).toBeDefined();
    });

    it('returns an error message for null text', () => {
        expect(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText(null)).toBeDefined();
    });

    it('returns an error message for text shorter than the minimum length', () => {
        expect(HIPPOTHERAPY_PAGE_VALIDATION_FUNCTIONS.validateText('short')).toBeDefined();
    });
});

describe('isHippotherapyPageContentValid', () => {
    it('returns true when every required field is valid', () => {
        expect(isHippotherapyPageContentValid(buildValidContent())).toBe(true);
    });

    it('returns false when the intro title is too short', () => {
        const content = buildValidContent();
        content.introSection.title = 'x';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when a quote author name is empty', () => {
        const content = buildValidContent();
        content.anotherQuoteSection.authorName = '';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when a field is short visible text padded with HTML markup', () => {
        const content = buildValidContent();
        content.introSection.title = '<p>Hipp</p>';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when the hippovention center pros text is invalid', () => {
        const content = buildValidContent();
        content.hippoventionCenterSection.pros = '';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when a gallery card description is invalid', () => {
        const content = buildValidContent();
        content.advantagesSection.cards[0].description = '';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when a research citation name is invalid', () => {
        const content = buildValidContent();
        content.scientificReferencesSection.scientificReferences[0].name = '';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when a research citation url is invalid', () => {
        const content = buildValidContent();
        content.scientificReferencesSection.scientificReferences[0].url = '';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when an ethics principle is invalid', () => {
        const content = buildValidContent();
        content.ethicsSection.principles = [''];

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when a section image is missing (no image and no imageId)', () => {
        const content = buildValidContent();
        content.introSection.image = null;
        content.introSection.imageId = null;

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('returns false when a gallery card image is missing', () => {
        const content = buildValidContent();
        content.advantagesSection.cards[0].image = null;
        content.advantagesSection.cards[0].imageId = null;

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('treats a newly uploaded (not yet saved) image as present even without an imageId', () => {
        const content = buildValidContent();
        content.introSection.image = { base64: 'data:image/png;base64,abc', width: 1440, height: 800 } as any;
        content.introSection.imageId = null;

        expect(isHippotherapyPageContentValid(content)).toBe(true);
    });

    it('accepts a title with 5 visible characters', () => {
        const content = buildValidContent();
        content.introSection.title = 'Hippo';

        expect(isHippotherapyPageContentValid(content)).toBe(true);
    });

    it('rejects a description shorter than 10 characters', () => {
        const content = buildValidContent();
        content.introSection.description = 'Short';

        expect(isHippotherapyPageContentValid(content)).toBe(false);
    });

    it('accepts an empty additional description in the hippovention center section', () => {
        const content = buildValidContent();
        content.hippoventionCenterSection.description = '';

        expect(isHippotherapyPageContentValid(content)).toBe(true);
    });
});
