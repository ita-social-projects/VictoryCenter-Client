import React, { createRef, forwardRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import {
    SuggestionWrapper,
    SuggestionWrapperProps,
    SuggestionWrapperRef,
    SuggestionContentRef,
    SuggestionContentRenderProps,
} from './SuggestionWrapper';

interface TestItem {
    id: number;
    name: string;
}

const defaultProps: SuggestionWrapperProps<TestItem> = {
    item: { id: 1, name: 'Test Item' },
    isActive: false,
    onSelect: jest.fn(),
    onHover: jest.fn(),
    getItemLabel: (item: TestItem) => item.name,
};

const renderComponent = (props: Partial<SuggestionWrapperProps<TestItem>> = {}) => {
    const finalProps: SuggestionWrapperProps<TestItem> = { ...defaultProps, ...props };
    const ref = createRef<SuggestionWrapperRef>();

    const view = render(<SuggestionWrapper {...finalProps} ref={ref} />);

    return { ref, ...view };
};

const MockRenderContent = forwardRef<SuggestionContentRef, SuggestionContentRenderProps<TestItem>>(
    ({ item, isSuggestionActive, isSuggestionHovered }, ref) => (
        <div
            data-testid="custom-content"
            data-active={isSuggestionActive}
            data-hovered={isSuggestionHovered}
            ref={ref as any}
        >
            {item.name}
        </div>
    ),
);

describe('SuggestionWrapper', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const getItem = () => screen.getByRole('button') as HTMLLIElement;

    it('should render default text suggestion content', () => {
        renderComponent();

        expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('should render custom content when renderContent is provided', () => {
        renderComponent({ renderContent: MockRenderContent });

        expect(screen.getByTestId('custom-content')).toBeInTheDocument();
        expect(screen.getByText('Test Item')).toBeInTheDocument();
    });

    it('should apply active class when isActive is true', () => {
        renderComponent({ isActive: true });

        const listItem: HTMLLIElement = getItem();
        expect(listItem).toHaveClass('suggestion-wrapper--active');
    });

    it('should call onSelect when clicked', () => {
        const onSelectMock = jest.fn();
        renderComponent({ onSelect: onSelectMock });

        fireEvent.click(getItem());

        expect(onSelectMock).toHaveBeenCalledTimes(1);
    });

    it('should call onHover with element on mouse enter', () => {
        const onHoverMock = jest.fn();
        renderComponent({ onHover: onHoverMock });

        const listItem: HTMLLIElement = getItem();
        fireEvent.mouseEnter(listItem);

        expect(onHoverMock).toHaveBeenCalledTimes(1);
        expect(onHoverMock).toHaveBeenCalledWith(listItem);
    });

    it('should call onMouseLeave when mouse leaves', () => {
        const onMouseLeaveMock = jest.fn();
        renderComponent({ onMouseLeave: onMouseLeaveMock });

        fireEvent.mouseLeave(getItem());

        expect(onMouseLeaveMock).toHaveBeenCalledTimes(1);
    });

    it('should apply active class on hover', () => {
        renderComponent();

        const listItem: HTMLLIElement = getItem();
        fireEvent.mouseEnter(listItem);

        expect(listItem).toHaveClass('suggestion-wrapper--active');
    });

    it('should remove active class when mouse leaves after hover', () => {
        renderComponent();

        const listItem: HTMLLIElement = getItem();
        fireEvent.mouseEnter(listItem);
        fireEvent.mouseLeave(listItem);

        expect(listItem).not.toHaveClass('suggestion-wrapper--active');
    });

    it('should pass correct props to custom render content', () => {
        renderComponent({
            renderContent: MockRenderContent,
            isActive: true,
        });

        const customContent: HTMLElement = screen.getByTestId('custom-content');
        fireEvent.mouseEnter(getItem());

        expect(customContent).toHaveAttribute('data-active', 'true');
        expect(customContent).toHaveAttribute('data-hovered', 'true');
    });

    it('should forward tooltip content from content ref', () => {
        const { ref } = renderComponent();

        const contentElement = screen.getByText('Test Item').closest('span');

        if (contentElement) {
            Object.defineProperty(contentElement, 'scrollWidth', { value: 200 });
            Object.defineProperty(contentElement, 'clientWidth', { value: 100 });
        }

        const tooltipContent = ref.current?.getTooltipContent();

        expect(tooltipContent).toBeDefined();
    });

    it('should return null tooltip when content ref has no tooltip', () => {
        const { ref } = renderComponent();

        const contentElement = screen.getByText('Test Item').closest('span');

        if (contentElement) {
            Object.defineProperty(contentElement, 'scrollWidth', { value: 100 });
            Object.defineProperty(contentElement, 'clientWidth', { value: 100 });
        }

        const tooltipContent = ref.current?.getTooltipContent();

        expect(tooltipContent).toBeNull();
    });
});
