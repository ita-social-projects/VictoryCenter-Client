import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryBar, ContextMenuOption } from './CategoryBar';

interface MockCategory {
    id: number;
    name: string;
}

const mockCategories: MockCategory[] = [
    { id: 1, name: 'Category 1' },
    { id: 2, name: 'Category 2' },
    { id: 3, name: 'Category 3' },
];

const getCategoryKey = (category: MockCategory) => category.id;
const getCategoryDisplayName = (category: MockCategory) => category.name;

const mockContextMenuOptions: ContextMenuOption[] = [
    { id: 'option1', name: 'Option 1' },
    { id: 'option2', name: 'Option 2' },
];

describe('CategoryBar', () => {
    it('renders categories', () => {
        const mockOnCategorySelect = jest.fn();

        render(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
            />,
        );

        expect(screen.getByText('Category 1')).toBeInTheDocument();
        expect(screen.getByText('Category 2')).toBeInTheDocument();
        expect(screen.getByText('Category 3')).toBeInTheDocument();
    });

    it('calls onCategorySelect when a category is clicked', () => {
        const mockOnCategorySelect = jest.fn();

        render(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
            />,
        );

        fireEvent.click(screen.getByText('Category 2'));

        expect(mockOnCategorySelect).toHaveBeenCalledTimes(1);
        expect(mockOnCategorySelect).toHaveBeenCalledWith(mockCategories[1]);
    });

    it('does not render context menu button when displayContextMenuButton is false', () => {
        const mockOnCategorySelect = jest.fn();

        render(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
                displayContextMenuButton={false}
                contextMenuOptions={mockContextMenuOptions}
            />,
        );

        expect(screen.queryByRole('button', { name: /option/i })).not.toBeInTheDocument();
    });

    it('renders context menu button when displayContextMenuButton is true and options exist', () => {
        const mockOnCategorySelect = jest.fn();

        render(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
                displayContextMenuButton={true}
                contextMenuOptions={mockContextMenuOptions}
            />,
        );

        expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        expect(screen.getByRole('menu')).toBeInTheDocument();
    });

    it('calls onContextMenuOptionSelected when a context menu option is selected', () => {
        const mockOnCategorySelect = jest.fn();
        const mockOnContextMenuOptionSelected = jest.fn();

        render(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
                displayContextMenuButton={true}
                contextMenuOptions={mockContextMenuOptions}
                onContextMenuOptionSelected={mockOnContextMenuOptionSelected}
            />,
        );

        // Click context menu button
        const buttons = screen.getAllByRole('button');
        fireEvent.click(buttons[0]);

        // Click an option
        const option = screen.getByText('Option 1');
        fireEvent.click(option);

        expect(mockOnContextMenuOptionSelected).toHaveBeenCalledWith('option1');
    });

    it('passes selectedCategory to child CategoryButton components', () => {
        const mockOnCategorySelect = jest.fn();

        const { rerender } = render(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
            />,
        );

        rerender(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={mockCategories[1]}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
            />,
        );

        // Categories container should still exist with updated selection
        const selectedButton = screen.getByRole('button', { name: 'Category 2' });
        expect(selectedButton).toHaveClass('category-bar-button-selected');
    });

    it('handles scroll left correctly', () => {
        const mockOnCategorySelect = jest.fn();
        const { container } = render(
            <CategoryBar
                categories={mockCategories}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onCategorySelect={mockOnCategorySelect}
                scrollAmount={200}
            />,
        );

        const categoriesDiv = container.querySelector('.category-bar-categories') as HTMLDivElement;
        expect(categoriesDiv).toBeInTheDocument();

        Object.defineProperty(categoriesDiv, 'scrollLeft', { value: 100, writable: true });
        Object.defineProperty(categoriesDiv, 'scrollWidth', { value: 1000, writable: true });
        Object.defineProperty(categoriesDiv, 'clientWidth', { value: 800, writable: true });

        fireEvent.scroll(categoriesDiv);

        expect(container.querySelector('.category-bar-arrow-left')).toBeInTheDocument();
    });

    it('cleans up ResizeObserver on unmount', () => {
        const mockOnCategorySelect = jest.fn();
        const disconnectSpy = jest.fn();

        const mockResizeObserver = jest.fn((callback) => ({
            observe: jest.fn(),
            disconnect: disconnectSpy,
            unobserve: jest.fn(),
        }));

        const originalResizeObserver = globalThis.ResizeObserver;

        try {
            globalThis.ResizeObserver = mockResizeObserver;

            const { unmount } = render(
                <CategoryBar
                    categories={mockCategories}
                    selectedCategory={null}
                    getCategoryKey={getCategoryKey}
                    getCategoryDisplayName={getCategoryDisplayName}
                    onCategorySelect={mockOnCategorySelect}
                />,
            );

            unmount();

            expect(mockResizeObserver).toHaveBeenCalledTimes(1);
            expect(disconnectSpy).toHaveBeenCalledTimes(1);
        } finally {
            globalThis.ResizeObserver = originalResizeObserver;
        }
    });
});
