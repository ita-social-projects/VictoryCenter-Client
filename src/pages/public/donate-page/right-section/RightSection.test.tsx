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
import donatePageUk from '@/locales/uk/donate.json';
import { useLocale } from '@/hooks/common/use-locale/useLocale';

jest.mock('@/hooks/common/use-locale/useLocale', () => ({
    useLocale: jest.fn(),
}));

const mockedUseLocale = useLocale as jest.Mock;

jest.mock('./ukraine-payment-details/UkrainePaymentDetails', () => ({
    UkrainePaymentDetails: ({ bankDetails }: any) => (
        <div data-testid="ukraine-payment">Ukraine Payment Details ({bankDetails?.length || 0} items)</div>
    ),
}));

jest.mock('./abroad-payment-details/AbroadPaymentDetails', () => ({
    AbroadPaymentDetails: ({ currency, foreignBankDetails }: any) => (
        <div data-testid="abroad-payment">
            Abroad Payment Details - {currency === 1 ? 'USD' : 'EUR'} ({foreignBankDetails?.length || 0} items)
        </div>
    ),
}));

jest.mock('./alternative-support-ways/AlternativeSupportWays', () => ({
    AlternativeSupportWays: ({ supportOptions, currentCurrency }: any) => (
        <div data-testid="alt-support">
            Alternative Support - {currentCurrency} ({supportOptions?.length || 0} options)
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
        { id: 1, name: 'UAH Bank', ukrainianIban: 'UA123', receiver: 'Rec', edrpou: '1', paymentPurpose: 'P' },
    ];

    const createMockForeignBankDetails = (): PublishedForeignBankDetailsDto[] => [
        {
            id: 1,
            currency: Currency.USD,
            name: 'USD Bank',
            ukrainianIban: 'US123',
            receiver: 'R',
            swift: 'S',
            address: 'A',
            correspondentBanks: [],
        },
        {
            id: 2,
            currency: Currency.EUR,
            name: 'EUR Bank',
            ukrainianIban: 'EU123',
            receiver: 'R',
            swift: 'S',
            address: 'A',
            correspondentBanks: [],
        },
    ];

    const createMockSupportOptions = (): PublishedSupportOptionsDto[] => [
        { id: 1, name: 'PayPal', value: 'p', currency: Currency.UAH },
        { id: 2, name: 'Stripe', value: 's', currency: Currency.USD },
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
        // Встановлюємо дефолтний об'єкт для кожної ітерації
        mockedUseLocale.mockReturnValue({
            currentLanguage: 'uk',
            isUk: true,
            isEn: false,
        });
    });

    it('auto selects USD tab for en locale', async () => {
        mockedUseLocale.mockReturnValue({
            currentLanguage: 'en',
            isUk: false,
            isEn: true,
        });

        render(<RightSection donateData={createMockDonateData()} />);

        // Чекаємо спрацювання useEffect у компоненті
        await waitFor(
            () => {
                expect(screen.getByTestId('tab-долар')).toHaveClass('active');
            },
            { timeout: 2000 },
        );

        expect(screen.getByTestId('abroad-payment')).toBeInTheDocument();
    });

    it('does not auto switch tab after manual change', async () => {
        mockedUseLocale.mockReturnValue({
            currentLanguage: 'en',
            isUk: false,
            isEn: true,
        });

        render(<RightSection donateData={createMockDonateData()} />);

        await waitFor(() => {
            expect(screen.getByTestId('tab-долар')).toHaveClass('active');
        });

        fireEvent.click(screen.getByTestId('tab-євро'));

        await waitFor(() => {
            expect(screen.getByTestId('tab-євро')).toHaveClass('active');
        });

        expect(screen.getByTestId('tab-євро')).toHaveClass('active');
    });

    describe('error state', () => {
        it('shows error message when error prop provided', () => {
            render(<RightSection donateData={createMockDonateData()} error="Test error" />);

            const errorElement = screen.getByRole('alert');
            expect(errorElement).toBeInTheDocument();
            expect(errorElement).toHaveTextContent(donatePageUk.LOADING_ERROR_MESSAGE);
            expect(screen.queryByTestId('ukraine-payment')).not.toBeInTheDocument();
        });
    });

    describe('with available currencies', () => {
        it('renders with default UAH tab and UkrainePaymentDetails', () => {
            render(<RightSection donateData={createMockDonateData()} />);

            expect(screen.getByTestId('ukraine-payment')).toBeInTheDocument();
            expect(screen.getByTestId('tab-гривня')).toHaveClass('active');
            expect(screen.getByTestId('alt-support')).toBeInTheDocument();
        });

        it('renders all available currency tabs', () => {
            render(<RightSection donateData={createMockDonateData()} />);

            expect(screen.getByTestId('tab-гривня')).toBeInTheDocument();
            expect(screen.getByTestId('tab-долар')).toBeInTheDocument();
            expect(screen.getByTestId('tab-євро')).toBeInTheDocument();
        });

        it('switches to USD tab and shows AbroadPaymentDetails', async () => {
            render(<RightSection donateData={createMockDonateData()} />);
            await testTabSwitch('долар', 'abroad-payment', 'USD');
        });

        it('switches between all tabs correctly', async () => {
            render(<RightSection donateData={createMockDonateData()} />);
            await testTabSwitch('долар', 'abroad-payment', 'USD', 'гривня');
            await testTabSwitch('євро', 'abroad-payment', 'EUR', 'долар');
            await testTabSwitch('гривня', 'ukraine-payment', undefined, 'євро');
        });

        it('always renders AlternativeSupportWays with current currency', async () => {
            render(<RightSection donateData={createMockDonateData()} />);

            fireEvent.click(screen.getByTestId('tab-долар'));
            await waitFor(() => {
                expect(screen.getByTestId('alt-support')).toHaveTextContent(`Alternative Support - ${Currency.USD}`);
            });
        });
    });

    describe('no available currencies scenarios', () => {
        it('returns null when no data available', () => {
            const emptyData: DonatePageData = { uahBankDetails: [], foreignBankDetails: [], supportOptions: [] };
            const { container } = render(<RightSection donateData={emptyData} />);
            expect(container.firstChild).toBeNull();
        });

        it('returns null when data is null', () => {
            const { container } = render(<RightSection donateData={null} />);
            expect(container.firstChild).toBeNull();
        });
    });
});
