import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RightSection } from './RightSection';
import { Currency } from '../../../../types/public/donate-page';

jest.mock('./ukraine-payment-details/UkrainePaymentDetails', () => ({
    UkrainePaymentDetails: ({ bankDetails }: { bankDetails: any[] }) => (
        <div data-testid="ukraine-payment">Ukraine Payment Details ({bankDetails.length} items)</div>
    ),
}));

jest.mock('./abroad-payment-details/AbroadPaymentDetails', () => ({
    AbroadPaymentDetails: ({ currency, foreignBankDetails }: { currency: number; foreignBankDetails: any[] }) => (
        <div data-testid="abroad-payment">
            Abroad Payment Details - {currency === 1 ? 'USD' : 'EUR'} ({foreignBankDetails.length} items)
        </div>
    ),
}));

jest.mock('./alternative-support-ways/AlternativeSupportWays', () => ({
    AlternativeSupportWays: ({
        supportOptions,
        currentCurrency,
    }: {
        supportOptions: any[];
        currentCurrency: number;
    }) => (
        <div data-testid="alt-support">
            Alternative Support - {currentCurrency} ({supportOptions.length} options)
        </div>
    ),
}));

jest.mock('../../../../components/common/tabs/Tabs', () => ({
    Tabs: ({ activeTab, setActiveTab, tabs }: any) => (
        <div data-testid="tabs-container">
            {tabs.map((tab: any) => (
                <button
                    key={tab.id}
                    className={activeTab === tab.id ? 'active tab' : 'tab'}
                    onClick={() => setActiveTab(tab.id)}
                    data-testid={`tab-${tab.label.toLowerCase()}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    ),
}));

jest.mock('../../../../const/public/donate-page', () => ({
    CURRENCY_TABS: {
        UAH: 'UAH',
        USD: 'USD',
        EUR: 'EUR',
    },
}));

jest.mock('../../../../hooks/common/use-data-fetch/useDataFetch', () => ({
    useDataFetch: jest.fn(),
}));

jest.mock('../../../../services/api/public/donate/donate-api', () => ({
    donatePageDataFetch: jest.fn(),
}));

const mockUseDataFetch = require('../../../../hooks/common/use-data-fetch/useDataFetch').useDataFetch;

describe('RightSection', () => {
    const createMockDonateData = () => ({
        uahBankDetails: [{ id: 1, name: 'UAH Bank', iban: 'UA123', receiver: 'UAH Receiver' }],
        foreignBankDetails: [
            { id: 1, currency: Currency.USD, name: 'USD Bank', iban: 'US123' },
            { id: 2, currency: Currency.EUR, name: 'EUR Bank', iban: 'EU123' },
        ],
        supportOptions: [
            { id: 1, name: 'PayPal', value: 'test@paypal.com', currency: Currency.UAH },
            { id: 2, name: 'Stripe', value: 'test@stripe.com', currency: Currency.USD },
        ],
    });

    const mockUseDataFetchSuccess = (data: any = createMockDonateData()) => {
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

    const getTabByLabel = (label: string) => screen.getByTestId(`tab-${label.toLowerCase()}`);
    const getUkrainePaymentSection = () => screen.getByTestId('ukraine-payment');
    const getAbroadPaymentSection = () => screen.getByTestId('abroad-payment');
    const getAlternativeSupportSection = () => screen.getByTestId('alt-support');
    const queryUkrainePaymentSection = () => screen.queryByTestId('ukraine-payment');
    const queryAbroadPaymentSection = () => screen.queryByTestId('abroad-payment');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loading state', () => {
        it('shows loading state when data is being fetched', async () => {
            mockUseDataFetchLoading();

            render(<RightSection />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(queryUkrainePaymentSection()).not.toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('shows error message when data fetch fails', () => {
            mockUseDataFetchError();

            render(<RightSection />);

            const errorElement = screen.getByRole('alert');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent('Не вдалося завантажити реквізити');
            expect(queryUkrainePaymentSection()).not.toBeInTheDocument();
        });
    });

    describe('successful data loading', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('renders with default UAH tab and UkrainePaymentDetails', () => {
            render(<RightSection />);

            expect(getUkrainePaymentSection()).toBeInTheDocument();
            expect(getTabByLabel('UAH')).toHaveClass('active');
            expect(getAlternativeSupportSection()).toBeInTheDocument();
        });

        it('renders all currency tabs', () => {
            render(<RightSection />);

            expect(getTabByLabel('UAH')).toBeInTheDocument();
            expect(getTabByLabel('USD')).toBeInTheDocument();
            expect(getTabByLabel('EUR')).toBeInTheDocument();
        });

        it('switches to USD tab and shows AbroadPaymentDetails', async () => {
            render(<RightSection />);

            fireEvent.click(getTabByLabel('USD'));

            await waitFor(() => {
                expect(getAbroadPaymentSection()).toBeInTheDocument();
                expect(getAbroadPaymentSection()).toHaveTextContent('USD');
                expect(queryUkrainePaymentSection()).not.toBeInTheDocument();
                expect(getTabByLabel('USD')).toHaveClass('active');
            });
        });

        it('switches to EUR tab and shows AbroadPaymentDetails', async () => {
            render(<RightSection />);

            fireEvent.click(getTabByLabel('EUR'));

            await waitFor(() => {
                expect(getAbroadPaymentSection()).toBeInTheDocument();
                expect(getAbroadPaymentSection()).toHaveTextContent('EUR');
                expect(queryUkrainePaymentSection()).not.toBeInTheDocument();
                expect(getTabByLabel('EUR')).toHaveClass('active');
            });
        });

        it('switches between all tabs correctly', async () => {
            render(<RightSection />);

            expect(getUkrainePaymentSection()).toBeInTheDocument();
            expect(getTabByLabel('UAH')).toHaveClass('active');

            fireEvent.click(getTabByLabel('USD'));
            await waitFor(() => {
                expect(getAbroadPaymentSection()).toBeInTheDocument();
                expect(getTabByLabel('USD')).toHaveClass('active');
                expect(getTabByLabel('UAH')).not.toHaveClass('active');
            });

            fireEvent.click(getTabByLabel('EUR'));
            await waitFor(() => {
                expect(getAbroadPaymentSection()).toBeInTheDocument();
                expect(getTabByLabel('EUR')).toHaveClass('active');
                expect(getTabByLabel('USD')).not.toHaveClass('active');
            });

            fireEvent.click(getTabByLabel('UAH'));
            await waitFor(() => {
                expect(getUkrainePaymentSection()).toBeInTheDocument();
                expect(getTabByLabel('UAH')).toHaveClass('active');
                expect(getTabByLabel('EUR')).not.toHaveClass('active');
            });
        });

        it('always renders AlternativeSupportWays with current currency', async () => {
            render(<RightSection />);

            expect(getAlternativeSupportSection()).toHaveTextContent('Alternative Support - 0');

            fireEvent.click(getTabByLabel('USD'));
            await waitFor(() => {
                expect(getAlternativeSupportSection()).toHaveTextContent('Alternative Support - 1');
            });

            fireEvent.click(getTabByLabel('EUR'));
            await waitFor(() => {
                expect(getAlternativeSupportSection()).toHaveTextContent('Alternative Support - 2');
            });
        });
    });

    describe('data filtering', () => {
        it('filters foreign bank details by currency for USD', async () => {
            mockUseDataFetchSuccess();
            render(<RightSection />);

            fireEvent.click(getTabByLabel('USD'));

            await waitFor(() => {
                const abroadSection = getAbroadPaymentSection();
                expect(abroadSection).toHaveTextContent('USD (1 items)');
            });
        });

        it('filters foreign bank details by currency for EUR', async () => {
            mockUseDataFetchSuccess();
            render(<RightSection />);

            fireEvent.click(getTabByLabel('EUR'));

            await waitFor(() => {
                const abroadSection = getAbroadPaymentSection();
                expect(abroadSection).toHaveTextContent('EUR (1 items)');
            });
        });

        it('passes support options to AlternativeSupportWays', () => {
            mockUseDataFetchSuccess();
            render(<RightSection />);

            expect(getAlternativeSupportSection()).toHaveTextContent('(2 options)');
        });
    });

    describe('edge cases', () => {
        it('handles empty data gracefully', () => {
            mockUseDataFetchSuccess({
                uahBankDetails: [],
                foreignBankDetails: [],
                supportOptions: [],
            });

            render(<RightSection />);

            expect(getUkrainePaymentSection()).toHaveTextContent('(0 items)');
            expect(getAlternativeSupportSection()).toHaveTextContent('(0 options)');
        });

        it('handles null data gracefully', () => {
            mockUseDataFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            });

            render(<RightSection />);

            expect(queryUkrainePaymentSection()).not.toBeInTheDocument();
            expect(queryAbroadPaymentSection()).not.toBeInTheDocument();

            expect(getAlternativeSupportSection()).toHaveTextContent('(0 options)');
        });
    });

    describe('DOM structure', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('has correct CSS classes and structure', () => {
            render(<RightSection />);

            const rightSection = screen.getByTestId('tabs-container').closest('.rightSection');
            expect(rightSection).toBeInTheDocument();

            const locationToggleContainer = rightSection?.querySelector('.locationToggleContainer');
            expect(locationToggleContainer).toBeInTheDocument();

            const donatePaymentDetails = rightSection?.querySelector('.donatePaymentDetails');
            expect(donatePaymentDetails).toBeInTheDocument();
        });

        it('renders tabs container with switch class', () => {
            render(<RightSection />);

            const switchContainer = screen.getByTestId('tabs-container').closest('.switch');
            expect(switchContainer).toBeInTheDocument();
        });
    });
});
