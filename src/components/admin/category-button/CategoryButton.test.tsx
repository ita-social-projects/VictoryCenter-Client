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

    describe('Different data types', () => {
        interface StringCategory {
            key: string;
            label: string;
        }

        const stringCategories: StringCategory[] = [
            { key: 'cat-a', label: 'Category A' },
            { key: 'cat-b', label: 'Category B' },
        ];

        const getStringCategoryKey = (category: StringCategory) => category.key;
        const getStringCategoryDisplayName = (category: StringCategory) => category.label;

        it('works with string keys', () => {
            const mockOnSelect = jest.fn();

            render(
                <CategoryButton
                    category={stringCategories[0]}
                    selectedCategory={stringCategories[0]}
                    getCategoryKey={getStringCategoryKey}
                    getCategoryDisplayName={getStringCategoryDisplayName}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Category A');
            expect(button).toHaveClass('category-bar-button-selected');
        });

        it('handles complex objects correctly', () => {
            const mockOnSelect = jest.fn();
            const complexCategory = {
                id: 'complex-1',
                metadata: { nested: true },
                displayName: 'Complex Category',
            };

            const getComplexKey = (cat: typeof complexCategory) => cat.id;
            const getComplexName = (cat: typeof complexCategory) => cat.displayName;

            render(
                <CategoryButton
                    category={complexCategory}
                    selectedCategory={null}
                    getCategoryKey={getComplexKey}
                    getCategoryDisplayName={getComplexName}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Complex Category');

            fireEvent.click(button);
            expect(mockOnSelect).toHaveBeenCalledWith(complexCategory);
        });
    });

    describe('Edge cases', () => {
        it('handles empty string display name', () => {
            const mockOnSelect = jest.fn();
            const emptyCategory = { id: 1, name: '' };

            render(
                <CategoryButton
                    category={emptyCategory}
                    selectedCategory={null}
                    getCategoryKey={(cat) => cat.id}
                    getCategoryDisplayName={(cat) => cat.name}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('');
            expect(button).toBeInTheDocument();
        });

        it('handles special characters in display name', () => {
            const mockOnSelect = jest.fn();
            const specialCategory = { id: 1, name: 'Category & <Special> "Chars"' };

            render(
                <CategoryButton
                    category={specialCategory}
                    selectedCategory={null}
                    getCategoryKey={(cat) => cat.id}
                    getCategoryDisplayName={(cat) => cat.name}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent('Category & <Special> "Chars"');
        });

        it('handles numeric keys of 0', () => {
            const mockOnSelect = jest.fn();
            const zeroCategory = { id: 0, name: 'Zero Category' };

            render(
                <CategoryButton
                    category={zeroCategory}
                    selectedCategory={zeroCategory}
                    getCategoryKey={(cat) => cat.id}
                    getCategoryDisplayName={(cat) => cat.name}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('category-bar-button-selected');
        });

        it('handles very long category names', () => {
            const mockOnSelect = jest.fn();
            const longName = 'A'.repeat(100);
            const longCategory = { id: 1, name: longName };

            render(
                <CategoryButton
                    category={longCategory}
                    selectedCategory={null}
                    getCategoryKey={(cat) => cat.id}
                    getCategoryDisplayName={(cat) => cat.name}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveTextContent(longName);
        });
    });

    describe('Multiple clicks', () => {
        it('calls onSelect multiple times when clicked multiple times', () => {
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
            fireEvent.click(button);
            fireEvent.click(button);

            expect(mockOnSelect).toHaveBeenCalledTimes(3);
            expect(mockOnSelect).toHaveBeenNthCalledWith(1, mockCategories[0]);
            expect(mockOnSelect).toHaveBeenNthCalledWith(2, mockCategories[0]);
            expect(mockOnSelect).toHaveBeenNthCalledWith(3, mockCategories[0]);
        });

        it('can be clicked when already selected', () => {
            const mockOnSelect = jest.fn();

            render(
                <CategoryButton
                    category={mockCategories[0]}
                    selectedCategory={mockCategories[0]}
                    getCategoryKey={getCategoryKey}
                    getCategoryDisplayName={getCategoryDisplayName}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            fireEvent.click(button);

            expect(mockOnSelect).toHaveBeenCalledWith(mockCategories[0]);
        });
    });

    describe('CSS classes', () => {
        it('always applies base category-bar-button class', () => {
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
            expect(button).toHaveClass('category-bar-button');
        });

        it('applies both base and selected classes when selected', () => {
            const mockOnSelect = jest.fn();

            render(
                <CategoryButton
                    category={mockCategories[0]}
                    selectedCategory={mockCategories[0]}
                    getCategoryKey={getCategoryKey}
                    getCategoryDisplayName={getCategoryDisplayName}
                    onSelect={mockOnSelect}
                />,
            );

            const button = screen.getByRole('button');
            expect(button).toHaveClass('category-bar-button');
            expect(button).toHaveClass('category-bar-button-selected');
        });
    });

    describe('Component memoization', () => {
        it('does not re-render with same props', () => {
            const mockOnSelect = jest.fn();
            const { rerender } = render(
                <CategoryButton
                    category={mockCategories[0]}
                    selectedCategory={null}
                    getCategoryKey={getCategoryKey}
                    getCategoryDisplayName={getCategoryDisplayName}
                    onSelect={mockOnSelect}
                />,
            );

            const initialButton = screen.getByRole('button');

            // Re-render with same props
            rerender(
                <CategoryButton
                    category={mockCategories[0]}
                    selectedCategory={null}
                    getCategoryKey={getCategoryKey}
                    getCategoryDisplayName={getCategoryDisplayName}
                    onSelect={mockOnSelect}
                />,
            );

            const reRenderedButton = screen.getByRole('button');
            expect(reRenderedButton).toBe(initialButton);
        });
    });

    describe('Error handling', () => {
        it('handles function errors gracefully in getCategoryKey', () => {
            const mockOnSelect = jest.fn();
            const faultyGetKey = jest.fn(() => {
                throw new Error('Key extraction failed');
            });

            expect(() => {
                render(
                    <CategoryButton
                        category={mockCategories[0]}
                        selectedCategory={null}
                        getCategoryKey={faultyGetKey}
                        getCategoryDisplayName={getCategoryDisplayName}
                        onSelect={mockOnSelect}
                    />,
                );
            }).toThrow('Key extraction failed');
        });

        it('handles function errors gracefully in getCategoryDisplayName', () => {
            const mockOnSelect = jest.fn();
            const faultyGetName = jest.fn(() => {
                throw new Error('Name extraction failed');
            });

            expect(() => {
                render(
                    <CategoryButton
                        category={mockCategories[0]}
                        selectedCategory={null}
                        getCategoryKey={getCategoryKey}
                        getCategoryDisplayName={faultyGetName}
                        onSelect={mockOnSelect}
                    />,
                );
            }).toThrow('Name extraction failed');
        });
    });
});
