import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CorrespondentBankBlock } from './CorrespondentBankBlock';

jest.mock('../../copy-text-button/CopyTextButton', () => ({
    CopyTextButton: ({ textToCopy }: { textToCopy: string }) => (
        <button data-testid="copy-button" data-copy-text={textToCopy}>
            Copy
        </button>
    ),
}));

describe('CorrespondentBankBlock', () => {
    const createProps = (overrides = {}) => ({
        title: 'Test Bank',
        fields: [
            { label: 'SWIFT', value: 'TESTUS33' },
            { label: 'Account', value: '123456789' },
        ],
        ...overrides,
    });

    const expectCorrectDOMStructure = (title: string, fieldsCount: number) => {
        const paymentLabel = screen.getByRole('heading', { level: 3 }).closest('.paymentLabel');
        expect(paymentLabel).toBeInTheDocument();

        expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(title);

        const labelsContainers = paymentLabel?.querySelector('.labelsContainers');
        expect(labelsContainers).toBeInTheDocument();

        const labelsContainer = labelsContainers?.querySelectorAll('.labelsContainer');
        expect(labelsContainer).toHaveLength(fieldsCount);

        const copyButtons = screen.getAllByTestId('copy-button');
        expect(copyButtons).toHaveLength(fieldsCount);
    };

    describe('rendering with valid props', () => {
        it('should render title and fields correctly', () => {
            const props = createProps();

            render(<CorrespondentBankBlock {...props} />);

            expectCorrectDOMStructure('Test Bank', 2);

            expect(screen.getByText('SWIFT')).toBeInTheDocument();
            expect(screen.getByText('SWIFT')).toHaveClass('highlightedLabel');
            expect(screen.getByText('TESTUS33')).toBeInTheDocument();
            expect(screen.getByText('TESTUS33')).toHaveClass('label');

            expect(screen.getByText('Account')).toBeInTheDocument();
            expect(screen.getByText('Account')).toHaveClass('highlightedLabel');
            expect(screen.getByText('123456789')).toBeInTheDocument();
            expect(screen.getByText('123456789')).toHaveClass('label');

            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons[0]).toHaveAttribute('data-copy-text', 'TESTUS33');
            expect(copyButtons[1]).toHaveAttribute('data-copy-text', '123456789');
        });

        it('should render single field correctly', () => {
            const props = createProps({
                fields: [{ label: 'IBAN', value: 'GB82WEST12345698765432' }],
            });

            render(<CorrespondentBankBlock {...props} />);

            expectCorrectDOMStructure('Test Bank', 1);

            expect(screen.getByText('IBAN')).toHaveClass('highlightedLabel');
            expect(screen.getByText('GB82WEST12345698765432')).toHaveClass('label');

            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', 'GB82WEST12345698765432');
        });

        it('should render multiple fields correctly', () => {
            const props = createProps({
                fields: [
                    { label: 'Bank Name', value: 'Test Bank Corp' },
                    { label: 'SWIFT', value: 'TESTUS33' },
                    { label: 'Account', value: '123456789' },
                    { label: 'IBAN', value: 'GB82WEST12345698765432' },
                    { label: 'Address', value: '123 Test Street' },
                ],
            });

            render(<CorrespondentBankBlock {...props} />);

            expectCorrectDOMStructure('Test Bank', 5);

            const labels = ['Bank Name', 'SWIFT', 'Account', 'IBAN', 'Address'];
            const values = ['Test Bank Corp', 'TESTUS33', '123456789', 'GB82WEST12345698765432', '123 Test Street'];

            labels.forEach((label) => {
                expect(screen.getByText(label)).toHaveClass('highlightedLabel');
            });

            values.forEach((value) => {
                expect(screen.getByText(value)).toHaveClass('label');
            });

            const copyButtons = screen.getAllByTestId('copy-button');
            values.forEach((value, index) => {
                expect(copyButtons[index]).toHaveAttribute('data-copy-text', value);
            });
        });
    });

    describe('rendering with edge case props', () => {
        it('should handle empty fields array', () => {
            const props = createProps({
                fields: [],
            });

            render(<CorrespondentBankBlock {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Bank');

            const labelsContainers = screen
                .getByRole('heading', { level: 3 })
                .closest('.paymentLabel')
                ?.querySelector('.labelsContainers');
            expect(labelsContainers).toBeInTheDocument();

            const labelsContainer = labelsContainers?.querySelectorAll('.labelsContainer');
            expect(labelsContainer).toHaveLength(0);

            expect(screen.queryByTestId('copy-button')).not.toBeInTheDocument();
        });

        it('should handle empty string values', () => {
            const props = createProps({
                fields: [
                    { label: '', value: '' },
                    { label: 'Valid Label', value: 'Valid Value' },
                    { label: 'Empty Value', value: '' },
                ],
            });

            render(<CorrespondentBankBlock {...props} />);

            expectCorrectDOMStructure('Test Bank', 3);

            expect(screen.getByText('Valid Label')).toHaveClass('highlightedLabel');
            expect(screen.getByText('Valid Value')).toHaveClass('label');
            expect(screen.getByText('Empty Value')).toHaveClass('highlightedLabel');

            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons[0]).toHaveAttribute('data-copy-text', '');
            expect(copyButtons[1]).toHaveAttribute('data-copy-text', 'Valid Value');
            expect(copyButtons[2]).toHaveAttribute('data-copy-text', '');
        });

        it('should handle empty title', () => {
            const props = createProps({
                title: '',
            });

            render(<CorrespondentBankBlock {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('');
            expectCorrectDOMStructure('', 2);
        });

        it('should handle very long values', () => {
            const longLabel = 'A'.repeat(100);
            const longValue = 'B'.repeat(200);

            const props = createProps({
                fields: [
                    { label: longLabel, value: longValue },
                    { label: 'Short', value: 'Short' },
                ],
            });

            render(<CorrespondentBankBlock {...props} />);

            expect(screen.getByText(longLabel)).toHaveClass('highlightedLabel');
            expect(screen.getByText(longValue)).toHaveClass('label');

            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons[0]).toHaveAttribute('data-copy-text', longValue);
        });
    });

    describe('key generation for fields', () => {
        it('should handle duplicate field values with unique keys', () => {
            const props = createProps({
                fields: [
                    { label: 'Label1', value: 'Duplicate' },
                    { label: 'Label2', value: 'Duplicate' },
                    { label: 'Label3', value: 'Duplicate' },
                ],
            });

            render(<CorrespondentBankBlock {...props} />);

            expectCorrectDOMStructure('Test Bank', 3);

            const duplicateElements = screen.getAllByText('Duplicate');
            expect(duplicateElements).toHaveLength(3);
            duplicateElements.forEach((element) => expect(element).toHaveClass('label'));

            const labelElements = screen.getAllByText(/Label[123]/);
            expect(labelElements).toHaveLength(3);
            labelElements.forEach((element) => expect(element).toHaveClass('highlightedLabel'));
        });

        it('should handle fields that could create conflicting keys', () => {
            const props = createProps({
                fields: [
                    { label: 'test-0', value: 'value-0' },
                    { label: 'test', value: 'value' },
                    { label: 'test-1', value: 'value-1' },
                ],
            });

            render(<CorrespondentBankBlock {...props} />);

            expect(screen.getByText('test-0')).toBeInTheDocument();
            expect(screen.getByText('test')).toBeInTheDocument();
            expect(screen.getByText('test-1')).toBeInTheDocument();
            expect(screen.getByText('value-0')).toBeInTheDocument();
            expect(screen.getByText('value')).toBeInTheDocument();
            expect(screen.getByText('value-1')).toBeInTheDocument();
        });
    });

    describe('DOM structure and CSS classes', () => {
        it('should have correct CSS class structure', () => {
            const props = createProps();

            render(<CorrespondentBankBlock {...props} />);

            const paymentLabel = screen.getByRole('heading', { level: 3 }).closest('.paymentLabel');
            expect(paymentLabel).toBeInTheDocument();

            const heading = paymentLabel?.querySelector('h3');
            expect(heading).toBeInTheDocument();

            const labelsContainers = paymentLabel?.querySelector('.labelsContainers');
            expect(labelsContainers).toBeInTheDocument();

            const labelsContainer = labelsContainers?.querySelectorAll('.labelsContainer');
            expect(labelsContainer).toHaveLength(2);

            labelsContainer?.forEach((container) => {
                const labelWithCopyButton = container.querySelector('.labelWithCopyButton');
                expect(labelWithCopyButton).toBeInTheDocument();

                const highlightedLabel = labelWithCopyButton?.querySelector('.highlightedLabel');
                expect(highlightedLabel).toBeInTheDocument();

                const label = labelWithCopyButton?.querySelector('.label');
                expect(label).toBeInTheDocument();

                const copyButton = labelWithCopyButton?.querySelector('[data-testid="copy-button"]');
                expect(copyButton).toBeInTheDocument();
            });
        });

        it('should render heading with correct level', () => {
            const props = createProps({
                title: 'Bank Title',
            });

            render(<CorrespondentBankBlock {...props} />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading.tagName).toBe('H3');
            expect(heading).toHaveTextContent('Bank Title');
        });
    });

    describe('component integration', () => {
        it('should integrate correctly with CopyTextButton for each field', () => {
            const props = createProps({
                fields: [
                    { label: 'First', value: 'First Value' },
                    { label: 'Second', value: 'Second Value' },
                    { label: 'Third', value: 'Third Value' },
                ],
            });

            render(<CorrespondentBankBlock {...props} />);

            const copyButtons = screen.getAllByTestId('copy-button');
            expect(copyButtons).toHaveLength(3);

            expect(copyButtons[0]).toHaveAttribute('data-copy-text', 'First Value');
            expect(copyButtons[1]).toHaveAttribute('data-copy-text', 'Second Value');
            expect(copyButtons[2]).toHaveAttribute('data-copy-text', 'Third Value');

            expect(screen.getByText('First')).toHaveClass('highlightedLabel');
            expect(screen.getByText('First Value')).toHaveClass('label');
        });
    });
});
