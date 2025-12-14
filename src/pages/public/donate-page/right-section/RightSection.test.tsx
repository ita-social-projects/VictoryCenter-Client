import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RightSection } from './RightSection';
import {
    Currency,
    DonatePageData,
    PublishedUahBankDetailsDto,
    PublishedForeignBankDetailsDto,
    PublishedSupportOptionsDto,
} from '@/types/public/donate-page';
import { ERROR_MESSAGES } from '@/const/public/donate-page';

jest.mock('./ukraine-payment-details/UkrainePaymentDetails', () => ({
    UkrainePaymentDetails: ({ bankDetails }: { bankDetails: PublishedUahBankDetailsDto[] }) => (
        <div data-testid="ukraine-payment">Ukraine Payment Details ({bankDetails.length} items)</div>
    ),
}));

jest.mock('./abroad-payment-details/AbroadPaymentDetails', () => ({
    AbroadPaymentDetails: ({
        currency,
        foreignBankDetails,
    }: {
        currency: number;
        foreignBankDetails: PublishedForeignBankDetailsDto[];
    }) => (
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
        supportOptions: PublishedSupportOptionsDto[];
        currentCurrency: number;
    }) => (
        <div data-testid="alt-support">
            Alternative Support - {currentCurrency} ({supportOptions.length} options)
        </div>
    ),
}));

jest.mock('@/components/common/tabs/Tabs', () => ({
    Tabs: ({ activeTab, setActiveTab, tabs }: any) => (
        <div data-testid="tabs-container">
            {tabs.map((tab: any) => (
                <button
                    key={tab.id}
                    className={activeTab === tab.id ? 'active tab' : 'tab'}
                    onClick={() => setActiveTab(tab.id)}
                    data-testid={`tab-${tab.label.toLowerCase().split(' / ')[0]}`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    ),
}));

describe('RightSection', () => {
    const createMockUahBankDetails = (): PublishedUahBankDetailsDto[] => [
        {
            id: 1,
            name: 'UAH Bank',
            ukrainianIban: 'UA123456789012345678901234567',
            receiver: 'UAH Receiver',
            edrpou: '12345678',
            paymentPurpose: 'Donation purpose',
        },
    ];

    const createMockForeignBankDetails = (): PublishedForeignBankDetailsDto[] => [
        {
            id: 1,
            currency: Currency.USD,
            name: 'USD Bank',
            ukrainianIban: 'US123456789012345678901234567',
            receiver: 'USD Receiver',
            swift: 'USDBANK',
            address: 'USD Bank Address',
            correspondentBanks: [],
        },
        {
            id: 2,
            currency: Currency.EUR,
            name: 'EUR Bank',
            ukrainianIban: 'EU123456789012345678901234567',
            receiver: 'EUR Receiver',
            swift: 'EURBANK',
            address: 'EUR Bank Address',
            correspondentBanks: [],
        },
    ];

    const createMockSupportOptions = (): PublishedSupportOptionsDto[] => [
        {
            id: 1,
            name: 'PayPal',
            value: 'test@paypal.com',
            currency: Currency.UAH,
        },
        {
            id: 2,
            name: 'Stripe',
            value: 'test@stripe.com',
            currency: Currency.USD,
        },
    ];

    const createMockDonateData = (): DonatePageData => ({
        uahBankDetails: createMockUahBankDetails(),
        foreignBankDetails: createMockForeignBankDetails(),
        supportOptions: createMockSupportOptions(),
    });

    const testTabSwitch = async (
        tabName: string,
        expectedPaymentType: 'ukraine-payment' | 'abroad-payment',
        expectedContent?: string,
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

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('error state', () => {
        it('shows error message when error prop provided', () => {
            const mockData = createMockDonateData();

            render(<RightSection donateData={mockData} error="Test error" />);

            const errorElement = screen.getByRole('alert');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent(ERROR_MESSAGES.LOADING_ERROR);
            expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
        });
    });

    describe('with available currencies', () => {
        const mockData = createMockDonateData();

        it('renders with default UAH tab and UkrainePaymentDetails', () => {
            render(<RightSection donateData={mockData} />);

            expect(screen.getByTestId('ukraine-payment')).toBeInTheDocument();
            expect(screen.getByTestId('tab-гривня')).toHaveClass('active');
            expect(screen.getByTestId('alt-support')).toBeInTheDocument();
        });

        it('renders all available currency tabs', () => {
            render(<RightSection donateData={mockData} />);

            expect(screen.getByTestId('tab-гривня')).toBeInTheDocument();
            expect(screen.getByTestId('tab-долар')).toBeInTheDocument();
            expect(screen.getByTestId('tab-євро')).toBeInTheDocument();
        });

        it('switches to USD tab and shows AbroadPaymentDetails', async () => {
            render(<RightSection donateData={mockData} />);

            await testTabSwitch('долар', 'abroad-payment', 'USD');
            expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
        });

        it('switches to EUR tab and shows AbroadPaymentDetails', async () => {
            render(<RightSection donateData={mockData} />);

            await testTabSwitch('євро', 'abroad-payment', 'EUR');
            expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
        });

        it('switches between all tabs correctly', async () => {
            render(<RightSection donateData={mockData} />);

            expect(screen.getByTestId('ukraine-payment')).toBeInTheDocument();
            expect(screen.getByTestId('tab-гривня')).toHaveClass('active');

            await testTabSwitch('долар', 'abroad-payment', 'USD', 'гривня');
            await testTabSwitch('євро', 'abroad-payment', 'EUR', 'долар');
            await testTabSwitch('гривня', 'ukraine-payment', undefined, 'євро');
        });

        it('always renders AlternativeSupportWays with current currency', async () => {
            render(<RightSection donateData={mockData} />);

            expect(screen.getByTestId('alt-support')).toHaveTextContent(`Alternative Support - ${Currency.UAH}`);

            fireEvent.click(screen.getByTestId('tab-долар'));
            await waitFor(() => {
                expect(screen.getByTestId('alt-support')).toHaveTextContent(`Alternative Support - ${Currency.USD}`);
            });

            fireEvent.click(screen.getByTestId('tab-євро'));
            await waitFor(() => {
                expect(screen.getByTestId('alt-support')).toHaveTextContent(`Alternative Support - ${Currency.EUR}`);
            });
        });

        it('filters foreign bank details by currency correctly', async () => {
            render(<RightSection donateData={mockData} />);

            fireEvent.click(screen.getByTestId('tab-долар'));
            await waitFor(() => {
                expect(screen.getByTestId('abroad-payment')).toHaveTextContent('USD (1 items)');
            });

            fireEvent.click(screen.getByTestId('tab-євро'));
            await waitFor(() => {
                expect(screen.getByTestId('abroad-payment')).toHaveTextContent('EUR (1 items)');
            });
        });

        it('renders correct DOM structure', () => {
            render(<RightSection donateData={mockData} />);

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
            const emptyData: DonatePageData = {
                uahBankDetails: [],
                foreignBankDetails: [],
                supportOptions: [],
            };

            const { container } = render(<RightSection donateData={emptyData} />);

            expect(container.firstChild).toBeNull();
        });

        it('returns null when data is null', () => {
            const { container } = render(<RightSection donateData={null} />);

            expect(container.firstChild).toBeNull();
        });

        it('shows only UAH tab when only UAH bank details available', () => {
            const uahOnlyData: DonatePageData = {
                uahBankDetails: createMockUahBankDetails(),
                foreignBankDetails: [],
                supportOptions: [],
            };

            render(<RightSection donateData={uahOnlyData} />);

            expect(screen.getByTestId('tab-гривня')).toBeInTheDocument();
            expect(screen.queryByTestId('tab-долар')).not.toBeInTheDocument();
            expect(screen.queryByTestId('tab-євро')).not.toBeInTheDocument();
        });

        it('shows only USD tab when only USD support options available', () => {
            const usdOnlyData: DonatePageData = {
                uahBankDetails: [],
                foreignBankDetails: [],
                supportOptions: [{ id: 1, name: 'PayPal', value: 'test@paypal.com', currency: Currency.USD }],
            };

            render(<RightSection donateData={usdOnlyData} />);

            expect(screen.getByTestId('tab-долар')).toBeInTheDocument();
            expect(screen.queryByTestId('tab-гривня')).not.toBeInTheDocument();
            expect(screen.queryByTestId('tab-євро')).not.toBeInTheDocument();
        });
    });
});
