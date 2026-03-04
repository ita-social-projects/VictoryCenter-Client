type LocalizedContent = {
    description?: string | null;
    title?: string | null;
};

export const setupUseGetLocalizationTitleDescriptionMock = (mockedUseGetLocalization: jest.Mock): void => {
    mockedUseGetLocalization.mockImplementation((localizations: LocalizedContent[] | null | undefined, fallback) => {
        if (localizations && localizations.length > 0) {
            return {
                description: localizations[0].description,
                title: localizations[0].title,
            };
        }

        return fallback;
    });
};