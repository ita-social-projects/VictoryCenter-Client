import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentDetailsSection } from './PaymentDetailsSection';

jest.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const map: Record<string, string> = {
                PAYMENT_DETAILS_COMMON_RECIPIENT_LABEL: 'Recipient',
                SWIFT_CODE_LABEL: 'SWIFT Code',
                BANK_RECEIVER_LABEL: 'Bank',
                ADDRESS_LABEL: 'Address',
            };

            return map[key] ?? key;
        },
    }),
}));

jest.mock('./PaymentLabelWithCopy', () => ({
    PaymentLabelWithCopy: ({ label, value, copyValue }: { label: string; value: string; copyValue: string }) => (
        <div data-testid="payment-label" data-label={label} data-value={value} data-copy-value={copyValue} />
    ),
}));

jest.mock('./MultiFieldLabelWithCopy', () => ({
    MultiFieldLabelWithCopy: ({ label, values, copyValue }: { label: string; values: string[]; copyValue: string }) => (
        <div
            data-testid="multi-field-label"
            data-label={label}
            data-values={values.join('|')}
            data-copy-value={copyValue}
        />
    ),
}));

jest.mock('@/const/public/donate-page', () => ({
    PAYMENT_DETAILS_COMMON: {
        RECIPIENT_NAME_LABEL: 'Default Recipient Name',
    },
    ABROAD_PAYMENT_DETAILS: {
        SWIFT_CODE_VALUE_LABEL: 'Default SWIFT',
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

    it('renders all fields when all props provided', () => {
        render(<PaymentDetailsSection {...createProps()} />);

        const labels = screen.getAllByTestId('payment-label');
        expect(labels).toHaveLength(5);

        expect(labels[0]).toHaveAttribute('data-label', 'Recipient');
        expect(labels[0]).toHaveAttribute('data-value', 'Test Receiver');

        expect(labels[1]).toHaveAttribute('data-label', 'IBAN (USD)');
        expect(labels[1]).toHaveAttribute('data-value', 'US1234567890123456789012');

        expect(labels[2]).toHaveAttribute('data-label', 'SWIFT Code');
        expect(labels[2]).toHaveAttribute('data-value', 'TESTUS33');

        expect(labels[3]).toHaveAttribute('data-label', 'Bank');
        expect(labels[3]).toHaveAttribute('data-value', 'Test Bank');

        expect(labels[4]).toHaveAttribute('data-label', 'Address');
        expect(labels[4]).toHaveAttribute('data-value', 'Test Address');

        expect(screen.queryByTestId('multi-field-label')).not.toBeInTheDocument();
    });

    it('uses default recipient when receiverName is null', () => {
        render(<PaymentDetailsSection {...createProps({ receiverName: null })} />);

        const label = screen.getAllByTestId('payment-label')[0];
        expect(label).toHaveAttribute('data-value', 'Default Recipient Name');
    });

    it('uses default swift when swift is null', () => {
        render(<PaymentDetailsSection {...createProps({ swift: null })} />);

        const swiftLabel = screen
            .getAllByTestId('payment-label')
            .find((el) => el.getAttribute('data-label') === 'SWIFT Code');

        expect(swiftLabel).toHaveAttribute('data-value', 'Default SWIFT');
    });

    it('renders MultiFieldLabelWithCopy when bankName is null', () => {
        render(<PaymentDetailsSection {...createProps({ bankName: null })} />);

        const multi = screen.getByTestId('multi-field-label');
        expect(multi).toHaveAttribute('data-label', 'Bank');
        expect(multi).toHaveAttribute('data-values', 'Bank Name|Bank Street|Bank City Country');
    });

    it('renders MultiFieldLabelWithCopy when address is null', () => {
        render(<PaymentDetailsSection {...createProps({ address: null })} />);

        const multi = screen.getByTestId('multi-field-label');
        expect(multi).toHaveAttribute('data-label', 'Address');
        expect(multi).toHaveAttribute('data-values', 'Country|City');
    });

    it('renders two MultiFieldLabelWithCopy when bankName and address are null', () => {
        render(<PaymentDetailsSection {...createProps({ bankName: null, address: null })} />);

        const multi = screen.getAllByTestId('multi-field-label');
        expect(multi).toHaveLength(2);

        expect(multi[0]).toHaveAttribute('data-label', 'Bank');
        expect(multi[1]).toHaveAttribute('data-label', 'Address');
    });
});
