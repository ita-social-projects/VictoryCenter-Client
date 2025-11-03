import { render, screen } from '@testing-library/react';
import { UkrainePaymentDetails } from './UkrainePaymentDetails';
import { PublishedUahBankDetailsDto } from '../../../../../types/public/donate-page';
import { UKRAINE_PAYMENT_DETAILS, PAYMENT_DETAILS_COMMON } from '../../../../../const/public/donate-page';

jest.mock('../../../../../const/public/donate-page', () => ({
    UKRAINE_PAYMENT_DETAILS: {
        UKRAINE_PAYMENT_DETAILS_LABEL: 'Реквізити для донатів в Україні',
        UIDSREOU_LABEL: 'ЄДРПОУ',
        UIDSREOU_NUMBER_LABEL: '45262516',
        BANK_LABEL: 'Банк',
        BANK_NAME_LABEL: 'АТ КБ «ПРИВАТБАНК»',
        IBAN_UAH_LABEL: 'IBAN (UAH)',
        IBAN_UAH_NUMBER_LABEL: 'UA463052990000026000040142147',
        PAYMENT_DESTINATION_LABEL: 'Призначення платежу',
        PAYMENT_DESTINATION_NAME_LABEL: 'Благодійна допомога на статутну діяльність',
    },
    PAYMENT_DETAILS_COMMON: {
        RECIPIENT_LABEL: 'Одержувач',
        RECIPIENT_NAME_LABEL: 'ГО «ЦЕНТР ПЕРЕМОГИ»',
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

    const expectElementsToBeInDocument = (texts: string[]) => {
        texts.forEach((text) => {
            expect(screen.getByText(text)).toBeInTheDocument();
        });
    };

    const expectCopyButtonsCount = (expectedCount: number) => {
        const copyButtons = screen.getAllByRole('button');
        expect(copyButtons).toHaveLength(expectedCount);
    };

    describe('with API data', () => {
        it('renders all payment labels with API data', () => {
            const mockBankDetails = createMockBankDetails();

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText(UKRAINE_PAYMENT_DETAILS.UKRAINE_PAYMENT_DETAILS_LABEL)).toBeInTheDocument();

            expectElementsToBeInDocument([
                PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL,
                UKRAINE_PAYMENT_DETAILS.UIDSREOU_LABEL,
                UKRAINE_PAYMENT_DETAILS.BANK_LABEL,
                UKRAINE_PAYMENT_DETAILS.IBAN_UAH_LABEL,
                UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_LABEL,
            ]);

            expectElementsToBeInDocument([
                'Test Receiver',
                '12345678',
                'Test Bank',
                'UA123456789012345678901234567',
                'Test Payment Purpose',
            ]);

            expectCopyButtonsCount(5);
        });

        it('handles partial API data with fallbacks', () => {
            const mockBankDetails = createMockBankDetails({
                name: '',
                receiver: '',
            });

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText(PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL)).toBeInTheDocument();
            expect(screen.getByText(UKRAINE_PAYMENT_DETAILS.BANK_NAME_LABEL)).toBeInTheDocument();

            expectElementsToBeInDocument(['12345678', 'UA123456789012345678901234567', 'Test Payment Purpose']);
        });
    });

    describe('with empty array fallback to constants', () => {
        it('renders all payment labels with fallback constants', () => {
            render(<UkrainePaymentDetails bankDetails={[]} />);

            expect(screen.getByText(UKRAINE_PAYMENT_DETAILS.UKRAINE_PAYMENT_DETAILS_LABEL)).toBeInTheDocument();

            expectElementsToBeInDocument([
                PAYMENT_DETAILS_COMMON.RECIPIENT_LABEL,
                UKRAINE_PAYMENT_DETAILS.UIDSREOU_LABEL,
                UKRAINE_PAYMENT_DETAILS.BANK_LABEL,
                UKRAINE_PAYMENT_DETAILS.IBAN_UAH_LABEL,
                UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_LABEL,
            ]);

            expectElementsToBeInDocument([
                PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL,
                UKRAINE_PAYMENT_DETAILS.UIDSREOU_NUMBER_LABEL,
                UKRAINE_PAYMENT_DETAILS.BANK_NAME_LABEL,
                UKRAINE_PAYMENT_DETAILS.IBAN_UAH_NUMBER_LABEL,
                UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_NAME_LABEL,
            ]);

            expectCopyButtonsCount(5);
        });
    });

    describe('edge cases', () => {
        it('handles undefined values in API data', () => {
            const mockBankDetails = createMockBankDetails({
                name: undefined as any,
                receiver: null as any,
            });

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText(PAYMENT_DETAILS_COMMON.RECIPIENT_NAME_LABEL)).toBeInTheDocument();
            expect(screen.getByText(UKRAINE_PAYMENT_DETAILS.BANK_NAME_LABEL)).toBeInTheDocument();
        });

        it('handles empty string values in API data', () => {
            const mockBankDetails = createMockBankDetails({
                edrpou: '',
                iban: '',
                paymentPurpose: '',
            });

            render(<UkrainePaymentDetails bankDetails={mockBankDetails} />);

            expect(screen.getByText(UKRAINE_PAYMENT_DETAILS.UIDSREOU_NUMBER_LABEL)).toBeInTheDocument();
            expect(screen.getByText(UKRAINE_PAYMENT_DETAILS.IBAN_UAH_NUMBER_LABEL)).toBeInTheDocument();
            expect(screen.getByText(UKRAINE_PAYMENT_DETAILS.PAYMENT_DESTINATION_NAME_LABEL)).toBeInTheDocument();
        });
    });
});
