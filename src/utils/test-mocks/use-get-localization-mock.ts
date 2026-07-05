import { TranslationStatus } from '@/types/common/language';
import { AboutUsContentLocalizableFields } from '@/types/public/about-us-page';
import { DEFAULT_UKRAINIAN_LANGUAGE_ID } from '@/const/common/locales';

export const createRelevantAboutUsUkLocalization = (content: AboutUsContentLocalizableFields) => ({
    language: { id: DEFAULT_UKRAINIAN_LANGUAGE_ID, code: 'uk' },
    translationStatus: TranslationStatus.Relevant,
    ...content,
});

export const setupUseGetLocalizationAboutUsContentMock = (mockedUseGetLocalization: jest.Mock): void => {
    mockedUseGetLocalization.mockImplementation(
        (localizations: AboutUsContentLocalizableFields[] | null | undefined, fallback) => {
            if (localizations && localizations.length > 0) {
                return {
                    description: localizations[0].description,
                    title: localizations[0].title,
                };
            }

            return fallback;
        },
    );
};
