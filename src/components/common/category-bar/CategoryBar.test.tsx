import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryBar } from './CategoryBar';

interface MockContextMenuButtonProps {
    children: React.ReactNode;
    onOptionSelected?: (value: string, data?: any) => void;
}

interface MockContextMenuButtonOptionProps {
    children: React.ReactNode;
    value: string;
}

jest.mock('../context-menu/ContextMenuButton', () => {
    const React = require('react');

    const MockContextMenuButton = ({ children, onOptionSelected }: MockContextMenuButtonProps) => (
        <div data-testid="context-menu" onClick={() => onOptionSelected?.('test-option')}>
            {children}
        </div>
    );

    MockContextMenuButton.Option = ({ children, value }: MockContextMenuButtonOptionProps) => (
        <div data-testid={`context-menu-option-${value}`}>{children}</div>
    );

    return {
        ContextMenuButton: MockContextMenuButton,
    };
});

interface MockContextMenuOption {
    id: number;
    title: string;
}

describe('CategoryBar', () => {
    const mockCategories: MockContextMenuOption[] = [
        { id: 1, title: 'Category 1' },
        { id: 2, title: 'Category 2' },
        { id: 3, title: 'Category 3' },
    ];

    const defaultProps = {
        categories: mockCategories,
        selectedCategory: undefined,
        getItemName: (item: MockContextMenuOption) => item.title,
        getItemKey: (item: MockContextMenuOption) => item.id,
        onCategorySelect: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the category bar with correct class name', () => {
        render(<CategoryBar {...defaultProps} />);
        const categoryBar = document.querySelector('.category-bar');
        expect(categoryBar).toBeInTheDocument();
        expect(categoryBar).toHaveClass('category-bar');
    });

    it('renders all category buttons with correct names', () => {
        render(<CategoryBar {...defaultProps} />);
        expect(screen.getByRole('button', { name: 'Category 1' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Category 2' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: 'Category 3' })).toBeInTheDocument();
    });

    it('applies category-bar-button class to all buttons', () => {
        render(<CategoryBar {...defaultProps} />);
        const buttons = screen.getAllByRole('button');
        buttons.forEach((button) => {
            expect(button).toHaveClass('category-bar-button');
        });
    });

    it('applies category-bar-selected class to selected category button', () => {
        const propsWithSelection = {
            ...defaultProps,
            selectedCategory: mockCategories[1],
        };
        render(<CategoryBar {...propsWithSelection} />);

        const selectedButton = screen.getByRole('button', { name: 'Category 2' });
        const unselectedButton = screen.getByRole('button', { name: 'Category 1' });

        expect(selectedButton).toHaveClass('category-bar-button-selected');
        expect(unselectedButton).not.toHaveClass('category-bar-button-selected');
    });

    it('calls onCategorySelect when a category button is clicked', () => {
        const mockOnCategorySelect = jest.fn();
        render(<CategoryBar {...defaultProps} onCategorySelect={mockOnCategorySelect} />);

        const categoryButton = screen.getByRole('button', { name: 'Category 2' });
        fireEvent.click(categoryButton);

        expect(mockOnCategorySelect).toHaveBeenCalledTimes(1);
        expect(mockOnCategorySelect).toHaveBeenCalledWith(mockCategories[1]);
    });

    it('renders context menu when displayContextMenu is true and contextMenuOptions are provided', () => {
        const contextMenuOptions = [
            { id: 'option1', name: 'Option 1' },
            { id: 'option2', name: 'Option 2' },
        ];

        render(<CategoryBar {...defaultProps} displayContextMenu={true} contextMenuOptions={contextMenuOptions} />);

        expect(screen.getByTestId('context-menu')).toBeInTheDocument();
        expect(screen.getByTestId('context-menu-option-option1')).toBeInTheDocument();
        expect(screen.getByTestId('context-menu-option-option2')).toBeInTheDocument();
    });

    it('does not render context menu when displayContextMenu is false', () => {
        const contextMenuOptions = [{ id: 'option1', name: 'Option 1' }];

        render(<CategoryBar {...defaultProps} displayContextMenu={false} contextMenuOptions={contextMenuOptions} />);

        expect(screen.queryByTestId('context-menu')).not.toBeInTheDocument();
    });

    it('calls onContextMenuOptionSelected when context menu option is selected', () => {
        const mockOnContextMenuOptionSelected = jest.fn();
        const contextMenuOptions = [{ id: 'test-option', name: 'Test Option' }];

        render(
            <CategoryBar
                {...defaultProps}
                displayContextMenu={true}
                contextMenuOptions={contextMenuOptions}
                onContextMenuOptionSelected={mockOnContextMenuOptionSelected}
            />,
        );

        const contextMenu = screen.getByTestId('context-menu');
        fireEvent.click(contextMenu);

        expect(mockOnContextMenuOptionSelected).toHaveBeenCalledTimes(1);
        expect(mockOnContextMenuOptionSelected).toHaveBeenCalledWith('test-option');
    });
});
