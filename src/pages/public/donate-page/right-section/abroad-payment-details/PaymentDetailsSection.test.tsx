import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentDetailsSection } from './PaymentDetailsSection';

jest.mock('./PaymentLabelWithCopy', () => ({
    PaymentLabelWithCopy: ({ label, value, copyValue }: { label: string; value: string; copyValue: string }) => (
        <div data-testid="payment-label" data-label={label} data-value={value} data-copy-value={copyValue}>
            {label}: {value}
        </div>
    ),
}));

jest.mock('./MultiFieldLabelWithCopy', () => ({
    MultiFieldLabelWithCopy: ({ label, values, copyValue }: { label: string; values: string[]; copyValue: string }) => (
        <div
            data-testid="multi-field-label"
            data-label={label}
            data-values={values.join('|')}
            data-copy-value={copyValue}
        >
            {label}: {values.join(', ')}
        </div>
    ),
}));

jest.mock('../../../../../const/public/donate-page', () => ({
    PAYMENT_DETAILS_COMMON: {
        RECIPIENT_LABEL: 'Recipient',
        RECIPIENT_NAME_LABEL: 'Default Recipient Name',
    },
    ABROAD_PAYMENT_DETAILS: {
        SWIFT_CODE_LABEL: 'SWIFT Code',
        SWIFT_CODE_VALUE_LABEL: 'Default SWIFT',
        BANK_RECEIVER_LABEL: 'Bank',
        ADDRESS_LABEL: 'Address',
        BANK_NAME_TRANSLITERATED_LABEL: 'Bank Name',
        BANK_STREET_TRANSLITERATED_LABEL: 'Bank Street',
        BANK_CITY_AND_COUNTRY_TRANSLITERATED_LABEL: 'Bank City Country',
        COUNTRY_LABEL: 'Country',
        CITY_LABEL: 'City',
    },
}));

describe('PaymentDetailsSection', () => {
    const createProps = (overrides = {}) => ({
        title: 'Test Payment Details',
        ibanLabel: 'IBAN (USD)',
        ibanValue: 'US1234567890123456789012',
        receiverName: 'Test Receiver',
        bankName: 'Test Bank',
        swift: 'TESTUS33',
        address: 'Test Address',
        ...overrides,
    });

    const expectBasicStructure = (title: string) => {
        expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent(title);
        expect(screen.getByText(title).closest('.abroadPaymentDetailsBlock')).toBeInTheDocument();
        expect(
            screen
                .getByText(title)
                .closest('.abroadPaymentDetailsBlock')
                ?.querySelector('.abroadPaymentDetailsContent'),
        ).toBeInTheDocument();
    };

    const expectPaymentLabel = (label: string, value: string, copyValue: string) => {
        const element = screen.getByTestId('payment-label');
        expect(element).toHaveAttribute('data-label', label);
        expect(element).toHaveAttribute('data-value', value);
        expect(element).toHaveAttribute('data-copy-value', copyValue);
    };

    describe('rendering with all props provided', () => {
        it('should render all required fields with provided values', () => {
            const props = createProps();

            render(<PaymentDetailsSection {...props} />);

            expectBasicStructure('Test Payment Details');

            const paymentLabels = screen.getAllByTestId('payment-label');
            expect(paymentLabels).toHaveLength(5);

            expect(paymentLabels[0]).toHaveAttribute('data-label', 'Recipient');
            expect(paymentLabels[0]).toHaveAttribute('data-value', 'Test Receiver');
            expect(paymentLabels[0]).toHaveAttribute('data-copy-value', 'Test Receiver');

            expect(paymentLabels[1]).toHaveAttribute('data-label', 'IBAN (USD)');
            expect(paymentLabels[1]).toHaveAttribute('data-value', 'US1234567890123456789012');
            expect(paymentLabels[1]).toHaveAttribute('data-copy-value', 'US1234567890123456789012');

            expect(paymentLabels[2]).toHaveAttribute('data-label', 'SWIFT Code');
            expect(paymentLabels[2]).toHaveAttribute('data-value', 'TESTUS33');
            expect(paymentLabels[2]).toHaveAttribute('data-copy-value', 'TESTUS33');

            expect(paymentLabels[3]).toHaveAttribute('data-label', 'Bank');
            expect(paymentLabels[3]).toHaveAttribute('data-value', 'Test Bank');
            expect(paymentLabels[3]).toHaveAttribute('data-copy-value', 'Test Bank');

            expect(paymentLabels[4]).toHaveAttribute('data-label', 'Address');
            expect(paymentLabels[4]).toHaveAttribute('data-value', 'Test Address');
            expect(paymentLabels[4]).toHaveAttribute('data-copy-value', 'Test Address');

            expect(screen.queryByTestId('multi-field-label')).not.toBeInTheDocument();
        });
    });

    describe('rendering with missing optional props', () => {
        it('should use default values and MultiFieldLabelWithCopy when receiverName is null', () => {
            const props = createProps({ receiverName: null });

            render(<PaymentDetailsSection {...props} />);

            const paymentLabels = screen.getAllByTestId('payment-label');
            expect(paymentLabels[0]).toHaveAttribute('data-label', 'Recipient');
            expect(paymentLabels[0]).toHaveAttribute('data-value', 'Default Recipient Name');
            expect(paymentLabels[0]).toHaveAttribute('data-copy-value', 'Default Recipient Name');
        });

        it('should use default values when swift is null', () => {
            const props = createProps({ swift: null });

            render(<PaymentDetailsSection {...props} />);

            const paymentLabels = screen.getAllByTestId('payment-label');
            const swiftLabel = paymentLabels.find((label) => label.getAttribute('data-label') === 'SWIFT Code');
            expect(swiftLabel).toHaveAttribute('data-value', 'Default SWIFT');
            expect(swiftLabel).toHaveAttribute('data-copy-value', 'Default SWIFT');
        });

        it('should render MultiFieldLabelWithCopy when bankName is null', () => {
            const props = createProps({ bankName: null });

            render(<PaymentDetailsSection {...props} />);

            const multiFieldLabel = screen.getByTestId('multi-field-label');
            expect(multiFieldLabel).toHaveAttribute('data-label', 'Bank');
            expect(multiFieldLabel).toHaveAttribute('data-values', 'Bank Name|Bank Street|Bank City Country');
            expect(multiFieldLabel).toHaveAttribute('data-copy-value', 'Bank NameBank StreetBank City Country');

            const paymentLabels = screen.getAllByTestId('payment-label');
            const bankLabel = paymentLabels.find((label) => label.getAttribute('data-label') === 'Bank');
            expect(bankLabel).toBeUndefined();
        });

        it('should render MultiFieldLabelWithCopy when address is null', () => {
            const props = createProps({ address: null });

            render(<PaymentDetailsSection {...props} />);

            const multiFieldLabel = screen.getByTestId('multi-field-label');
            expect(multiFieldLabel).toHaveAttribute('data-label', 'Address');
            expect(multiFieldLabel).toHaveAttribute('data-values', 'Country|City');
            expect(multiFieldLabel).toHaveAttribute('data-copy-value', 'CountryCity');

            const paymentLabels = screen.getAllByTestId('payment-label');
            const addressLabel = paymentLabels.find((label) => label.getAttribute('data-label') === 'Address');
            expect(addressLabel).toBeUndefined();
        });

        it('should handle both bankName and address as null', () => {
            const props = createProps({ bankName: null, address: null });

            render(<PaymentDetailsSection {...props} />);

            const multiFieldLabels = screen.getAllByTestId('multi-field-label');
            expect(multiFieldLabels).toHaveLength(2);

            expect(multiFieldLabels[0]).toHaveAttribute('data-label', 'Bank');
            expect(multiFieldLabels[1]).toHaveAttribute('data-label', 'Address');

            const paymentLabels = screen.getAllByTestId('payment-label');
            expect(paymentLabels).toHaveLength(3);
        });
    });

    describe('rendering with undefined values', () => {
        it('should handle undefined optional props', () => {
            const props = createProps({
                receiverName: undefined,
                bankName: undefined,
                swift: undefined,
                address: undefined,
            });

            render(<PaymentDetailsSection {...props} />);

            expectBasicStructure('Test Payment Details');

            const paymentLabels = screen.getAllByTestId('payment-label');
            expect(paymentLabels).toHaveLength(3);

            const multiFieldLabels = screen.getAllByTestId('multi-field-label');
            expect(multiFieldLabels).toHaveLength(2);
        });
    });

    describe('rendering with empty string values', () => {
        it('should treat empty strings as falsy for conditional rendering', () => {
            const props = createProps({
                receiverName: '',
                bankName: '',
                swift: '',
                address: '',
            });

            render(<PaymentDetailsSection {...props} />);

            expectBasicStructure('Test Payment Details');

            const paymentLabels = screen.getAllByTestId('payment-label');
            expect(paymentLabels).toHaveLength(3);

            const multiFieldLabels = screen.getAllByTestId('multi-field-label');
            expect(multiFieldLabels).toHaveLength(2);
        });
    });

    describe('rendering with edge case titles and values', () => {
        it('should handle empty title', () => {
            const props = createProps({ title: '' });

            render(<PaymentDetailsSection {...props} />);

            const heading = screen.getByRole('heading', { level: 2 });
            expect(heading).toHaveTextContent('');
        });

        it('should handle special characters in values', () => {
            const props = createProps({
                title: 'Title with "quotes" & symbols',
                receiverName: 'Receiver & Co. "Special"',
                bankName: 'Bank <with> tags',
                swift: 'SWIFT/CODE',
                address: 'Address\nwith\nnewlines',
            });

            render(<PaymentDetailsSection {...props} />);

            expectBasicStructure('Title with "quotes" & symbols');

            const paymentLabels = screen.getAllByTestId('payment-label');
            expect(paymentLabels[0]).toHaveAttribute('data-value', 'Receiver & Co. "Special"');
            expect(paymentLabels[2]).toHaveAttribute('data-value', 'SWIFT/CODE');
            expect(paymentLabels[3]).toHaveAttribute('data-value', 'Bank <with> tags');
            expect(paymentLabels[4]).toHaveAttribute('data-value', 'Address\nwith\nnewlines');
        });
    });

    describe('DOM structure validation', () => {
        it('should have correct CSS class structure', () => {
            const props = createProps();

            render(<PaymentDetailsSection {...props} />);

            const block = screen.getByText('Test Payment Details').closest('.abroadPaymentDetailsBlock');
            expect(block).toBeInTheDocument();

            const content = block?.querySelector('.abroadPaymentDetailsContent');
            expect(content).toBeInTheDocument();

            const heading = block?.querySelector('h2');
            expect(heading).toHaveTextContent('Test Payment Details');
        });
    });
});
