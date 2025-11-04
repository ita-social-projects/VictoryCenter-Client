import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
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

    const testTabSwitch = async (
        tabName: string,
        expectedContent: string,
        expectedPaymentType: 'ukraine-payment' | 'abroad-payment',
        previousTab?: string,
    ) => {
        fireEvent.click(screen.getByTestId(`tab-${tabName}`));

        await waitFor(() => {
            expect(screen.getByTestId(expectedPaymentType)).toBeInTheDocument();
            expect(screen.getByTestId(`tab-${tabName}`)).toHaveClass('active');

            if (previousTab) {
                expect(screen.getByTestId(`tab-${previousTab}`)).not.toHaveClass('active');
            }

            if (expectedContent && expectedPaymentType === 'abroad-payment') {
                expect(screen.getByTestId('abroad-payment')).toHaveTextContent(expectedContent);
            }
        });
    };

    const testForeignCurrencySwitch = async (currency: 'USD' | 'EUR') => {
        render(<RightSection />);

        fireEvent.click(screen.getByTestId(`tab-${currency.toLowerCase()}`));

        await waitFor(() => {
            expect(screen.getByTestId('abroad-payment')).toBeInTheDocument();
            expect(screen.getByTestId('abroad-payment')).toHaveTextContent(currency);
            expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
            expect(screen.getByTestId(`tab-${currency.toLowerCase()}`)).toHaveClass('active');
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('loading state', () => {
        it('shows loading state when data is being fetched', () => {
            mockUseDataFetchLoading();

            render(<RightSection />);

            expect(screen.getByRole('progressbar')).toBeInTheDocument();
            expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
        });
    });

    describe('error state', () => {
        it('shows error message when data fetch fails', () => {
            mockUseDataFetchError();

            render(<RightSection />);

            const errorElement = screen.getByRole('alert');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent('Не вдалося завантажити реквізити');
            expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
        });
    });

    describe('with available currencies', () => {
        beforeEach(() => {
            mockUseDataFetchSuccess();
        });

        it('renders with default UAH tab and UkrainePaymentDetails', () => {
            render(<RightSection />);

            expect(screen.getByTestId('ukraine-payment')).toBeInTheDocument();
            expect(screen.getByTestId('tab-uah')).toHaveClass('active');
            expect(screen.getByTestId('alt-support')).toBeInTheDocument();
        });

        it('renders all available currency tabs', () => {
            render(<RightSection />);

            expect(screen.getByTestId('tab-uah')).toBeInTheDocument();
            expect(screen.getByTestId('tab-usd')).toBeInTheDocument();
            expect(screen.getByTestId('tab-eur')).toBeInTheDocument();
        });

        it('switches to USD tab and shows AbroadPaymentDetails', async () => {
            await testForeignCurrencySwitch('USD');
        });

        it('switches to EUR tab and shows AbroadPaymentDetails', async () => {
            await testForeignCurrencySwitch('EUR');
        });

        it('switches between all tabs correctly', async () => {
            render(<RightSection />);

            expect(screen.getByTestId('ukraine-payment')).toBeInTheDocument();
            expect(screen.getByTestId('tab-uah')).toHaveClass('active');

            await testTabSwitch('usd', 'USD', 'abroad-payment', 'uah');
            await testTabSwitch('eur', 'EUR', 'abroad-payment', 'usd');
            await testTabSwitch('uah', '', 'ukraine-payment', 'eur');
        });

        it('always renders AlternativeSupportWays with current currency', async () => {
            render(<RightSection />);

            expect(screen.getByTestId('alt-support')).toHaveTextContent('Alternative Support - 0');

            fireEvent.click(screen.getByTestId('tab-usd'));
            await waitFor(() => {
                expect(screen.getByTestId('alt-support')).toHaveTextContent('Alternative Support - 1');
            });

            fireEvent.click(screen.getByTestId('tab-eur'));
            await waitFor(() => {
                expect(screen.getByTestId('alt-support')).toHaveTextContent('Alternative Support - 2');
            });
        });

        it('filters foreign bank details by currency correctly', async () => {
            render(<RightSection />);

            fireEvent.click(screen.getByTestId('tab-usd'));
            await waitFor(() => {
                expect(screen.getByTestId('abroad-payment')).toHaveTextContent('USD (1 items)');
            });

            fireEvent.click(screen.getByTestId('tab-eur'));
            await waitFor(() => {
                expect(screen.getByTestId('abroad-payment')).toHaveTextContent('EUR (1 items)');
            });
        });

        it('renders correct DOM structure', () => {
            render(<RightSection />);

            const rightSection = screen.getByTestId('tabs-container').closest('.rightSection');
            expect(rightSection).toBeInTheDocument();

            const locationToggleContainer = rightSection?.querySelector('.locationToggleContainer');
            expect(locationToggleContainer).toBeInTheDocument();

            const donatePaymentDetails = rightSection?.querySelector('.donatePaymentDetails');
            expect(donatePaymentDetails).toBeInTheDocument();
        });
    });

    describe('no available currencies scenarios', () => {
        it('returns null when no data available for any currency', () => {
            mockUseDataFetchSuccess({
                uahBankDetails: [],
                foreignBankDetails: [],
                supportOptions: [],
            });

            const { container } = render(<RightSection />);

            expect(container.firstChild).toBeNull();
        });

        it('returns null when data is null', () => {
            mockUseDataFetch.mockReturnValue({
                data: null,
                isLoading: false,
                error: null,
            });

            const { container } = render(<RightSection />);

            expect(container.firstChild).toBeNull();
        });

        it('shows only UAH tab when only UAH bank details available', () => {
            mockUseDataFetchSuccess({
                uahBankDetails: [{ id: 1, name: 'UAH Bank' }],
                foreignBankDetails: [],
                supportOptions: [],
            });

            render(<RightSection />);

            expect(screen.getByTestId('tab-uah')).toBeInTheDocument();
            expect(screen.queryByTestId('tab-usd')).not.toBeInTheDocument();
            expect(screen.queryByTestId('tab-eur')).not.toBeInTheDocument();
        });

        it('shows only USD tab when only USD support options available', () => {
            mockUseDataFetchSuccess({
                uahBankDetails: [],
                foreignBankDetails: [],
                supportOptions: [{ id: 1, currency: Currency.USD }],
            });

            render(<RightSection />);

            expect(screen.getByTestId('tab-usd')).toBeInTheDocument();
            expect(screen.queryByTestId('tab-uah')).not.toBeInTheDocument();
            expect(screen.queryByTestId('tab-eur')).not.toBeInTheDocument();
        });
    });
});
