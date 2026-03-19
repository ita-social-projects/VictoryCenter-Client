import { ContentType, SectionType } from '@/types/common/about-us';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { WhoWeAreSection } from '@/types/admin/who-we-are';

import { translateTitleAndDescriptionStrategy } from './translate-title-and-description-strategy';

jest.mock('../../forms/translate-title-and-description-form/TranslateWhoWeAreTitleAndDescriptionForm', () => ({
    TranslateWhoWeAreTitleAndDescriptionForm: jest.fn(() => null),
}));

const english: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };
const ukrainian: LocalizationLanguage = { id: 1, code: 'uk', name: 'Ukrainian' };

type SectionLocalization = NonNullable<WhoWeAreSection['contents'][number]['localizations']>[number];

const titleLocalizations: SectionLocalization[] = [
    {
        language: ukrainian,
        translationStatus: TranslationStatus.Relevant,
        title: '<p>Заголовок</p>',
        description: null,
    },
    {
        language: english,
        translationStatus: TranslationStatus.Relevant,
        title: '<p>Title</p>',
        description: null,
    },
];

const descriptionLocalizations: SectionLocalization[] = [
    {
        language: ukrainian,
        translationStatus: TranslationStatus.Relevant,
        title: null,
        description: '<p>Опис українською</p>',
    },
    {
        language: english,
        translationStatus: TranslationStatus.Relevant,
        title: null,
        description: '<p>Description in English</p>',
    },
];

const createContent = (
    id: number,
    contentType: ContentType,
    localizations: SectionLocalization[] = descriptionLocalizations,
) => ({
    id,
    contentType,
    title: null,
    description: null,
    image: null,
    imageId: null,
    localizations,
});

const buildSection = (contents: WhoWeAreSection['contents']): WhoWeAreSection => ({
    id: 1,
    title: 'Main',
    sectionType: SectionType.Main,
    contents,
});

describe('translateTitleAndDescriptionStrategy', () => {
    it('returns null when mode is add', () => {
        const section = buildSection([
            createContent(10, ContentType.Title, titleLocalizations),
            createContent(11, ContentType.Description, descriptionLocalizations),
        ]);

        const result = translateTitleAndDescriptionStrategy.getInitialData(section, english, false);

        expect(result).toBeNull();
    });

    it('returns null when language is not provided', () => {
        const section = buildSection([
            createContent(10, ContentType.Title, titleLocalizations),
            createContent(11, ContentType.Description, descriptionLocalizations),
        ]);

        const result = translateTitleAndDescriptionStrategy.getInitialData(section, null, true);

        expect(result).toBeNull();
    });

    it('returns localized title and description when mode is edit', () => {
        const section = buildSection([
            createContent(10, ContentType.Title, titleLocalizations),
            createContent(11, ContentType.Description, descriptionLocalizations),
        ]);

        const result = translateTitleAndDescriptionStrategy.getInitialData(section, english, true);

        expect(result).toEqual({
            title: '<p>Title</p>',
            description: '<p>Description in English</p>',
        });
    });

    it('returns empty values when localization for language does not exist', () => {
        const germanLanguage: LocalizationLanguage = { id: 3, code: 'de', name: 'German' };
        const section = buildSection([
            createContent(10, ContentType.Title, titleLocalizations),
            createContent(11, ContentType.Description, descriptionLocalizations),
        ]);

        const result = translateTitleAndDescriptionStrategy.getInitialData(section, germanLanguage, true);

        expect(result).toEqual({
            title: '',
            description: '',
        });
    });

    it('returns empty title when title content is missing', () => {
        const section = buildSection([
            createContent(11, ContentType.Description, descriptionLocalizations),
        ]);

        const result = translateTitleAndDescriptionStrategy.getInitialData(section, english, true);

        expect(result).toEqual({
            title: '',
            description: '<p>Description in English</p>',
        });
    });

    it('returns empty description when description content is missing', () => {
        const section = buildSection([
            createContent(10, ContentType.Title, titleLocalizations),
        ]);

        const result = translateTitleAndDescriptionStrategy.getInitialData(section, english, true);

        expect(result).toEqual({
            title: '<p>Title</p>',
            description: '',
        });
    });
});
