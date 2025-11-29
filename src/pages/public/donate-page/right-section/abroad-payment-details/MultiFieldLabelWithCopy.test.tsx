import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MultiFieldLabelWithCopy } from './MultiFieldLabelWithCopy';

jest.mock('../../copy-text-button/CopyTextButton', () => ({
    CopyTextButton: ({ textToCopy }: { textToCopy: string }) => (
        <button data-testid="copy-button" data-copy-text={textToCopy}>
            Copy
        </button>
    ),
}));

describe('MultiFieldLabelWithCopy', () => {
    const mockStylesModule = {
        paymentLabel: 'paymentLabel',
        labelWithCopyButton: 'labelWithCopyButton',
        label: 'label',
    };

    const createProps = (overrides = {}) => ({
        label: 'Test Label',
        values: ['Value 1', 'Value 2'],
        copyValue: 'Copy Text',
        stylesModule: mockStylesModule,
        ...overrides,
    });

    const expectCorrectDOMStructure = () => {
        const paymentLabel = screen.getByText('Test Label').closest('.paymentLabel');
        expect(paymentLabel).toBeInTheDocument();

        const labelWithCopyButton = paymentLabel?.querySelector('.labelWithCopyButton');
        expect(labelWithCopyButton).toBeInTheDocument();

        const copyButton = screen.getByTestId('copy-button');
        expect(copyButton).toBeInTheDocument();
    };

    describe('rendering with valid props', () => {
        it('should render label as string correctly', () => {
            const props = createProps();

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Label');
            expectCorrectDOMStructure();
        });

        it('should render multiple values correctly', () => {
            const props = createProps({
                values: ['First Value', 'Second Value', 'Third Value'],
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByText('First Value')).toBeInTheDocument();
            expect(screen.getByText('Second Value')).toBeInTheDocument();
            expect(screen.getByText('Third Value')).toBeInTheDocument();

            const valueParagraphs = screen.getAllByText(/Value/);
            expect(valueParagraphs).toHaveLength(3);
            valueParagraphs.forEach((p) => expect(p).toHaveClass('label'));
        });

        it('should render single value correctly', () => {
            const props = createProps({
                values: ['Single Value'],
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByText('Single Value')).toBeInTheDocument();
            expect(screen.getByText('Single Value')).toHaveClass('label');
        });

        it('should pass correct copyValue to CopyTextButton', () => {
            const props = createProps({
                copyValue: 'Specific Copy Text',
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', 'Specific Copy Text');
        });
    });

    describe('rendering with edge case props', () => {
        it('should handle empty values array', () => {
            const props = createProps({
                values: [],
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByText('Test Label')).toBeInTheDocument();
            expect(screen.getByTestId('copy-button')).toBeInTheDocument();

            const valueParagraphs = screen.queryAllByText(/Value/);
            expect(valueParagraphs).toHaveLength(0);
        });

        it('should handle empty string values', () => {
            const props = createProps({
                values: ['', 'Valid Value', ''],
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            const allParagraphs = screen.getAllByText(
                (content, element) => element?.tagName.toLowerCase() === 'p' && element?.className === 'label',
            );
            expect(allParagraphs).toHaveLength(3);
            expect(screen.getByText('Valid Value')).toBeInTheDocument();
        });

        it('should handle empty copyValue', () => {
            const props = createProps({
                copyValue: '',
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', '');
        });

        it('should handle very long values', () => {
            const longValue = 'A'.repeat(1000);
            const props = createProps({
                values: [longValue, 'Short'],
                copyValue: longValue,
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByText(longValue)).toBeInTheDocument();
            expect(screen.getByText('Short')).toBeInTheDocument();

            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', longValue);
        });
    });

    describe('key generation for values', () => {
        it('should handle duplicate values with unique keys', () => {
            const props = createProps({
                values: ['Duplicate', 'Duplicate', 'Duplicate'],
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            const duplicateElements = screen.getAllByText('Duplicate');
            expect(duplicateElements).toHaveLength(3);
            duplicateElements.forEach((element) => expect(element).toHaveClass('label'));
        });

        it('should handle values that could create conflicting keys', () => {
            const props = createProps({
                values: ['test-0', 'test', 'test-1'],
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByText('test-0')).toBeInTheDocument();
            expect(screen.getByText('test')).toBeInTheDocument();
            expect(screen.getByText('test-1')).toBeInTheDocument();
        });
    });

    describe('DOM structure and CSS classes', () => {
        it('should have correct CSS class structure', () => {
            const props = createProps();

            render(<MultiFieldLabelWithCopy {...props} />);

            const paymentLabel = screen.getByText('Test Label').closest('.paymentLabel');
            expect(paymentLabel).toBeInTheDocument();

            const heading = paymentLabel?.querySelector('h3');
            expect(heading).toBeInTheDocument();

            const labelWithCopyButton = paymentLabel?.querySelector('.labelWithCopyButton');
            expect(labelWithCopyButton).toBeInTheDocument();

            const valueContainer = labelWithCopyButton?.querySelector('div');
            expect(valueContainer).toBeInTheDocument();

            const labelParagraphs = valueContainer?.querySelectorAll('p.label');
            expect(labelParagraphs).toHaveLength(2);
        });

        it('should render heading with correct level', () => {
            const props = createProps();

            render(<MultiFieldLabelWithCopy {...props} />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toHaveTextContent('Test Label');
        });
    });

    describe('component integration', () => {
        it('should integrate correctly with CopyTextButton', () => {
            const props = createProps({
                values: ['Value 1', 'Value 2', 'Value 3'],
                copyValue: 'All values combined',
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByText('Value 1')).toBeInTheDocument();
            expect(screen.getByText('Value 2')).toBeInTheDocument();
            expect(screen.getByText('Value 3')).toBeInTheDocument();

            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', 'All values combined');
        });

        it('should handle null and undefined in values array', () => {
            const props = createProps({
                values: ['Valid', null as any, undefined as any, 'Another Valid'],
            });

            render(<MultiFieldLabelWithCopy {...props} />);

            expect(screen.getByText('Valid')).toBeInTheDocument();
            expect(screen.getByText('Another Valid')).toBeInTheDocument();

            const allParagraphs = screen.getAllByText(
                (content, element) => element?.tagName.toLowerCase() === 'p' && element?.className === 'label',
            );
            expect(allParagraphs).toHaveLength(4);
        });
    });
});
