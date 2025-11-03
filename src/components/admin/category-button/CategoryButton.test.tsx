import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CategoryButton } from './CategoryButton';

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

describe('CategoryButton', () => {
    it('renders correctly', () => {
        const mockOnSelect = jest.fn();

        render(
            <CategoryButton
                category={mockCategories[0]}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onSelect={mockOnSelect}
            />,
        );

        expect(screen.getByRole('button')).toHaveTextContent('Category 1');
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    it('applies selected class when category is selected', () => {
        const mockOnSelect = jest.fn();
        const selectedCategory = mockCategories[0];

        render(
            <CategoryButton
                category={mockCategories[0]}
                selectedCategory={selectedCategory}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onSelect={mockOnSelect}
            />,
        );

        const button = screen.getByRole('button');
        expect(button).toHaveClass('category-bar-button-selected');
    });

    it('does not apply selected class when category is not selected', () => {
        const mockOnSelect = jest.fn();

        render(
            <CategoryButton
                category={mockCategories[0]}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onSelect={mockOnSelect}
            />,
        );

        const button = screen.getByRole('button');
        expect(button).not.toHaveClass('category-bar-button-selected');
    });

    it('does not apply selected class when different category is selected', () => {
        const mockOnSelect = jest.fn();

        render(
            <CategoryButton
                category={mockCategories[0]}
                selectedCategory={mockCategories[1]}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onSelect={mockOnSelect}
            />,
        );

        const button = screen.getByRole('button');
        expect(button).not.toHaveClass('category-bar-button-selected');
    });

    it('calls onSelect with correct category when clicked', () => {
        const mockOnSelect = jest.fn();

        render(
            <CategoryButton
                category={mockCategories[0]}
                selectedCategory={null}
                getCategoryKey={getCategoryKey}
                getCategoryDisplayName={getCategoryDisplayName}
                onSelect={mockOnSelect}
            />,
        );

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(mockOnSelect).toHaveBeenCalledTimes(1);
        expect(mockOnSelect).toHaveBeenCalledWith(mockCategories[0]);
    });
});
