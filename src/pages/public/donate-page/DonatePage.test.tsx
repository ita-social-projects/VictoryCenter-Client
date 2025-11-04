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

jest.mock('../../../components/public/faq-section/FaqSection', () => ({
    FaqSection: ({ slug }: { slug: string }) => (
        <div data-testid="faq-section" data-slug={slug}>
            FAQ Section
        </div>
    ),
}));

jest.mock('../../../const/public/faq', () => ({
    PAGE_SLUGS: {
        DONATE: 'donate-page',
    },
}));

jest.mock('../../../hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('../../../services/api/public/donate/donate-api', () => ({
    donatePageDataFetch: jest.fn(),
}));

const mockUseDataFetch = require('../../../hooks/common/use-data-fetch/useDataFetch').useDataFetch;

describe('DonatePage', () => {
    const mockUseDataFetchSuccess = (
        data: any = { uahBankDetails: [], foreignBankDetails: [], supportOptions: [] },
    ) => {
        mockUseDataFetch.mockReturnValue({
            data,
            isLoading: false,
            error: null,
        });
    };

    const mockUseDataFetchLoading = () => {
        mockUseDataFetch.mockReturnValue({
            data: null,
            isLoading: true,
            error: null,
        });
    };

    const mockUseDataFetchError = () => {
        mockUseDataFetch.mockReturnValue({
            data: null,
            isLoading: false,
            error: 'Test error',
        });
    };

    const expectMainSectionsToBeInDocument = () => {
        expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();
        expect(screen.getByTestId('donate-section')).toBeInTheDocument();
        expect(screen.getByTestId('right-section')).toBeInTheDocument();
        expect(screen.getByTestId('faq-section')).toBeInTheDocument();
    };

    const expectCorrectDOMStructure = () => {
        const donatePage = screen.getByTestId('donate-page-intro').closest('.donatePage');
        expect(donatePage).toBeInTheDocument();

        const donatePageContent = donatePage?.querySelector('.donatePageContent');
        expect(donatePageContent).toBeInTheDocument();

        const stickyBlock = donatePageContent?.querySelector('.stickyBlock');
        expect(stickyBlock).toBeInTheDocument();
        expect(stickyBlock).toContainElement(screen.getByTestId('donate-section'));
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loading state', () => {
        it('shows loading state when data is being fetched', () => {
            mockUseDataFetchLoading();

            render(<DonatePage />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByTestId('donate-page-intro')).not.toBeInTheDocument();
            expect(screen.queryByTestId('right-section')).not.toBeInTheDocument();
        });

        it('shows loading with correct CSS class', () => {
            mockUseDataFetchLoading();

            render(<DonatePage />);

            const loaderContainer = screen.getByRole('progressbar').closest('.donate-page-loader');
            expect(loaderContainer).toBeInTheDocument();
        });
    });

    describe('successful data loading', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('renders all main components in correct order', () => {
            render(<DonatePage />);

            expectMainSectionsToBeInDocument();

            const container = screen.getByTestId('donate-page-intro').closest('.donatePage');
            const children = container?.children;

            expect(children?.[0]).toContainElement(screen.getByTestId('donate-page-intro'));
            expect(children?.[1]).toHaveClass('donatePageContent');
            expect(children?.[2]).toContainElement(screen.getByTestId('faq-section'));
        });

        it('renders DonatePageIntro with correct heading', () => {
            render(<DonatePage />);

            const heading = screen.getByRole('heading', { level: 1 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('МИ ВДЯЧНІ');
        });

        it('renders DonateSection with form elements', () => {
            render(<DonatePage />);

            expect(screen.getByTestId('donate-section-form')).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Донатити/i })).toBeInTheDocument();
        });

        it('renders RightSection with payment details', () => {
            render(<DonatePage />);

            expect(screen.getByText(/Реквізити для донатів в Україні/i)).toBeInTheDocument();
            expect(screen.getByText(/Інші варіанти підтримки/i)).toBeInTheDocument();
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

        it('still renders all other components when error occurs', () => {
            mockUseDataFetchError();

            render(<DonatePage />);

            expect(screen.getByTestId('donate-page-intro')).toBeInTheDocument();
            expect(screen.getByTestId('donate-section')).toBeInTheDocument();
            expect(screen.getByTestId('right-section')).toBeInTheDocument();
            expect(screen.getByTestId('faq-section')).toBeInTheDocument();
        });
    });

    describe('section content', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('renders all expected text content', () => {
            render(<DonatePage />);

            expect(screen.getByText(/МИ ВДЯЧНІ/i)).toBeInTheDocument();
            expect(screen.getByText(/ЗА КОЖЕН ДОНАТ/i)).toBeInTheDocument();

            expect(screen.getByText(/Разовий донат/i)).toBeInTheDocument();
            expect(screen.getByText(/Підписка/i)).toBeInTheDocument();

            expect(screen.getByText(/Реквізити для донатів в Україні/i)).toBeInTheDocument();
            expect(screen.getByText(/Інші варіанти підтримки/i)).toBeInTheDocument();

            expect(screen.getByText('FAQ Section')).toBeInTheDocument();
        });

        it('renders donate tab options', () => {
            render(<DonatePage />);

            expect(screen.getByText('Разовий донат')).toBeInTheDocument();
            expect(screen.getByText('Підписка')).toBeInTheDocument();
        });

        it('renders donate button', () => {
            render(<DonatePage />);

            const donateButton = screen.getByRole('button', { name: /Донатити/i });
            expect(donateButton).toBeInTheDocument();
        });
    });

    describe('DOM structure', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('has correct CSS classes and structure', () => {
            render(<DonatePage />);

            expectCorrectDOMStructure();
        });

        it('places DonateSection inside sticky block', () => {
            render(<DonatePage />);

            const stickyBlock = screen.getByTestId('donate-section').closest('.stickyBlock');
            expect(stickyBlock).toBeInTheDocument();
            expect(stickyBlock?.parentElement).toHaveClass('donatePageContent');
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

    describe('component integration', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('renders all headings with proper hierarchy', () => {
            render(<DonatePage />);

            const headings = screen.getAllByRole('heading');
            expect(headings.length).toBeGreaterThan(0);

            expect(headings[0]).toHaveTextContent(/МИ ВДЯЧНІ/i);
            expect(headings[0].tagName).toBe('H1');
        });

        it('renders interactive elements', () => {
            render(<DonatePage />);

            const buttons = screen.getAllByRole('button');
            expect(buttons.length).toBeGreaterThan(0);

            const donateButton = buttons.find((button) => button.textContent?.includes('Донатити'));
            expect(donateButton).toBeInTheDocument();
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

        it('handles different data states correctly', () => {
            mockUseDataFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            });

            render(<DonatePage />);

            const rightSection = screen.getByTestId('right-section');
            expect(rightSection).toHaveAttribute('data-has-data', 'false');
            expect(rightSection).toHaveAttribute('data-has-error', 'false');
        });
    });
});
