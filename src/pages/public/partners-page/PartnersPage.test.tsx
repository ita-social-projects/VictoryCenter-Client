import { render, screen, waitFor } from '@testing-library/react';
import { PartnersPage } from './PartnersPage';
import { PartnersApi } from '@/services/api/public/partners/partners-api';
import { PartnerPage } from '@/types/public/partners-page';
import { DOWNLOAD_ERROR } from '@/const/public/partners-page';

jest.mock('@/services/api/public/partners/partners-api');

jest.mock('./partners-sections/intro-section/IntroSection', () => ({
    IntroSection: () => <div data-testid="intro-section" />,
}));

jest.mock('./partners-sections/partners-section/PartnersSection', () => ({
    PartnersSection: ({ section }: { section: any }) => <div data-testid={`partners-section-${section.id}`} />,
}));

jest.mock('@mui/material', () => ({
    LinearProgress: () => <div data-testid="loader" />,
}));

jest.mock('@/components/public/cta', () => ({
    CtaSection: () => <div data-testid="cta-section" />,
}));

const mockedPartnersApi = PartnersApi as jest.Mocked<typeof PartnersApi>;

describe('PartnersPage', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows loader while fetching', () => {
        mockedPartnersApi.getPage.mockReturnValue(new Promise(() => {}));
        render(<PartnersPage />);
        expect(screen.getByTestId('loader')).toBeInTheDocument();
    });

    it('renders content on success', async () => {
        const mockPageData: PartnerPage = {
            banner: {
                title: 'Test banner',
                description: 'Test description',
                image: { id: 1, url: 'https://example.com/horse.jpg', mimeType: 'image/jpeg' },
            },
            sections: [
                { id: 1, title: 'Gold Tier', description: 'desc', partners: [] },
                { id: 2, title: 'Silver Tier', description: 'desc', partners: [] },
            ],
        };
        mockedPartnersApi.getPage.mockResolvedValue(mockPageData);

        render(<PartnersPage />);

        await waitFor(() => {
            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
            expect(screen.getByTestId('intro-section')).toBeInTheDocument();
            expect(screen.getByTestId('partners-section-1')).toBeInTheDocument();
            expect(screen.getByTestId('partners-section-2')).toBeInTheDocument();
            expect(screen.getByTestId('cta-section')).toBeInTheDocument();
        });
    });

    it('shows error on failure', async () => {
        mockedPartnersApi.getPage.mockRejectedValue(new Error('Error'));
        render(<PartnersPage />);

        await waitFor(() => {
            const errorMessage = screen.queryByText(DOWNLOAD_ERROR);
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent(DOWNLOAD_ERROR);

            expect(screen.queryByTestId('loader')).not.toBeInTheDocument();
        });
    });
});
