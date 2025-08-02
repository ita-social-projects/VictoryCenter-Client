import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { InfiniteScrollList, InfiniteScrollListProps } from './InfiniteScrollList';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

jest.mock('../../../assets/icons/load.svg', () => 'LoaderIcon');
jest.mock('../../../assets/icons/arrow-up.svg', () => 'ArrowUpIcon');
jest.mock('../../../assets/icons/not-found.svg', () => 'NotFoundIcon');

jest.mock('../inline-loader/InlineLoader', () => ({
    InlineLoader: () => <img alt="loader-icon" data-testid="loader-icon" />,
}));

interface MockItem {
    id: number;
    name: string;
}

const mockItems: MockItem[] = [
    { id: 1, name: 'Item 1' },
    { id: 2, name: 'Item 2' },
    { id: 3, name: 'Item 3' },
];

const mockRenderItem = (item: MockItem) => (
    <div key={item.id} data-testid={`item-${item.id}`}>
        {item.name}
    </div>
);

describe('InfiniteScrollList', () => {
    const onLoadMore = jest.fn();
    const emptyMessage = 'No items found';

    const defaultProps: InfiniteScrollListProps<MockItem> = {
        items: mockItems,
        renderItem: mockRenderItem,
        onLoadMore,
        hasMore: true,
        isLoading: false,
        emptyStateMessage: emptyMessage,
    };

    const renderComponent = (props: Partial<InfiniteScrollListProps<MockItem>> = {}) => {
        return render(<InfiniteScrollList {...defaultProps} {...props} />);
    };

    const getScrollContainer = () => screen.getByTestId('infinite-scroll-list');
    const getLoader = () => screen.queryByAltText('loader-icon');
    const getMoveToTopButton = () => screen.queryByAltText(COMMON_TEXT_ADMIN.ALT.SCROLL_TO_TOP);
    const getEmptyState = () => screen.queryByTestId('infinite-scroll-list-not-found');
    const getNotFoundIcon = () => screen.getByAltText(COMMON_TEXT_ADMIN.ALT.NOT_FOUND);

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders items correctly', () => {
        renderComponent();

        expect(screen.getByTestId('item-1')).toBeInTheDocument();
        expect(screen.getByTestId('item-2')).toBeInTheDocument();
        expect(screen.getByTestId('item-3')).toBeInTheDocument();
    });

    it('renders empty state when no items and not loading', () => {
        renderComponent({ items: [], isLoading: false });

        expect(getEmptyState()).toBeInTheDocument();
        expect(screen.getByText(emptyMessage)).toBeInTheDocument();
        expect(getNotFoundIcon()).toBeInTheDocument();
    });

    it('does not render empty state when loading', () => {
        renderComponent({ items: [], isLoading: true });

        expect(getEmptyState()).not.toBeInTheDocument();
    });

    it('shows loader when loading', () => {
        renderComponent({ isLoading: true });

        expect(getLoader()).toBeInTheDocument();
    });

    it('hides loader when not loading', () => {
        renderComponent({ isLoading: false });

        expect(getLoader()).not.toBeInTheDocument();
    });

    it('calls onLoadMore when scrolled near bottom', () => {
        renderComponent({ hasMore: true });
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollHeight', { value: 1000 });
        Object.defineProperty(container, 'clientHeight', { value: 100 });
        Object.defineProperty(container, 'scrollTop', { value: 900 });

        fireEvent.scroll(container);

        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('does not call onLoadMore when hasMore is false', () => {
        renderComponent({ hasMore: false });
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollHeight', { value: 1000 });
        Object.defineProperty(container, 'scrollTop', { value: 990 });
        Object.defineProperty(container, 'clientHeight', { value: 100 });

        fireEvent.scroll(container);

        expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('does not call onLoadMore when loading', () => {
        renderComponent({ hasMore: true, isLoading: true });
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollHeight', { value: 1000 });
        Object.defineProperty(container, 'scrollTop', { value: 990 });
        Object.defineProperty(container, 'clientHeight', { value: 100 });

        fireEvent.scroll(container);

        expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('shows move to top button when scrolled down', () => {
        renderComponent();
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollTop', { value: 100 });

        fireEvent.scroll(container);

        expect(getMoveToTopButton()).toBeInTheDocument();
    });

    it('hides move to top button when at top', () => {
        renderComponent();
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollTop', { value: 0 });

        fireEvent.scroll(container);

        expect(getMoveToTopButton()).not.toBeInTheDocument();
    });

    it('scrolls to top when move to top button is clicked', () => {
        renderComponent();
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollTop', { value: 100, writable: true });

        fireEvent.scroll(container);
        const moveToTopBtn = getMoveToTopButton();
        expect(moveToTopBtn).toBeInTheDocument();

        fireEvent.click(moveToTopBtn!);

        expect(container.scrollTop).toBe(0);
    });

    it('hides move to top button when items array is empty', () => {
        renderComponent({ items: [] });

        expect(getMoveToTopButton()).not.toBeInTheDocument();
    });

    it('scrolls to bottom when loading starts', async () => {
        const { rerender } = renderComponent({ isLoading: false });
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollHeight', { value: 1000, writable: true });
        Object.defineProperty(container, 'scrollTop', { value: 0, writable: true });

        rerender(<InfiniteScrollList {...defaultProps} isLoading={true} />);

        await waitFor(() => {
            expect(container.scrollTop).toBe(1000);
        });
    });

    it('does not scroll when loading but no container ref', () => {
        const { rerender } = renderComponent({ isLoading: false });

        // Mock the ref to be null
        jest.spyOn(React, 'useRef').mockReturnValueOnce({ current: null });

        expect(() => {
            rerender(<InfiniteScrollList {...defaultProps} isLoading={true} />);
        }).not.toThrow();
    });

    it('handles scroll event when container ref is null', () => {
        renderComponent();

        // Simulate null ref in handleOnScroll
        const container = getScrollContainer();

        // Mock the current property to be null during scroll
        Object.defineProperty(container, 'current', { value: null });

        expect(() => {
            fireEvent.scroll(container);
        }).not.toThrow();
    });

    it('calculates distance to bottom correctly with exact threshold', () => {
        renderComponent({ hasMore: true });
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollHeight', { value: 1000 });
        Object.defineProperty(container, 'scrollTop', { value: 895 });
        Object.defineProperty(container, 'clientHeight', { value: 100 });
        // Distance: |1000 - 895 - 100| = 5 (exactly at threshold)

        fireEvent.scroll(container);

        expect(onLoadMore).toHaveBeenCalledTimes(1);
    });

    it('does not call onLoadMore when distance exceeds threshold', () => {
        renderComponent({ hasMore: true });
        const container = getScrollContainer();

        Object.defineProperty(container, 'scrollHeight', { value: 1000 });
        Object.defineProperty(container, 'scrollTop', { value: 800 });
        Object.defineProperty(container, 'clientHeight', { value: 100 });
        // Distance: |1000 - 800 - 100| = 100 (exceeds threshold of 5)

        fireEvent.scroll(container);

        expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('renders with custom renderItem function', () => {
        const customRenderItem = (item: MockItem) => (
            <span key={item.id} data-testid={`custom-${item.id}`}>
                Custom: {item.name}
            </span>
        );

        renderComponent({ renderItem: customRenderItem });

        expect(screen.getByTestId('custom-1')).toBeInTheDocument();
        expect(screen.getByText('Custom: Item 1')).toBeInTheDocument();
    });
});
