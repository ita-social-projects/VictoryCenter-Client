import { TranslationStatus } from '@/types/common/language';
import { AboutUsContentLocalizableFields } from '@/types/public/about-us-page';

export const createRelevantAboutUsUkLocalization = (content: AboutUsContentLocalizableFields) => ({
    language: { id: 1, code: 'uk' },
    translationStatus: TranslationStatus.Relevant,
    ...content,
});

export const setupUseGetLocalizationAboutUsContentMock = (
    mockedUseGetLocalization: jest.Mock,
): void => {
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