import { render, screen } from '@testing-library/react';
import { AboutUsSection } from './AboutUsSection';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { PublicMainAboutUsDto, PublicMainPageLocalizationDto } from '@/types/public/main-page';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

jest.mock('./AboutUsSection.module.scss', () => ({
    root: 'root',
    'description-content': 'description-content',
    title: 'title',
    description: 'description',
}));

const translations: Record<string, string> = {
    LINK_TO_MORE: 'Get to know more',
};

const mockT = jest.fn((key: string) => translations[key] ?? key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

const mockedUseLocale = useLocale as jest.Mock;

const createLocalization = (overrides: Partial<PublicMainPageLocalizationDto> = {}): PublicMainPageLocalizationDto => ({
    entityId: 1,
    localizationInfoDto: { id: 2, code: 'en' },
    translationStatus: 'Relevant' as never,
    ...overrides,
});

const createAboutUs = (overrides: Partial<PublicMainAboutUsDto> = {}): PublicMainAboutUsDto => ({
    id: 1,
    title: 'Про нас',
    description: 'Опис про нас',
    ...overrides,
});

describe('AboutUsSection', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockT.mockImplementation((key: string) => translations[key] ?? key);
        mockedUseLocale.mockReturnValue({ currentLanguage: 'uk' });
    });

    it('renders the title as a level 2 heading and the description as a paragraph', () => {
        const { container } = render(<AboutUsSection mainAboutUs={createAboutUs()} />);

        expect(screen.getByRole('heading', { level: 2, name: 'Про нас' })).toBeInTheDocument();

        const description = screen.getByText('Опис про нас');
        expect(description.tagName).toBe('P');
        expect(container.querySelector('section')).toBeInTheDocument();
    });

    it('does not render the title when it is missing', () => {
        render(<AboutUsSection mainAboutUs={createAboutUs({ title: undefined })} />);

        expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
        expect(screen.getByText('Опис про нас')).toBeInTheDocument();
    });

    it('does not render the description when it is missing', () => {
        const { container } = render(<AboutUsSection mainAboutUs={createAboutUs({ description: undefined })} />);

        expect(container.querySelector('p')).not.toBeInTheDocument();
        expect(screen.getByRole('heading', { level: 2, name: 'Про нас' })).toBeInTheDocument();
    });

    it('does not render the title or description when they are empty strings', () => {
        const { container } = render(<AboutUsSection mainAboutUs={createAboutUs({ title: '', description: '' })} />);

        expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
        expect(container.querySelector('p')).not.toBeInTheDocument();
    });

    it('renders nothing but the button when neither localization nor base values exist', () => {
        const { container } = render(
            <AboutUsSection
                mainAboutUs={createAboutUs({
                    title: undefined,
                    description: undefined,
                    localizations: [createLocalization()],
                })}
            />,
        );

        expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
        expect(container.querySelector('p')).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Get to know more' })).toBeInTheDocument();
    });

    it('opens the about us page in a new tab and keeps the current page intact', () => {
        render(<AboutUsSection mainAboutUs={createAboutUs()} />);

        const link = screen.getByRole('link', { name: 'Get to know more' });
        expect(link).toHaveAttribute('href', PUBLIC_ROUTES.ABOUT_US.FULL);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
});
