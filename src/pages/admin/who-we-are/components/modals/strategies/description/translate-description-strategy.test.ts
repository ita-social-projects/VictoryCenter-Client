import { ContentType, SectionType } from '@/types/common/about-us';
import { LocalizationLanguage, TranslationStatus } from '@/types/common/language';
import { WhoWeAreSection } from '@/types/admin/who-we-are';

jest.mock('../../forms/translate-description-form/TranslateWhoWeAreDescriptionForm', () => ({
    TranslateWhoWeAreDescriptionForm: jest.fn(() => null),
}));

import { translateDescriptionStrategy } from './translate-description-strategy';

const english: LocalizationLanguage = { id: 2, code: 'en', name: 'English' };
const ukrainian: LocalizationLanguage = { id: 1, code: 'uk', name: 'Ukrainian' };

const section: WhoWeAreSection = {
    id: 1,
    title: 'What we do',
    sectionType: SectionType.WhatWeDo,
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
                    title: null,
                    description: '<p>Опис українською</p>',
                },
                {
                    language: english,
                    translationStatus: TranslationStatus.Relevant,
                    title: null,
                    description: '<p>Description in English</p>',
                },
            ],
        },
    ],
};

describe('translateDescriptionStrategy', () => {
    it('returns null when mode is add', () => {
        const result = translateDescriptionStrategy.getInitialData(section, english, false);

        expect(result).toBeNull();
    });

    it('returns null when language is not provided', () => {
        const result = translateDescriptionStrategy.getInitialData(section, null, true);

        expect(result).toBeNull();
    });

    it('returns localized description when mode is edit', () => {
        const result = translateDescriptionStrategy.getInitialData(section, english, true);

        expect(result).toEqual({
            description: '<p>Description in English</p>',
        });
    });

    it('returns empty description when localization for language does not exist', () => {
        const germanLanguage: LocalizationLanguage = { id: 3, code: 'de', name: 'German' };

        const result = translateDescriptionStrategy.getInitialData(section, germanLanguage, true);

        expect(result).toEqual({
            description: '',
        });
    });
});
