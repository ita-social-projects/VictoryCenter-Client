import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import { AbroadPaymentDetails } from './AbroadPaymentDetails';
import {
    Currency,
    PublishedForeignBankDetailsDto,
    PublishedCorrespondentBankDetailsDto,
} from '@/types/public/donate-page';

jest.mock('@/const/public/donate-page', () => ({
    ABROAD_PAYMENT_DETAILS: {
        IBAN_USD_LABEL: 'IBAN (USD)',
        IBAN_EUR_LABEL: 'IBAN (EUR)',
    },
}));

jest.mock('./PaymentDetailsSection', () => ({
    PaymentDetailsSection: ({ title, ibanLabel, ibanValue, receiverName, bankName, swift, address }: any) => (
        <div data-testid="payment-details-section">
            <div data-testid="title">{title}</div>
            <div data-testid="iban-label">{ibanLabel}</div>
            <div data-testid="iban-value">{ibanValue}</div>
            <div data-testid="receiver-name">{receiverName}</div>
            <div data-testid="bank-name">{bankName}</div>
            <div data-testid="swift">{swift}</div>
            <div data-testid="address">{address}</div>
        </div>
    ),
}));

jest.mock('./CorrespondentBanksSection', () => ({
    CorrespondentBanksSection: ({
        correspondentBanks,
    }: {
        correspondentBanks: PublishedCorrespondentBankDetailsDto[];
    }) => (
        <div data-testid="correspondent-banks-section">
            <div data-testid="correspondent-banks-count">{correspondentBanks.length}</div>
            {correspondentBanks.map((bank, index) => (
                <div key={index} data-testid="correspondent-bank">
                    {bank.name}
                </div>
            ))}
        </div>
    ),
}));

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const map: Record<string, string> = {
                USD_PAYMENT_DETAILS_LABEL: 'Реквізити для донатів в USD',
                EUR_PAYMENT_DETAILS_LABEL: 'Реквізити для донатів в EUR',
            };

            return map[key] ?? key;
        },
    }),
}));

jest.mock('@/utils/functions/mappers/public/donate/donate', () => ({
    currencyToString: (currency: number) => {
        switch (currency) {
            case 1:
                return 'USD';
            case 2:
                return 'EUR';
            case 0:
            default:
                return 'UAH';
        }
    },
}));

describe('AbroadPaymentDetails', () => {
    const createMockCorrespondentBank = (
        overrides: Partial<PublishedCorrespondentBankDetailsDto> = {},
    ): PublishedCorrespondentBankDetailsDto => ({
        id: 1,
        name: 'Test Correspondent Bank',
        swift: 'CORRBANK',
        account: '987654321',
        foreignIban: 'US29CORR60161331926819',
        foreignBankDetailsId: 1,
        ...overrides,
    });

    const createMockForeignBankDetails = (
        overrides: Partial<PublishedForeignBankDetailsDto> = {},
    ): PublishedForeignBankDetailsDto => ({
        id: 1,
        name: 'Test Foreign Bank',
        receiver: 'Test Receiver Organization',
        ukrainianIban: 'US29NWBK60161331926819',
        swift: 'TESTBANK',
        address: '123 Test Street, Test City',
        currency: Currency.USD,
        correspondentBanks: [createMockCorrespondentBank()],
        ...overrides,
    });

    const expectElementToHaveTestId = (testId: string, expectedText?: string) => {
        const element = screen.getByTestId(testId);
        expect(element).toBeInTheDocument();
        if (expectedText !== undefined) {
            expect(element).toHaveTextContent(expectedText);
        }
        return element;
    };

    it('returns null when no foreign bank details provided', () => {
        const view = render(<AbroadPaymentDetails currency={Currency.USD} foreignBankDetails={[]} />);
        expect(view.container.firstChild).toBeNull();
    });

    it('renders USD payment details with API data', () => {
        const mockForeignBankDetails = [createMockForeignBankDetails()];

        render(<AbroadPaymentDetails currency={Currency.USD} foreignBankDetails={mockForeignBankDetails} />);

        expectElementToHaveTestId('payment-details-section');
        expectElementToHaveTestId('title', 'Реквізити для донатів в USD');
        expectElementToHaveTestId('iban-label', 'IBAN (USD)');
        expectElementToHaveTestId('iban-value', 'US29NWBK60161331926819');
        expectElementToHaveTestId('receiver-name', 'Test Receiver Organization');
        expectElementToHaveTestId('bank-name', 'Test Foreign Bank');
        expectElementToHaveTestId('swift', 'TESTBANK');
        expectElementToHaveTestId('address', '123 Test Street, Test City');

        expectElementToHaveTestId('correspondent-banks-section');
        expectElementToHaveTestId('correspondent-banks-count', '1');
        expectElementToHaveTestId('correspondent-bank', 'Test Correspondent Bank');
    });

    it('renders EUR payment details with API data', () => {
        const mockForeignBankDetails = [
            createMockForeignBankDetails({
                currency: Currency.EUR,
                ukrainianIban: 'GB29NWBK60161331926819',
                correspondentBanks: [
                    createMockCorrespondentBank({ name: 'EUR Correspondent 1' }),
                    createMockCorrespondentBank({ name: 'EUR Correspondent 2' }),
                ],
            }),
        ];

        render(<AbroadPaymentDetails currency={Currency.EUR} foreignBankDetails={mockForeignBankDetails} />);

        expectElementToHaveTestId('title', 'Реквізити для донатів в EUR');
        expectElementToHaveTestId('iban-label', 'IBAN (EUR)');
        expectElementToHaveTestId('iban-value', 'GB29NWBK60161331926819');

        expectElementToHaveTestId('correspondent-banks-count', '2');
        const correspondentBanks = screen.getAllByTestId('correspondent-bank');
        expect(correspondentBanks[0]).toHaveTextContent('EUR Correspondent 1');
        expect(correspondentBanks[1]).toHaveTextContent('EUR Correspondent 2');
    });

    it('handles foreign bank without correspondent banks', () => {
        const mockForeignBankDetails = [
            createMockForeignBankDetails({
                correspondentBanks: [],
            }),
        ];

        render(<AbroadPaymentDetails currency={Currency.USD} foreignBankDetails={mockForeignBankDetails} />);

        expectElementToHaveTestId('correspondent-banks-section');
        expectElementToHaveTestId('correspondent-banks-count', '0');
    });

    it('handles foreign bank with undefined correspondent banks', () => {
        const mockForeignBankDetails = [
            createMockForeignBankDetails({
                correspondentBanks: undefined as any,
            }),
        ];

        render(<AbroadPaymentDetails currency={Currency.USD} foreignBankDetails={mockForeignBankDetails} />);

        expectElementToHaveTestId('correspondent-banks-section');
        expectElementToHaveTestId('correspondent-banks-count', '0');
    });

    it('sorts foreign bank details by id desc, shows title only for first group and applies separated class', () => {
        const bank1 = createMockForeignBankDetails({
            id: 1,
            name: 'Bank 1',
            ukrainianIban: 'IBAN_1',
            correspondentBanks: [],
        });

        const bank2 = createMockForeignBankDetails({
            id: 2,
            name: 'Bank 2',
            ukrainianIban: 'IBAN_2',
            correspondentBanks: [],
        });

        const view = render(<AbroadPaymentDetails currency={Currency.USD} foreignBankDetails={[bank1, bank2]} />);

        const bankNames = screen.getAllByTestId('bank-name').map((el) => el.textContent);
        expect(bankNames).toEqual(['Bank 2', 'Bank 1']);

        const titles = screen.getAllByTestId('title').map((el) => el.textContent);
        expect(titles[0]).toBe('Реквізити для донатів в USD');
        expect(titles[1]).toBe('');

        const groups = view.container.querySelectorAll('.bankGroup');
        expect(groups).toHaveLength(2);
        expect(groups[0]).not.toHaveClass('separated');
        expect(groups[1]).toHaveClass('separated');
    });
});
