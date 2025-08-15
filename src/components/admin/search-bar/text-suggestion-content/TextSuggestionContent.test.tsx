import { render, screen } from '@testing-library/react';
import { TextSuggestionContent, TextSuggestionContentProps } from './TextSuggestionContent';

// Mock ResizeObserver
const mockObserve = jest.fn();
const mockDisconnect = jest.fn();
const mockUnobserve = jest.fn();

class MockResizeObserver {
    observe = mockObserve;
    disconnect = mockDisconnect;
    unobserve = mockUnobserve;
}

global.ResizeObserver = MockResizeObserver as any;

describe('TextSuggestionContent', () => {
    const defaultProps: TextSuggestionContentProps = {
        label: 'Test suggestion text',
        isHovered: false,
        onShowTooltip: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        mockObserve.mockClear();
        mockDisconnect.mockClear();
        mockUnobserve.mockClear();
    });

    // Render helpers
    const renderTextSuggestionContent = (overrideProps: Partial<TextSuggestionContentProps> = {}) =>
        render(<TextSuggestionContent {...defaultProps} {...overrideProps} />);

    // Element getters
    const getTextSpan = () => screen.getByText(defaultProps.label);

    // Mock helpers
    const mockScrollWidth = (element: HTMLElement, width: number) => {
        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: width,
        });
    };

    const mockClientWidth = (element: HTMLElement, width: number) => {
        Object.defineProperty(element, 'clientWidth', {
            configurable: true,
            value: width,
        });
    };

    const mockOverflow = (element: HTMLElement, hasOverflow: boolean) => {
        mockScrollWidth(element, hasOverflow ? 200 : 100);
        mockClientWidth(element, 100);
    };

    // Assertion helpers
    const expectTooltipNotToBeCalled = () => expect(defaultProps.onShowTooltip).not.toHaveBeenCalled();

    it('renders text span with correct class and content', () => {
        renderTextSuggestionContent();

        const textSpan = getTextSpan();
        expect(textSpan).toBeInTheDocument();
        expect(textSpan).toHaveClass('text-suggestion-content');
        expect(textSpan).toHaveTextContent('Test suggestion text');
    });

    it('does not show tooltip when not hovered', () => {
        renderTextSuggestionContent({ isHovered: false });

        expectTooltipNotToBeCalled();
    });

    it('does not show tooltip when hovered but no overflow', () => {
        renderTextSuggestionContent({ isHovered: true });

        const textSpan = getTextSpan();
        mockOverflow(textSpan, false);

        expectTooltipNotToBeCalled();
    });

    it('shows tooltip when hovered and has overflow', () => {
        const onShowTooltip = jest.fn();

        const { rerender } = renderTextSuggestionContent({
            isHovered: false,
            onShowTooltip,
        });

        const textSpan = getTextSpan();
        mockOverflow(textSpan, true);

        // Re-render with isHovered: true to trigger useEffect
        rerender(<TextSuggestionContent label="Test suggestion text" isHovered={true} onShowTooltip={onShowTooltip} />);

        expect(onShowTooltip).toHaveBeenCalledTimes(1);
        const callArg = onShowTooltip.mock.calls[0][0];
        expect(callArg.type).toBe('div');
        expect(callArg.props.className).toBe('text-suggestion-content__tooltip');
        expect(callArg.props.children).toBe('Test suggestion text');
    });

    it('sets up ResizeObserver on mount', () => {
        renderTextSuggestionContent();

        expect(mockObserve).toHaveBeenCalled();
    });

    it('cleans up ResizeObserver on unmount', () => {
        const { unmount } = renderTextSuggestionContent();

        unmount();

        expect(mockDisconnect).toHaveBeenCalled();
    });

    it('updates tooltip content when label changes', () => {
        const onShowTooltip = jest.fn();

        const { rerender } = renderTextSuggestionContent({
            isHovered: false,
            onShowTooltip,
            label: 'First label',
        });

        const textSpan = screen.getByText('First label');
        mockOverflow(textSpan, true);

        rerender(<TextSuggestionContent isHovered={true} onShowTooltip={onShowTooltip} label="Second label" />);

        expect(onShowTooltip).toHaveBeenCalledTimes(1);
        const callArg = onShowTooltip.mock.calls[0][0];
        expect(callArg.props.children).toBe('Second label');
    });
});
