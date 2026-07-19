import { render, screen } from '@testing-library/react';

import { PUBLIC_ROUTES } from '@/const/public/routes';
import { useDataFetch } from '@/hooks/common/use-data-fetch/useDataFetch';
import { useLocale } from '@/hooks/common/use-locale/useLocale';
import { TranslationStatus } from '@/types/common/language';
import { PublicMainPageDto, PublicMainPageLocalizationDto } from '@/types/public/main-page';

import { IntroSection } from './intro-section/IntroSection';
import { MainPage } from './MainPage';

const mockT = jest.fn((key: string) => {
    const translations: Record<string, string> = {
        'INTRO.TITLE': 'Коні з досвідом зцілення',
        'INTRO.DESCRIPTION': 'Коли тіло та душа відновлюються — народжується справжня сила.',
        'INTRO.BUTTON': 'Переглянути програми',
    };

    return translations[key] ?? key;
});

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: mockT,
    }),
}));

jest.mock('@/assets/images/group-riding-horses.webp', () => 'fallback-group-riding-horses.webp');

jest.mock('@/hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

jest.mock('./intro-section/IntroSection', () => ({
    IntroSection: jest.fn(({ introData, buttonHref }) => (
        <section data-testid="intro-section" data-button-href={buttonHref}>
            <h1>{introData.title}</h1>
            <p>{introData.description}</p>
            <img src={introData.image} alt="" />
            <a href={buttonHref}>{introData.buttonText}</a>
        </section>
    )),
}));

jest.mock('./main-programs-section/MainProgramsSection', () => ({
    MainProgramsSection: () => <div data-testid="main-programs-section" />,
}));

jest.mock('./main-statistics-section/MainStatisticsSection', () => ({
    MainStatisticsSection: () => <div data-testid="main-statistics-section" />,
}));

const mockedUseDataFetch = useDataFetch as jest.Mock;
const mockedUseLocale = useLocale as jest.Mock;
const MockedIntroSection = IntroSection as jest.Mock;

const createMainPageData = (overrides: Partial<PublicMainPageDto> = {}): PublicMainPageDto => ({
    id: 1,
    title: 'API title',
    description: 'API description',
    image: {
        id: 10,
        url: '/api-main-image.webp',
        mimeType: 'image/webp',
    },
    localizations: [],
    mainAboutUs: null,
    mainPartners: null,
    mainDonations: {
        id: 1,
        title: 'API donation title',
        description: 'API donation description',
        image: null,
    },
    impactStatistics: null,
    ...overrides,
});

const mockUseDataFetchResult = (data: PublicMainPageDto | null | undefined, isLoading = false) => {
    mockedUseDataFetch.mockReturnValue({
        data,
        isLoading,
    });
};

describe('MainPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockT.mockImplementation((key: string) => {
            const translations: Record<string, string> = {
                'INTRO.TITLE': 'Коні з досвідом зцілення',
                'INTRO.DESCRIPTION': 'Коли тіло та душа відновлюються — народжується справжня сила.',
                'INTRO.BUTTON': 'Переглянути програми',
            };

            return translations[key] ?? key;
        });
        mockedUseLocale.mockReturnValue({ currentLanguage: 'uk' });
        MockedIntroSection.mockImplementation(({ introData, buttonHref }) => (
            <section data-testid="intro-section" data-button-href={buttonHref}>
                <h1>{introData.title}</h1>
                <p>{introData.description}</p>
                <img src={introData.image} alt="" />
                <a href={buttonHref}>{introData.buttonText}</a>
            </section>
        ));
    });

    it('renders a loader while main page data is loading', () => {
        mockUseDataFetchResult(null, true);

        render(<MainPage />);

        expect(screen.getByRole('progressbar')).toBeInTheDocument();
        expect(MockedIntroSection).not.toHaveBeenCalled();
    });

    it('renders IntroSection with API data and programs route', () => {
        mockUseDataFetchResult(createMainPageData());

        render(<MainPage />);

        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                buttonHref: PUBLIC_ROUTES.PROGRAMS.FULL,
                introData: expect.objectContaining({
                    title: 'API title',
                    description: 'API description',
                    buttonText: 'Переглянути програми',
                    image: '/api-main-image.webp',
                }),
            }),
            undefined,
        );
    });

    it('uses current localization when it matches the active language', () => {
        mockUseDataFetchResult(
            createMainPageData({
                title: 'Fallback API title',
                description: 'Fallback API description',
                localizations: [
                    {
                        entityId: 1,
                        localizationInfoDto: { id: 2, code: 'en' },
                        translationStatus: TranslationStatus.Relevant,
                        title: 'English localized title',
                        description: 'English localized description',
                    },
                ],
            }),
        );
        mockedUseLocale.mockReturnValue({ currentLanguage: 'en' });

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    title: 'English localized title',
                    description: 'English localized description',
                }),
            }),
            undefined,
        );
    });

    it('falls back from blank localized fields to API fields', () => {
        mockUseDataFetchResult(
            createMainPageData({
                title: 'API title after blank localization',
                description: 'API description after blank localization',
                localizations: [
                    {
                        entityId: 1,
                        localizationInfoDto: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        title: '   ',
                        description: '',
                    },
                ],
            }),
        );

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    title: 'API title after blank localization',
                    description: 'API description after blank localization',
                }),
            }),
            undefined,
        );
    });

    it('skips null localized fields and keeps looking for filled text', () => {
        mockUseDataFetchResult(
            createMainPageData({
                title: 'API title after null localization',
                description: 'API description after null localization',
                localizations: [
                    {
                        entityId: 1,
                        localizationInfoDto: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        title: null,
                        description: null,
                    } as unknown as PublicMainPageLocalizationDto,
                ],
            }),
        );

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    title: 'API title after null localization',
                    description: 'API description after null localization',
                }),
            }),
            undefined,
        );
    });

    it('uses locale fallbacks and local fallback image when API data is null', () => {
        mockUseDataFetchResult(null);

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                buttonHref: PUBLIC_ROUTES.PROGRAMS.FULL,
                introData: expect.objectContaining({
                    title: 'Коні з досвідом зцілення',
                    description: 'Коли тіло та душа відновлюються — народжується справжня сила.',
                    buttonText: 'Переглянути програми',
                    image: 'fallback-group-riding-horses.webp',
                }),
            }),
            undefined,
        );
    });

    it('uses empty strings as the final text fallback if all text sources are empty', () => {
        mockT.mockImplementation(() => '');
        mockUseDataFetchResult(
            createMainPageData({
                title: '   ',
                description: '   ',
                localizations: [
                    {
                        entityId: 1,
                        localizationInfoDto: { id: 1, code: 'uk' },
                        translationStatus: TranslationStatus.Relevant,
                        title: '',
                        description: '',
                    },
                ],
            }),
        );

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    title: '',
                    description: '',
                    buttonText: '',
                }),
            }),
            undefined,
        );
    });

    it('uses locale fallbacks and local fallback image when API data is undefined', () => {
        mockUseDataFetchResult(undefined);

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    title: 'Коні з досвідом зцілення',
                    description: 'Коли тіло та душа відновлюються — народжується справжня сила.',
                    image: 'fallback-group-riding-horses.webp',
                }),
            }),
            undefined,
        );
    });

    it('handles empty object data without crashing and falls back to locale text', () => {
        mockUseDataFetchResult({} as PublicMainPageDto);

        render(<MainPage />);

        expect(screen.getByTestId('intro-section')).toBeInTheDocument();
        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    title: 'Коні з досвідом зцілення',
                    description: 'Коли тіло та душа відновлюються — народжується справжня сила.',
                    image: 'fallback-group-riding-horses.webp',
                }),
            }),
            undefined,
        );
    });

    it('handles partial data with base64 image and text fallbacks', () => {
        mockUseDataFetchResult(
            createMainPageData({
                title: undefined,
                description: 'Partial API description',
                image: {
                    base64: 'abc123',
                    mimeType: 'image/webp',
                },
            }),
        );

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    title: 'Коні з досвідом зцілення',
                    description: 'Partial API description',
                    image: 'data:image/webp;base64,abc123',
                }),
            }),
            undefined,
        );
    });

    it('adds cache busting query for backend image updatedAt values', () => {
        mockUseDataFetchResult(
            createMainPageData({
                image: {
                    id: 10,
                    url: '/api-main-image.webp',
                    mimeType: 'image/webp',
                    updatedAt: '2026-06-17T00:00:00.000Z',
                },
            }),
        );

        render(<MainPage />);

        expect(MockedIntroSection).toHaveBeenCalledWith(
            expect.objectContaining({
                introData: expect.objectContaining({
                    image: `/api-main-image.webp?v=${new Date('2026-06-17T00:00:00.000Z').getTime()}`,
                }),
            }),
            undefined,
        );
    });

    it('passes current language as a fetch dependency', () => {
        mockUseDataFetchResult(createMainPageData());
        mockedUseLocale.mockReturnValue({ currentLanguage: 'en' });

        render(<MainPage />);

        expect(mockedUseDataFetch).toHaveBeenCalledWith(
            expect.objectContaining({
                initialData: null,
                autoFetchDependencies: ['en'],
            }),
        );
    });
});
