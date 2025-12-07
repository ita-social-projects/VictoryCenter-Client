import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DonatePage } from './DonatePage';

jest.mock('./donate-page-intro/DonatePageIntro', () => ({
    DonatePageIntro: () => (
        <div data-testid="donate-page-intro">
            <h1>
                МИ ВДЯЧНІ
                <br />
                ЗА КОЖЕН ДОНАТ
            </h1>
        </div>
    ),
}));

jest.mock('./donate-section/DonateSection', () => ({
    DonateSection: () => (
        <div data-testid="donate-section">
            <div data-testid="donate-section-form">
                <div>Разовий донат</div>
                <div>Підписка</div>
                <button>Донатити</button>
            </div>
        </div>
    ),
}));

jest.mock('./right-section/RightSection', () => ({
    RightSection: ({ donateData, error }: { donateData: any; error?: string | null }) => (
        <div data-testid="right-section" data-has-data={!!donateData} data-has-error={!!error}>
            <div>Реквізити для донатів в Україні</div>
            <div>Інші варіанти підтримки</div>
        </div>
    ),
}));

jest.mock('@components/public/faq-section/FaqSection', () => ({
    FaqSection: ({ slug }: { slug: string }) => (
        <div data-testid="faq-section" data-slug={slug}>
            FAQ Section
        </div>
    ),
}));

jest.mock('@const/public/faq', () => ({
    PAGE_SLUGS: {
        DONATE: 'donate-page',
    },
}));

jest.mock('@hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('@api/public/donate/donate-api', () => ({
    donatePageDataFetch: jest.fn(),
}));

const mockUseDataFetch = require('@hooks/common/use-data-fetch/useDataFetch').useDataFetch;

describe('DonatePage', () => {
    const mockUseDataFetchSuccess = (
        data: any = { uahBankDetails: [], foreignBankDetails: [], supportOptions: [] },
    ) => {
        mockUseDataFetch.mockReturnValue({
            data,
            error: null,
        });
    };

    const mockUseDataFetchLoading = () => {
        mockUseDataFetch.mockReturnValue({
            data: null,
            error: null,
        });
    };

    const mockUseDataFetchError = () => {
        mockUseDataFetch.mockReturnValue({
            data: null,
            error: 'Test error',
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loading state', () => {
        it('shows loading state when data is being fetched', () => {
            mockUseDataFetchLoading();

            render(<DonatePage />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();
            expect(screen.queryByTestId('right-section')).not.toBeInTheDocument();
        });

        it('shows loading with correct CSS class', () => {
            mockUseDataFetchLoading();

            render(<DonatePage />);

            const loaderContainer = screen.getByRole('progressbar').closest('.donate-page-loader');
            expect(loaderContainer).toBeInTheDocument();
        });

        it('shows intro section during loading', () => {
            mockUseDataFetchLoading();

            render(<DonatePage />);

            expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();
            expect(screen.getByText(/МИ ВДЯЧНІ/i)).toBeInTheDocument();
        });
    });

    describe('successful data loading', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('renders all main components in correct order', () => {
            render(<DonatePage />);

            expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();
            expect(screen.getByTestId('donate-section')).toBeInTheDocument();
            expect(screen.getByTestId('right-section')).toBeInTheDocument();
            expect(screen.getByTestId('faq-section')).toBeInTheDocument();

            const container = screen.getByTestId('donate-page-intro').closest('.donatePage');
            const children = container?.children;

            expect(children?.[0]).toContainElement(screen.getByTestId('donate-page-intro'));
            expect(children?.[1]).toHaveClass('donatePageContent');
            expect(children?.[2]).toContainElement(screen.getByTestId('faq-section'));
        });

        it('renders FaqSection with correct slug', () => {
            render(<DonatePage />);

            const faqSection = screen.getByTestId('faq-section');
            expect(faqSection).toBeInTheDocument();
            expect(faqSection).toHaveAttribute('data-slug', 'donate-page');
        });

        it('passes data to RightSection', () => {
            render(<DonatePage />);

            const rightSection = screen.getByTestId('right-section');
            expect(rightSection).toHaveAttribute('data-has-data', 'true');
            expect(rightSection).toHaveAttribute('data-has-error', 'false');
        });
    });

    describe('error handling', () => {
        it('passes error to RightSection when fetch fails', () => {
            mockUseDataFetchError();

            render(<DonatePage />);

            const rightSection = screen.getByTestId('right-section');
            expect(rightSection).toHaveAttribute('data-has-error', 'true');
            expect(rightSection).toHaveAttribute('data-has-data', 'false');
        });

        it('renders all components when error occurs', () => {
            mockUseDataFetchError();

            render(<DonatePage />);

            expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();
            expect(screen.getByTestId('donate-section')).toBeInTheDocument();
            expect(screen.getByTestId('right-section')).toBeInTheDocument();
            expect(screen.getByTestId('faq-section')).toBeInTheDocument();
        });
    });

    describe('DOM structure', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('has correct CSS classes and structure', () => {
            render(<DonatePage />);

            const donatePage = screen.getByTestId('donate-page-intro').closest('.donatePage');
            expect(donatePage).toBeInTheDocument();

            const donatePageContent = donatePage?.querySelector('.donatePageContent');
            expect(donatePageContent).toBeInTheDocument();

            const stickyBlock = donatePageContent?.querySelector('.stickyBlock');
            expect(stickyBlock).toBeInTheDocument();
            expect(stickyBlock).toContainElement(screen.getByTestId('donate-section'));
        });

        it('places RightSection in rightSectionContainer', () => {
            render(<DonatePage />);

            const rightSection = screen.getByTestId('right-section');
            const rightSectionContainer = rightSection.closest('.rightSectionContainer');
            expect(rightSectionContainer).toBeInTheDocument();

            const donatePageContent = rightSectionContainer?.closest('.donatePageContent');
            expect(donatePageContent).toBeInTheDocument();
        });
    });

    describe('data fetching', () => {
        it('calls useDataFetch with correct parameters', () => {
            mockUseDataFetchSuccess();

            render(<DonatePage />);

            expect(mockUseDataFetch).toHaveBeenCalledWith({
                initialData: null,
                fetchHandler: expect.any(Function),
                autoFetchDependencies: [],
            });
        });

        it('shows loader when data is null and no error', () => {
            mockUseDataFetch.mockReturnValue({
                data: null,
                error: null,
            });

            render(<DonatePage />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();

            expect(screen.queryByTestId('right-section')).not.toBeInTheDocument();
            expect(screen.queryByTestId('donate-section')).not.toBeInTheDocument();
            expect(screen.queryByTestId('faq-section')).not.toBeInTheDocument();
        });

        it('handles data states correctly', () => {
            mockUseDataFetchSuccess();
            const { rerender } = render(<DonatePage />);

            let rightSection = screen.getByTestId('right-section');
            expect(rightSection).toHaveAttribute('data-has-data', 'true');
            expect(rightSection).toHaveAttribute('data-has-error', 'false');

            mockUseDataFetchError();
            rerender(<DonatePage />);

            rightSection = screen.getByTestId('right-section');
            expect(rightSection).toHaveAttribute('data-has-data', 'false');
            expect(rightSection).toHaveAttribute('data-has-error', 'true');
        });
    });
});
