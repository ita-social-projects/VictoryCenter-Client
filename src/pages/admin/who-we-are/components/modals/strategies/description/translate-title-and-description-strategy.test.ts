import { ContentType, SectionType } from '@/types/common/about-us';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { WhoWeAreSection } from '@/types/admin/who-we-are';

jest.mock('../../forms/translate-title-and-description-form/TranslateWhoWeAreTitleAndDescriptionForm', () => ({
    TranslateWhoWeAreTitleAndDescriptionForm: jest.fn(() => null),
}));

import { translateTitleAndDescriptionStrategy } from './translate-title-and-description-strategy';

const english: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };
const ukrainian: LocalizationLanguage = { id: 1, code: 'uk', name: 'Ukrainian' };

const section: WhoWeAreSection = {
    id: 1,
    title: 'Main',
    sectionType: SectionType.Main,
    contents: [
        {
            id: 10,
            contentType: ContentType.Description,
            title: null,
            description: null,
            image: null,
            imageId: null,
            localizations: [
                {
                    language: ukrainian,
                    translationStatus: TranslationStatus.Relevant,
                    title: '<p>Заголовок</p>',
                    description: '<p>Опис українською</p>',
                },
                {
                    language: english,
                    translationStatus: TranslationStatus.Relevant,
                    title: '<p>Title</p>',
                    description: '<p>Description in English</p>',
                },
            ],
        },
    ],
};

describe('translateTitleAndDescriptionStrategy', () => {
    it('returns null when mode is add', () => {
        const result = translateTitleAndDescriptionStrategy.getInitialData(section, english, false);

        expect(result).toBeNull();
    });

    it('returns null when language is not provided', () => {
        const result = translateTitleAndDescriptionStrategy.getInitialData(section, null, true);

        expect(result).toBeNull();
    });

    it('returns localized title and description when mode is edit', () => {
        const result = translateTitleAndDescriptionStrategy.getInitialData(section, english, true);

        expect(result).toEqual({
            title: '<p>Title</p>',
            description: '<p>Description in English</p>',
        });
    });

    it('returns empty values when localization for language does not exist', () => {
        const germanLanguage: LocalizationLanguage = { id: 3, code: 'de', name: 'German' };

        const result = translateTitleAndDescriptionStrategy.getInitialData(section, germanLanguage, true);

        expect(result).toEqual({
            title: '',
            description: '',
        });
    });
});
