import { render, screen } from '@testing-library/react';
import { DonationSection } from './DonationSection';
import { PUBLIC_ROUTES } from '@/const/public/routes';
import { MainDonationDto } from '@/types/public/main-page';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

jest.mock('@/assets/videos/quote-background.webm', () => 'mocked-video.webm');

jest.mock('./DonationSection.module.scss', () => ({
    'donation-section': 'donation-section',
    'video-background-container': 'video-background-container',
    backgroundImage: 'backgroundImage',
    backgroundVideo: 'backgroundVideo',
    overlay: 'overlay',
    heading: 'heading',
    title: 'title',
    description: 'description',
    donation: 'donation',
    button: 'button',
}));

const translations: Record<string, string> = {
    VIEW: 'View more',
};

const mockT = jest.fn((key: string) => translations[key] ?? key);

jest.mock('react-i18next', () => ({
    useTranslation: () => ({ t: mockT }),
}));

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

jest.mock('../../../public/donate-page/donate-section/DonateSection', () => ({
    DonateSection: () => <div data-testid="donate-section-mock" />,
}));

const mockedUseLocale = useLocale as jest.Mock;

const createDonationData = (overrides: Partial<MainDonationDto> = {}): MainDonationDto => ({
    id: 1,
    title: 'Donation title',
    description: 'Donation description',
    image: null,
    ...overrides,
});

describe('DonationSection', () => {
    beforeEach(() => {
        mockT.mockImplementation((key: string) => translations[key] ?? key);
        mockedUseLocale.mockReturnValue({ currentLanguage: 'uk' });
    });

    it('renders background video when no image is provided', () => {
        const { container } = render(<DonationSection donationData={createDonationData({ image: null })} />);

        const video = container.querySelector('video');
        const source = container.querySelector('source');
        expect(video).toBeInTheDocument();
        expect(source).toHaveAttribute('src', 'mocked-video.webm');
        expect(source).toHaveAttribute('type', 'video/webm');
        expect(screen.queryByAltText('Donation Background')).not.toBeInTheDocument();
    });

    it('renders background image when donationData has an image', () => {
        const { container } = render(
            <DonationSection
                donationData={createDonationData({
                    image: { id: 1, url: '/uploaded-image.webp', mimeType: 'image/webp' },
                })}
            />,
        );

        const image = screen.getByAltText('Donation Background');
        expect(image).toHaveAttribute('src', '/uploaded-image.webp');
        expect(container.querySelector('video')).not.toBeInTheDocument();
    });

    it('renders title and description when provided', () => {
        render(
            <DonationSection
                donationData={createDonationData({ title: 'Support us', description: 'Every hryvnia helps' })}
            />,
        );

        expect(screen.getByRole('heading', { level: 2, name: 'Support us' })).toBeInTheDocument();
        expect(screen.getByText('Every hryvnia helps')).toBeInTheDocument();
    });

    it('does not render title or description when they are missing', () => {
        render(<DonationSection donationData={createDonationData({ title: undefined, description: undefined })} />);

        expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
    });

    it('renders the DonateSection and the view button with translated text and correct link', () => {
        render(<DonationSection donationData={createDonationData()} />);

        expect(screen.getByTestId('donate-section-mock')).toBeInTheDocument();

        const link = screen.getByRole('link', { name: 'View more' });
        expect(link).toHaveAttribute('href', PUBLIC_ROUTES.DONATE.FULL);
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    it('handles null donationData without crashing and falls back to the video background', () => {
        const { container } = render(<DonationSection donationData={null} />);

        expect(container.querySelector('video')).toBeInTheDocument();
        expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
        expect(screen.getByTestId('donate-section-mock')).toBeInTheDocument();
    });

    it('handles undefined donationData without crashing', () => {
        render(<DonationSection donationData={undefined} />);

        expect(screen.queryByRole('heading', { level: 2 })).not.toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'View more' })).toBeInTheDocument();
    });

    it('renders localized title and description when a localization matches the current language', () => {
        mockedUseLocale.mockReturnValue({ currentLanguage: 'en' });

        render(
            <DonationSection
                donationData={createDonationData({
                    title: 'Донат заголовок',
                    description: 'Опис донату',
                    localizations: [
                        {
                            entityId: 1,
                            localizationInfoDto: { id: 2, code: 'en' },
                            translationStatus: 'Relevant' as any,
                            title: 'Donation title (en)',
                            description: 'Donation description (en)',
                        },
                    ],
                })}
            />,
        );

        expect(screen.getByRole('heading', { level: 2, name: 'Donation title (en)' })).toBeInTheDocument();
        expect(screen.getByText('Donation description (en)')).toBeInTheDocument();
        expect(screen.queryByText('Донат заголовок')).not.toBeInTheDocument();
        expect(screen.queryByText('Опис донату')).not.toBeInTheDocument();
    });

    it('falls back to base title and description when no localization matches the current language', () => {
        mockedUseLocale.mockReturnValue({ currentLanguage: 'en' });

        render(
            <DonationSection
                donationData={createDonationData({
                    title: 'Base title',
                    description: 'Base description',
                    localizations: [
                        {
                            entityId: 1,
                            localizationInfoDto: { id: 1, code: 'uk' },
                            translationStatus: 'Relevant' as any,
                            title: 'Заголовок',
                            description: 'Опис',
                        },
                    ],
                })}
            />,
        );

        expect(screen.getByRole('heading', { level: 2, name: 'Base title' })).toBeInTheDocument();
        expect(screen.getByText('Base description')).toBeInTheDocument();
    });
});
