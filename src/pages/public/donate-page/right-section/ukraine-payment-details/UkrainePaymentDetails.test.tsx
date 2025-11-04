import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UkrainePaymentDetails } from './UkrainePaymentDetails';
import { PublishedUahBankDetailsDto } from '../../../../../types/public/donate-page';

jest.mock('../../copy-text-button/CopyTextButton', () => ({
    CopyTextButton: ({ textToCopy }: { textToCopy: string }) => (
        <button data-testid="copy-button" data-copy-text={textToCopy}>
            Copy
        </button>
    ),
}));

jest.mock('../../../../../const/public/donate-page', () => ({
    UKRAINE_PAYMENT_DETAILS: {
        UKRAINE_PAYMENT_DETAILS_LABEL: 'Реквізити для донатів в Україні',
        UIDSREOU_LABEL: 'ЄДРПОУ',
        BANK_LABEL: 'Банк',
        IBAN_UAH_LABEL: 'IBAN (UAH)',
        PAYMENT_DESTINATION_LABEL: 'Призначення платежу',
    },
    PAYMENT_DETAILS_COMMON: {
        RECIPIENT_LABEL: 'Одержувач',
    },
}));

describe('UkrainePaymentDetails', () => {
    const createMockBankDetails = (
        overrides: Partial<PublishedUahBankDetailsDto> = {},
    ): PublishedUahBankDetailsDto[] => [
        {
            id: 1,
            name: 'Test Bank',
            receiver: 'Test Receiver',
            edrpou: '12345678',
            iban: 'UA123456789012345678901234567',
            paymentPurpose: 'Test Payment Purpose',
            ...overrides,
        },
    ];

    describe('with bank details data', () => {
        it('renders all payment details with API data', () => {
            const mockBankDetails = createMockBankDetails();

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText('Реквізити для донатів в Україні')).toBeInTheDocument();

            expect(screen.getByText('Одержувач')).toBeInTheDocument();
            expect(screen.getByText('ЄДРПОУ')).toBeInTheDocument();
            expect(screen.getByText('Банк')).toBeInTheDocument();
            expect(screen.getByText('IBAN (UAH)')).toBeInTheDocument();
            expect(screen.getByText('Призначення платежу')).toBeInTheDocument();

            expect(screen.getByText('Test Receiver')).toBeInTheDocument();
            expect(screen.getByText('12345678')).toBeInTheDocument();
            expect(screen.getByText('Test Bank')).toBeInTheDocument();
            expect(screen.getByText('UA123456789012345678901234567')).toBeInTheDocument();
            expect(screen.getByText('Test Payment Purpose')).toBeInTheDocument();

            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons).toHaveLength(5);
            expect(copyButtons[0]).toHaveAttribute('data-copy-text', 'Test Receiver');
            expect(copyButtons[1]).toHaveAttribute('data-copy-text', '12345678');
            expect(copyButtons[2]).toHaveAttribute('data-copy-text', 'Test Bank');
            expect(copyButtons[3]).toHaveAttribute('data-copy-text', 'UA123456789012345678901234567');
            expect(copyButtons[4]).toHaveAttribute('data-copy-text', 'Test Payment Purpose');
        });

        it('renders with multiple banks but uses only first one primary', () => {
            const mockBankDetails = [
                createMockBankDetails()[0],
                {
                    id: 2,
                    name: 'Secondary Bank',
                    receiver: 'Secondary Receiver',
                    edrpou: '87654321',
                    iban: 'UA987654321098765432109876543',
                    paymentPurpose: 'Secondary Purpose',
                },
            ];

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText('Test Receiver')).toBeInTheDocument();
            expect(screen.getByText('Test Bank')).toBeInTheDocument();
            expect(screen.queryByText('Secondary Receiver')).not.toBeInTheDocument();
            expect(screen.queryByText('Secondary Bank')).not.toBeInTheDocument();
        });

        it('handles bank details with empty string values', () => {
            const mockBankDetails = createMockBankDetails({
                name: '',
                receiver: '',
                edrpou: '',
                iban: '',
                paymentPurpose: '',
            });

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText('Реквізити для донатів в Україні')).toBeInTheDocument();

            const spans = screen.getAllByText('');
            expect(spans.length).toBeGreaterThan(0);

            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons[0]).toHaveAttribute('data-copy-text', '');
            expect(copyButtons[1]).toHaveAttribute('data-copy-text', '');
        });

        it('handles bank details with null undefined values', () => {
            const mockBankDetails = createMockBankDetails({
                name: null as any,
                receiver: undefined as any,
            });

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText('Реквізити для донатів в Україні')).toBeInTheDocument();

            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons).toHaveLength(5);
        });
    });

    describe('no bank details scenarios', () => {
        it('returns null when no bank details provided', () => {
            const { container } = render(<UkrainePaymentDetails bankDetails={[]} />);

            expect(container.firstChild).toBeNull();
        });

        it('returns null when bankDetails array is empty', () => {
            const { container } = render(<UkrainePaymentDetails bankDetails={[]} />);

            expect(container.firstChild).toBeNull();
        });
    });
});
