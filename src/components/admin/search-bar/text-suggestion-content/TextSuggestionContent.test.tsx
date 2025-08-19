import React from 'react';
import { render, screen } from '@testing-library/react';
import { TextSuggestionContent, TextSuggestionContentProps } from './TextSuggestionContent';
import { useObserveElementSize } from '../../../../hooks/common/use-observe-element-size/useObserveElementSize';

jest.mock('../../../../hooks/common/use-observe-element-size/useObserveElementSize');
const mockUseObserveElementSize = useObserveElementSize as jest.MockedFunction<typeof useObserveElementSize>;

describe('TextSuggestionContent', () => {
    const defaultProps: TextSuggestionContentProps = {
        label: 'Test label',
        isHovered: false,
        onShowTooltip: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Render helpers
    const renderTextSuggestionContent = (overrideProps: Partial<TextSuggestionContentProps> = {}) =>
        render(<TextSuggestionContent {...defaultProps} {...overrideProps} />);

    // Element getters
    const getTextSpan = () => screen.getByText(defaultProps.label);

    // Mock helpers
    const mockScrollWidth = (element: HTMLElement, scrollWidth: number) => {
        Object.defineProperty(element, 'scrollWidth', {
            configurable: true,
            value: scrollWidth,
        });
    };

    const mockClientWidth = (element: HTMLElement, clientWidth: number) => {
        Object.defineProperty(element, 'clientWidth', {
            configurable: true,
            value: clientWidth,
        });
    };

    const simulateOverflowingText = (element: HTMLElement) => {
        mockScrollWidth(element, 200);
        mockClientWidth(element, 100);
    };

    const simulateNonOverflowingText = (element: HTMLElement) => {
        mockScrollWidth(element, 100);
        mockClientWidth(element, 200);
    };

    // Assertion helpers
    const expectHookToBeCalledWith = (expectedParams: any) => {
        expect(mockUseObserveElementSize).toHaveBeenCalledWith(expectedParams);
    };

    it('renders text with correct label and class', () => {
        renderTextSuggestionContent();

        const textSpan = getTextSpan();
        expect(textSpan).toBeInTheDocument();
        expect(textSpan).toHaveClass('text-suggestion-content');
    });

    it('calls hook with correct parameters when not hovered', () => {
        renderTextSuggestionContent({ isHovered: false });

        expectHookToBeCalledWith(
            expect.objectContaining({
                observableElement: expect.any(Object),
                onSizeChanged: expect.any(Function),
                disableWhen: true,
            }),
        );
    });

    it('calls hook with correct parameters when hovered', () => {
        renderTextSuggestionContent({ isHovered: true });

        expectHookToBeCalledWith(
            expect.objectContaining({
                observableElement: expect.any(Object),
                onSizeChanged: expect.any(Function),
                disableWhen: false,
            }),
        );
    });

    it('shows tooltip when text is overflowing', () => {
        const onShowTooltip = jest.fn();
        renderTextSuggestionContent({ onShowTooltip });

        const textSpan = getTextSpan();

        simulateOverflowingText(textSpan);

        const hookCall = mockUseObserveElementSize.mock.calls[0][0];
        hookCall.onSizeChanged?.({ width: 100, height: 20 });

        expect(onShowTooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'div',
                props: {
                    className: 'text-suggestion-content__tooltip',
                    children: defaultProps.label,
                },
            }),
        );
    });

    it('does not show tooltip when text is not overflowing', () => {
        const onShowTooltip = jest.fn();
        renderTextSuggestionContent({ onShowTooltip });

        const textSpan = getTextSpan();

        simulateNonOverflowingText(textSpan);

        const hookCall = mockUseObserveElementSize.mock.calls[0][0];
        hookCall.onSizeChanged?.({ width: 200, height: 20 });

        expect(onShowTooltip).toHaveBeenCalledWith(null);
    });

    it('creates tooltip content with custom label', () => {
        const customLabel = 'Custom tooltip text';
        const onShowTooltip = jest.fn();
        renderTextSuggestionContent({ label: customLabel, onShowTooltip });

        const textSpan = screen.getByText(customLabel);

        simulateOverflowingText(textSpan);

        const hookCall = mockUseObserveElementSize.mock.calls[0][0];
        hookCall.onSizeChanged?.({ width: 100, height: 20 });

        expect(onShowTooltip).toHaveBeenCalledWith(
            expect.objectContaining({
                type: 'div',
                props: {
                    className: 'text-suggestion-content__tooltip',
                    children: customLabel,
                },
            }),
        );
    });
});
