import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { PaymentLabelWithCopy } from './PaymentLabelWithCopy';

jest.mock('../../copy-text-button/CopyTextButton', () => ({
    CopyTextButton: ({ textToCopy }: { textToCopy: string }) => (
        <button data-testid="copy-button" data-copy-text={textToCopy}>
            Copy
        </button>
    ),
}));

describe('PaymentLabelWithCopy', () => {
    const mockStylesModule = {
        'paymentLabel': 'paymentLabel',
        'labelWithCopyButton': 'labelWithCopyButton',
        'label': 'label',
    };

    const createProps = (overrides = {}) => ({
        label: 'Test Label',
        value: 'Test Value',
        copyValue: 'Copy Text',
        stylesModule: mockStylesModule,
        ...overrides,
    });

    const expectCorrectDOMStructure = () => {
        const paymentLabel = screen.getByRole('heading', { level: 3 }).closest('.paymentLabel');
        expect(paymentLabel).toBeInTheDocument();

        const labelWithCopyButton = paymentLabel?.querySelector('.labelWithCopyButton');
        expect(labelWithCopyButton).toBeInTheDocument();

        const valueSpan = labelWithCopyButton?.querySelector('span.label');
        expect(valueSpan).toBeInTheDocument();

        const copyButton = screen.getByTestId('copy-button');
        expect(copyButton).toBeInTheDocument();
    };

    describe('rendering with string props', () => {
        it('should render string label and value correctly', () => {
            const props = createProps();

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Test Label');
            expect(screen.getByText('Test Value')).toBeInTheDocument();
            expect(screen.getByText('Test Value')).toHaveClass('label');
            expectCorrectDOMStructure();
        });

        it('should pass correct copyValue to CopyTextButton', () => {
            const props = createProps({
                copyValue: 'Specific Copy Text',
            });

            render(<PaymentLabelWithCopy {...props} />);

            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', 'Specific Copy Text');
        });
    });

    describe('rendering with React element props', () => {
        it('should render React element as label', () => {
            const props = createProps({
                label: <span data-testid="custom-label">Custom Label Element</span>,
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByTestId('custom-label')).toHaveTextContent('Custom Label Element');
            expect(screen.getByRole('heading', { level: 3 })).toContainElement(screen.getByTestId('custom-label'));
            expectCorrectDOMStructure();
        });

        it('should render React element as value', () => {
            const props = createProps({
                value: <strong data-testid="custom-value">Bold Value</strong>,
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByTestId('custom-value')).toHaveTextContent('Bold Value');
            expect(screen.getByText('Bold Value')).toBeInTheDocument();

            const valueSpan = screen.getByText('Bold Value').closest('span.label');
            expect(valueSpan).toContainElement(screen.getByTestId('custom-value'));
        });

        it('should render complex React elements', () => {
            const complexLabel = (
                <div data-testid="complex-label">
                    <span>Part 1</span>
                    <em>Part 2</em>
                </div>
            );

            const complexValue = (
                <div data-testid="complex-value">
                    <p>Line 1</p>
                    <p>Line 2</p>
                </div>
            );

            const props = createProps({
                label: complexLabel,
                value: complexValue,
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByTestId('complex-label')).toBeInTheDocument();
            expect(screen.getByTestId('complex-value')).toBeInTheDocument();
            expect(screen.getByText('Part 1')).toBeInTheDocument();
            expect(screen.getByText('Part 2')).toBeInTheDocument();
            expect(screen.getByText('Line 1')).toBeInTheDocument();
            expect(screen.getByText('Line 2')).toBeInTheDocument();
        });
    });

    describe('rendering with edge case values', () => {
        it('should handle empty string values', () => {
            const props = createProps({
                label: '',
                value: '',
                copyValue: '',
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('');
            expect(screen.getByTestId('copy-button')).toHaveAttribute('data-copy-text', '');
            expectCorrectDOMStructure();
        });

        it('should handle null and undefined values', () => {
            const props = createProps({
                label: null,
                value: undefined,
            });

            render(<PaymentLabelWithCopy {...props} />);

            expectCorrectDOMStructure();
            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', 'Copy Text');
        });

        it('should handle numeric values', () => {
            const props = createProps({
                label: 123,
                value: 456.78,
                copyValue: '789',
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('123');
            expect(screen.getByText('456.78')).toBeInTheDocument();
            expect(screen.getByTestId('copy-button')).toHaveAttribute('data-copy-text', '789');
        });

        it('should handle special characters in values', () => {
            const props = createProps({
                label: 'Label with "quotes" & symbols',
                value: 'Value <with> tags & entities',
                copyValue: 'Copy\nwith\nnewlines',
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent('Label with "quotes" & symbols');
            expect(screen.getByText('Value <with> tags & entities')).toBeInTheDocument();
            expect(screen.getByTestId('copy-button')).toHaveAttribute('data-copy-text', 'Copy\nwith\nnewlines');
        });

        it('should handle very long values', () => {
            const longLabel = 'A'.repeat(100);
            const longValue = 'B'.repeat(200);
            const longCopyValue = 'C'.repeat(300);

            const props = createProps({
                label: longLabel,
                value: longValue,
                copyValue: longCopyValue,
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByRole('heading', { level: 3 })).toHaveTextContent(longLabel);
            expect(screen.getByText(longValue)).toBeInTheDocument();
            expect(screen.getByTestId('copy-button')).toHaveAttribute('data-copy-text', longCopyValue);
        });
    });

    describe('DOM structure and CSS classes', () => {
        it('should have correct CSS class structure', () => {
            const props = createProps();

            render(<PaymentLabelWithCopy {...props} />);

            const paymentLabel = screen.getByRole('heading', { level: 3 }).closest('.paymentLabel');
            expect(paymentLabel).toBeInTheDocument();

            const heading = paymentLabel?.querySelector('h3');
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Test Label');

            const labelWithCopyButton = paymentLabel?.querySelector('.labelWithCopyButton');
            expect(labelWithCopyButton).toBeInTheDocument();

            const valueSpan = labelWithCopyButton?.querySelector('span.label');
            expect(valueSpan).toBeInTheDocument();
            expect(valueSpan).toHaveTextContent('Test Value');

            const copyButton = labelWithCopyButton?.querySelector('[data-testid="copy-button"]');
            expect(copyButton).toBeInTheDocument();
        });

        it('should render heading with correct level', () => {
            const props = createProps();

            render(<PaymentLabelWithCopy {...props} />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading.tagName).toBe('H3');
            expect(heading).toHaveTextContent('Test Label');
        });
    });

    describe('component integration', () => {
        it('should integrate correctly with CopyTextButton', () => {
            const props = createProps({
                value: 'Display Value',
                copyValue: 'Different Copy Value',
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByText('Display Value')).toBeInTheDocument();

            const copyButton = screen.getByTestId('copy-button');
            expect(copyButton).toHaveAttribute('data-copy-text', 'Different Copy Value');
        });

        it('should handle when value and copyValue are different types', () => {
            const props = createProps({
                value: <span data-testid="react-value">React Element Value</span>,
                copyValue: 'String Copy Value',
            });

            render(<PaymentLabelWithCopy {...props} />);

            expect(screen.getByTestId('react-value')).toHaveTextContent('React Element Value');
            expect(screen.getByTestId('copy-button')).toHaveAttribute('data-copy-text', 'String Copy Value');
        });
    });

    describe('accessibility', () => {
        it('should have proper heading hierarchy', () => {
            const props = createProps({
                label: 'Payment Label',
            });

            render(<PaymentLabelWithCopy {...props} />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toBeInTheDocument();
            expect(heading).toHaveTextContent('Payment Label');
        });

        it('should maintain semantic structure with complex elements', () => {
            const props = createProps({
                label: (
                    <div>
                        <span>Primary</span>
                        <small>Secondary</small>
                    </div>
                ),
                value: (
                    <div>
                        <strong>Important</strong>
                        <span>Normal</span>
                    </div>
                ),
            });

            render(<PaymentLabelWithCopy {...props} />);

            const heading = screen.getByRole('heading', { level: 3 });
            expect(heading).toContainElement(screen.getByText('Primary'));
            expect(heading).toContainElement(screen.getByText('Secondary'));

            const valueSpan = screen.getByText('Important').closest('span.label');
            expect(valueSpan).toContainElement(screen.getByText('Important'));
            expect(valueSpan).toContainElement(screen.getByText('Normal'));
        });
    });
});
