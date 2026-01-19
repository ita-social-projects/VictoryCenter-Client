import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { UkrainePaymentDetails } from './UkrainePaymentDetails';
import { PublishedUahBankDetailsDto } from '@/types/public/donate-page';

jest.mock('../../copy-text-button/CopyTextButton', () => ({
    CopyTextButton: ({ textToCopy }: { textToCopy: string }) => (
        <button data-testid="copy-button" data-copy-text={textToCopy}>
            Copy
        </button>
    ),
}));

jest.mock('@/const/public/donate-page', () => ({
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
    const createMockBank = (overrides: Partial<PublishedUahBankDetailsDto> = {}): PublishedUahBankDetailsDto => ({
        id: 1,
        name: 'Test Bank',
        receiver: 'Test Receiver',
        edrpou: '12345678',
        ukrainianIban: 'UA123456789012345678901234567',
        paymentPurpose: 'Test Payment Purpose',
        ...overrides,
    });

    const createMultipleBanks = (count: number): PublishedUahBankDetailsDto[] =>
        Array.from({ length: count }, (_, index) =>
            createMockBank({
                id: index + 1,
                name: `Test Bank ${index + 1}`,
                receiver: `Test Receiver ${index + 1}`,
                edrpou: `1234567${index}`,
                ukrainianIban: `UA12345678901234567890123456${index}`,
                paymentPurpose: `Test Payment Purpose ${index + 1}`,
            }),
        );

    const expectAllLabelsToBePresent = () => {
        expect(screen.getByText('Реквізити для донатів в Україні')).toBeInTheDocument();
        expect(screen.getAllByText('Одержувач')).toHaveLength(1);
        expect(screen.getAllByText('ЄДРПОУ')).toHaveLength(1);
        expect(screen.getAllByText('Банк')).toHaveLength(1);
        expect(screen.getAllByText('IBAN (UAH)')).toHaveLength(1);
        expect(screen.getAllByText('Призначення платежу')).toHaveLength(1);
    };

    const expectBankDataToBePresent = (bank: PublishedUahBankDetailsDto) => {
        expect(screen.getByText(bank.receiver)).toBeInTheDocument();
        expect(screen.getByText(bank.edrpou)).toBeInTheDocument();
        expect(screen.getByText(bank.name)).toBeInTheDocument();
        expect(screen.getByText(bank.ukrainianIban)).toBeInTheDocument();
        expect(screen.getByText(bank.paymentPurpose)).toBeInTheDocument();
    };

    const expectCopyButtonsWithCorrectData = (banks: PublishedUahBankDetailsDto[]) => {
        const copyButtons = screen.getAllByTestId('copy-button');
        const expectedButtonCount = banks.length * 5;
        expect(copyButtons).toHaveLength(expectedButtonCount);

        banks.forEach((bank, bankIndex) => {
            const startIndex = bankIndex * 5;
            expect(copyButtons[startIndex]).toHaveAttribute('data-copy-text', bank.receiver);
            expect(copyButtons[startIndex + 1]).toHaveAttribute('data-copy-text', bank.edrpou);
            expect(copyButtons[startIndex + 2]).toHaveAttribute('data-copy-text', bank.name);
            expect(copyButtons[startIndex + 3]).toHaveAttribute('data-copy-text', bank.ukrainianIban);
            expect(copyButtons[startIndex + 4]).toHaveAttribute('data-copy-text', bank.paymentPurpose);
        });
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('rendering with valid data', () => {
        it('should render single bank details correctly', () => {
            const mockBank = createMockBank();
            const bankDetails = [mockBank];

            render(<UkrainePaymentDetails bankDetails={bankDetails} />);

            expectAllLabelsToBePresent();
            expectBankDataToBePresent(mockBank);
            expectCopyButtonsWithCorrectData(bankDetails);
        });

        it('should render multiple banks with all details', () => {
            const bankDetails = createMultipleBanks(2);
            const sortedBankDetails = bankDetails.toSorted((a, b) => b.id - a.id);

            render(<UkrainePaymentDetails bankDetails={bankDetails} />);

            expect(screen.getByText('Реквізити для донатів в Україні')).toBeInTheDocument();

            expect(screen.getAllByText('Одержувач')).toHaveLength(2);
            expect(screen.getAllByText('ЄДРПОУ')).toHaveLength(2);
            expect(screen.getAllByText('Банк')).toHaveLength(2);
            expect(screen.getAllByText('IBAN (UAH)')).toHaveLength(2);
            expect(screen.getAllByText('Призначення платежу')).toHaveLength(2);

            sortedBankDetails.forEach((bank) => expectBankDataToBePresent(bank));
            expectCopyButtonsWithCorrectData(sortedBankDetails);
        });

        it('should apply separated class to non-first banks', () => {
            const bankDetails = createMultipleBanks(2);

            render(<UkrainePaymentDetails bankDetails={bankDetails} />);

            const container = screen.getByText('Реквізити для донатів в Україні').closest('.UkrainePaymentDetails');
            const paymentDetailsContainers = container?.querySelectorAll('.paymentDetails');

            expect(paymentDetailsContainers).toHaveLength(2);
            expect(paymentDetailsContainers?.[0]).not.toHaveClass('separated');
            expect(paymentDetailsContainers?.[1]).toHaveClass('separated');
        });
    });

    describe('rendering with edge case data', () => {
        it('should handle empty string values', () => {
            const mockBank = createMockBank({
                name: '',
                receiver: '',
                edrpou: '',
                ukrainianIban: '',
                paymentPurpose: '',
            });

            render(<UkrainePaymentDetails bankDetails={[mockBank]} />);

            expectAllLabelsToBePresent();
            expectCopyButtonsWithCorrectData([mockBank]);
        });

        it('should handle null and undefined values', () => {
            const mockBank = createMockBank({
                name: null as any,
                receiver: undefined as any,
                edrpou: null as any,
                ukrainianIban: undefined as any,
                paymentPurpose: null as any,
            });

            render(<UkrainePaymentDetails bankDetails={[mockBank]} />);

            expectAllLabelsToBePresent();
            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons).toHaveLength(5);
        });

        it('should handle banks with special characters in data', () => {
            const mockBank = createMockBank({
                name: 'Test Bank & Co. "Special" Characters',
                receiver: 'Test Receiver №1 (Main)',
                paymentPurpose: 'Donation for Victory Center project',
            });

            render(<UkrainePaymentDetails bankDetails={[mockBank]} />);

            expectBankDataToBePresent(mockBank);
        });
    });

    describe('empty state handling', () => {
        it('should return null for empty array', () => {
            const { container } = render(<UkrainePaymentDetails bankDetails={[]} />);

            expect(container.firstChild).toBeNull();
        });
    });

    describe('DOM structure validation', () => {
        it('should have correct CSS classes structure', () => {
            const bankDetails = createMultipleBanks(2);

            render(<UkrainePaymentDetails bankDetails={bankDetails} />);

            const mainContainer = screen.getByText('Реквізити для донатів в Україні').closest('.UkrainePaymentDetails');
            expect(mainContainer).toBeInTheDocument();

            const paymentDetailsContainers = mainContainer?.querySelectorAll('.paymentDetails');
            expect(paymentDetailsContainers).toHaveLength(2);

            paymentDetailsContainers?.forEach((container) => {
                const paymentLabels = container.querySelectorAll('.paymentLabel');
                expect(paymentLabels).toHaveLength(5);

                paymentLabels.forEach((label) => {
                    const labelWithCopyButton = label.querySelector('.labelWithCopyButton');
                    expect(labelWithCopyButton).toBeInTheDocument();

                    const span = labelWithCopyButton?.querySelector('.label');
                    expect(span).toBeInTheDocument();
                });
            });
        });

        it('should render correct heading structure', () => {
            const bankDetails = createMultipleBanks(2);

            render(<UkrainePaymentDetails bankDetails={bankDetails} />);

            const mainHeading = screen.getByRole('heading', { level: 2 });
            expect(mainHeading).toHaveTextContent('Реквізити для донатів в Україні');

            const subHeadings = screen.getAllByRole('heading', { level: 3 });
            expect(subHeadings).toHaveLength(10);
        });
    });

    describe('component behavior with different bank counts', () => {
        it('should handle 1 bank correctly', () => {
            const bankDetails = createMultipleBanks(1);

            render(<UkrainePaymentDetails bankDetails={bankDetails} />);

            expectAllLabelsToBePresent();
            expectCopyButtonsWithCorrectData(bankDetails);

            const separatedContainers = screen
                .getByText('Реквізити для донатів в Україні')
                .closest('.UkrainePaymentDetails')
                ?.querySelectorAll('.paymentDetails.separated');

            expect(separatedContainers).toHaveLength(0);
        });

        it('should handle 3 banks correctly', () => {
            const bankDetails = createMultipleBanks(3);
            const sortedBankDetails = bankDetails.toSorted((a, b) => b.id - a.id);

            render(<UkrainePaymentDetails bankDetails={bankDetails} />);

            expect(screen.getAllByText('Одержувач')).toHaveLength(3);
            expectCopyButtonsWithCorrectData(sortedBankDetails);

            const separatedContainers = screen
                .getByText('Реквізити для донатів в Україні')
                .closest('.UkrainePaymentDetails')
                ?.querySelectorAll('.paymentDetails.separated');

            expect(separatedContainers).toHaveLength(2);
        });
    });
});
