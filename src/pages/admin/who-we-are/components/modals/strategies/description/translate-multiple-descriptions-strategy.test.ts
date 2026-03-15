import { ContentType, SectionType } from '@/types/common/about-us';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { WhoWeAreSection } from '@/types/admin/who-we-are';
import { getImageSrc } from '@/utils/functions/image-helper/image-helper';

import { translateMultipleDescriptionsStrategy } from './translate-multiple-descriptions-strategy';

jest.mock('../../forms/translate-multiple-descriptions-form/TranslateWhoWeAreMultipleDescriptionsForm', () => ({
    TranslateWhoWeAreMultipleDescriptionsForm: jest.fn(() => null),
}));

jest.mock('@/utils/functions/image-helper/image-helper', () => ({
    getImageSrc: jest.fn(() => 'mapped-image.jpg'),
}));

const mockedGetImageSrc = getImageSrc as jest.MockedFunction<typeof getImageSrc>;

const english: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };
const ukrainian: LocalizationLanguage = { id: 1, code: 'uk', name: 'Ukrainian' };

const buildSection = (sectionType: SectionType): WhoWeAreSection => ({
    id: 1,
    title: 'Cards Section',
    sectionType,
    contents: [
        {
            id: 10,
            contentType: ContentType.Card,
            title: null,
            description: null,
            image: { id: 1, url: 'card-1.jpg', mimeType: 'image/jpeg' },
            imageId: 1,
            localizations: [
                {
                    language: ukrainian,
                    translationStatus: TranslationStatus.Relevant,
                    title: null,
                    description: '<p>Опис картки 1</p>',
                },
                {
                    language: english,
                    translationStatus: TranslationStatus.Relevant,
                    title: null,
                    description: '<p>Card 1 description</p>',
                },
            ],
        },
        {
            id: 11,
            contentType: ContentType.Card,
            title: null,
            description: null,
            image: null,
            imageId: null,
            localizations: [
                {
                    language: english,
                    translationStatus: TranslationStatus.Relevant,
                    title: null,
                    description: '<p>Card 2 description</p>',
                },
            ],
        },
    ],
});

describe('translateMultipleDescriptionsStrategy', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockedGetImageSrc.mockReturnValue('mapped-image.jpg');
    });

    it('returns null when language is not provided', () => {
        const section = buildSection(SectionType.WhoWeSupport);

        const result = translateMultipleDescriptionsStrategy.getInitialData(section, null, true);

        expect(result).toBeNull();
    });

    it('returns row descriptions from localization in edit mode', () => {
        const section = buildSection(SectionType.WhoWeSupport);

        const result = translateMultipleDescriptionsStrategy.getInitialData(section, english, true);

        expect(mockedGetImageSrc).toHaveBeenCalledWith(section.contents[0].image);
        expect(result?.rows[0]).toEqual({
            contentId: 10,
            image: 'mapped-image.jpg',
            description: '<p>Card 1 description</p>',
        });
        expect(result?.rows[1].description).toBe('<p>Card 2 description</p>');
    });

    it('returns placeholder descriptions in add mode', () => {
        const section = buildSection(SectionType.People);

        const result = translateMultipleDescriptionsStrategy.getInitialData(section, english, false);

        expect(result?.rows[0].description).toBe('<p><br></p>');
        expect(result?.rows[1].description).toBe('<p><br></p>');
    });

    it('uses fallback image when content image is missing', () => {
        const section = buildSection(SectionType.WhoWeSupport);

        const result = translateMultipleDescriptionsStrategy.getInitialData(section, english, true);

        expect(result?.rows[1].image).toBeDefined();
        expect(result?.rows[1].image).not.toBe('');
    });
});
