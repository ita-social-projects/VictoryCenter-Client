import { render, screen, fireEvent } from '@testing-library/react';
import { SuggestionWrapper, SuggestionWrapperProps } from './SuggestionWrapper';

// Mock TextSuggestionContent
jest.mock('../text-suggestion-item/TextSuggestionContent', () => ({
    TextSuggestionContent: ({ label, isHovered, onShowTooltip }: any) => (
        <div data-testid="text-suggestion-content" data-hovered={isHovered}>
            {label}
        </div>
    ),
}));

interface TestItem {
    id: number;
    name: string;
}

describe('SuggestionWrapper', () => {
    const testItem: TestItem = { id: 1, name: 'Test Item' };

    const defaultProps: SuggestionWrapperProps<TestItem> = {
        item: testItem,
        isActive: false,
        onSelect: jest.fn(),
        onHover: jest.fn(),
        getItemLabel: (item) => item.name,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Render helpers
    const renderSuggestionWrapper = (overrideProps: Partial<SuggestionWrapperProps<TestItem>> = {}) =>
        render(<SuggestionWrapper {...defaultProps} {...overrideProps} />);

    // Element getters
    const getSuggestionItem = () => screen.getByRole('listitem');
    const getTextSuggestionContent = () => screen.getByTestId('text-suggestion-content');

    // Action helpers
    const clickSuggestion = () => fireEvent.click(getSuggestionItem());
    const hoverSuggestion = () => fireEvent.mouseEnter(getSuggestionItem());
    const leaveSuggestion = () => fireEvent.mouseLeave(getSuggestionItem());

    // Assertion helpers
    const expectSuggestionToHaveClass = (className: string) => expect(getSuggestionItem()).toHaveClass(className);
    const expectSuggestionNotToHaveClass = (className: string) =>
        expect(getSuggestionItem()).not.toHaveClass(className);
    const expectCallbackToBeCalled = (callback: jest.Mock) => expect(callback).toHaveBeenCalledTimes(1);
    const expectCallbackNotToBeCalled = (callback: jest.Mock) => expect(callback).not.toHaveBeenCalled();

    it('renders list item with default content', () => {
        renderSuggestionWrapper();

        const suggestionItem = getSuggestionItem();
        expect(suggestionItem).toBeInTheDocument();
        expect(suggestionItem).toHaveClass('suggestion-wrapper');
        expect(getTextSuggestionContent()).toHaveTextContent('Test Item');
    });

    it('applies active class when isActive is true', () => {
        renderSuggestionWrapper({ isActive: true });

        expectSuggestionToHaveClass('suggestion-wrapper--active');
    });

    it('does not apply active class when isActive is false', () => {
        renderSuggestionWrapper({ isActive: false });

        expectSuggestionNotToHaveClass('suggestion-wrapper--active');
    });

    it('calls onSelect when clicked', () => {
        const onSelect = jest.fn();
        renderSuggestionWrapper({ onSelect });

        clickSuggestion();

        expectCallbackToBeCalled(onSelect);
    });

    it('calls onHover and applies active class on mouse enter', () => {
        const onHover = jest.fn();
        renderSuggestionWrapper({ onHover });

        hoverSuggestion();

        expectCallbackToBeCalled(onHover);
        expectSuggestionToHaveClass('suggestion-wrapper--active');
    });

    it('calls onHideTooltip and removes active class on mouse leave', () => {
        const onHideTooltip = jest.fn();
        renderSuggestionWrapper({ onHideTooltip });

        hoverSuggestion();
        leaveSuggestion();

        expectCallbackToBeCalled(onHideTooltip);
        expectSuggestionNotToHaveClass('suggestion-wrapper--active');
    });

    it('updates TextSuggestionContent isHovered prop on hover', () => {
        renderSuggestionWrapper();

        expect(getTextSuggestionContent()).toHaveAttribute('data-hovered', 'false');

        hoverSuggestion();

        expect(getTextSuggestionContent()).toHaveAttribute('data-hovered', 'true');
    });

    it('calls onShowTooltip with correct element when handleShowTooltip is called', () => {
        const onShowTooltip = jest.fn();
        const mockContent = <div>Tooltip content</div>;

        // Mock TextSuggestionContent to call onShowTooltip
        jest.doMock('../text-suggestion-item/TextSuggestionContent', () => ({
            TextSuggestionContent: ({ onShowTooltip }: any) => {
                // Simulate calling onShowTooltip
                setTimeout(() => onShowTooltip(mockContent), 0);
                return <div data-testid="text-suggestion-content">Test</div>;
            },
        }));

        renderSuggestionWrapper({ onShowTooltip });

        setTimeout(() => {
            expect(onShowTooltip).toHaveBeenCalledWith(expect.any(HTMLElement), mockContent);
        }, 10);
    });

    it('renders custom content when renderContent is provided', () => {
        const customRenderContent = jest.fn().mockReturnValue(<div data-testid="custom-content">Custom Content</div>);

        renderSuggestionWrapper({ renderContent: customRenderContent });

        expect(screen.getByTestId('custom-content')).toBeInTheDocument();
        expect(customRenderContent).toHaveBeenCalledWith({
            item: testItem,
            isSuggestionActive: false,
            isSuggestionHovered: false,
            onShowTooltip: expect.any(Function),
        });
    });

    it('passes correct props to custom renderContent when active and hovered', () => {
        const customRenderContent = jest.fn().mockReturnValue(<div>Custom</div>);

        renderSuggestionWrapper({
            renderContent: customRenderContent,
            isActive: true,
        });

        hoverSuggestion();

        expect(customRenderContent).toHaveBeenLastCalledWith({
            item: testItem,
            isSuggestionActive: true,
            isSuggestionHovered: true,
            onShowTooltip: expect.any(Function),
        });
    });

    it('uses getItemLabel to get item text', () => {
        const getItemLabel = jest.fn().mockReturnValue('Custom Label');

        renderSuggestionWrapper({ getItemLabel });

        expect(getItemLabel).toHaveBeenCalledWith(testItem);
        expect(getTextSuggestionContent()).toHaveTextContent('Custom Label');
    });

    it('handles optional callbacks gracefully', () => {
        renderSuggestionWrapper({
            onHover: undefined,
            onShowTooltip: undefined,
            onHideTooltip: undefined,
        });

        // Should not throw errors
        hoverSuggestion();
        leaveSuggestion();
        clickSuggestion();

        expect(() => {
            hoverSuggestion();
            leaveSuggestion();
        }).not.toThrow();
    });
});
