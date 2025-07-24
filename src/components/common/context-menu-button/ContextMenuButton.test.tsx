import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ContextMenuButton } from './ContextMenuButton';

describe('ContextMenuButton', () => {
    const mockOnOptionSelected = jest.fn();

    beforeEach(() => {
        mockOnOptionSelected.mockClear();
    });

    it('renders with default icon and children', () => {
        render(
            <ContextMenuButton onOptionSelected={mockOnOptionSelected}>
                <ContextMenuButton.Option value="option1">Option 1</ContextMenuButton.Option>
                <ContextMenuButton.Option value="option2">Option 2</ContextMenuButton.Option>
            </ContextMenuButton>,
        );

        expect(screen.getByRole('menu')).toBeInTheDocument();
        expect(screen.getByAltText('menu')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('renders with custom icon when provided', () => {
        const customIcon = 'custom-icon.svg';
        render(
            <ContextMenuButton onOptionSelected={mockOnOptionSelected} customIcon={customIcon}>
                <ContextMenuButton.Option value="option1">Option 1</ContextMenuButton.Option>
            </ContextMenuButton>,
        );

        const iconElement = screen.getByAltText('menu');
        expect(iconElement).toHaveAttribute('src', customIcon);
    });

    it('toggles menu visibility when clicked', () => {
        render(
            <ContextMenuButton onOptionSelected={mockOnOptionSelected}>
                <ContextMenuButton.Option value="option1">Option 1</ContextMenuButton.Option>
            </ContextMenuButton>,
        );

        const contextMenuElement = screen.getByRole('menu');

        // Initially closed
        expect(contextMenuElement).not.toHaveClass('context-menu-button-active');

        // Open
        fireEvent.click(contextMenuElement);
        expect(contextMenuElement).toHaveClass('context-menu-button-active');

        // Close
        fireEvent.click(contextMenuElement);
        expect(contextMenuElement).not.toHaveClass('context-menu-button-active');
    });

    it('handles keyboard navigation with Enter and Space keys', () => {
        render(
            <ContextMenuButton onOptionSelected={mockOnOptionSelected}>
                <ContextMenuButton.Option value="option1">Option 1</ContextMenuButton.Option>
            </ContextMenuButton>,
        );

        const contextMenuElement = screen.getByRole('menu');

        // Test Enter key
        fireEvent.keyDown(contextMenuElement, { key: 'Enter' });
        expect(contextMenuElement).toHaveClass('context-menu-button-active');

        // Test Space key
        fireEvent.keyDown(contextMenuElement, { key: ' ' });
        expect(contextMenuElement).not.toHaveClass('context-menu-button-active');
    });

    it('calls onOptionSelected and closes menu when option is clicked', () => {
        render(
            <ContextMenuButton onOptionSelected={mockOnOptionSelected}>
                <ContextMenuButton.Option value="option1" data={{ id: 123 }}>
                    Option 1
                </ContextMenuButton.Option>
                <ContextMenuButton.Option value="option2">Option 2</ContextMenuButton.Option>
            </ContextMenuButton>,
        );

        // Open
        fireEvent.click(screen.getByRole('menu'));
        expect(screen.getByRole('menu')).toHaveClass('context-menu-button-active');

        // Click on option
        fireEvent.click(screen.getByText('Option 1'));

        expect(mockOnOptionSelected).toHaveBeenCalledWith('option1', { id: 123 });
        expect(mockOnOptionSelected).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('menu')).not.toHaveClass('context-menu-button-active');
    });

    it('closes menu when clicking outside', async () => {
        render(
            <div>
                <ContextMenuButton onOptionSelected={mockOnOptionSelected}>
                    <ContextMenuButton.Option value="option1">Option 1</ContextMenuButton.Option>
                </ContextMenuButton>
                <div data-testid="outside-element">Outside</div>
            </div>,
        );

        const contextMenuElement = screen.getByRole('menu');

        // Open
        fireEvent.click(contextMenuElement);
        expect(contextMenuElement).toHaveClass('context-menu-button-active');

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside-element'));

        await waitFor(() => {
            expect(contextMenuElement).not.toHaveClass('context-menu-button-active');
        });
    });

    it('handles disabled options correctly', () => {
        render(
            <ContextMenuButton onOptionSelected={mockOnOptionSelected}>
                <ContextMenuButton.Option value="option1" disabled>
                    Disabled Option
                </ContextMenuButton.Option>
                <ContextMenuButton.Option value="option2">Enabled Option</ContextMenuButton.Option>
            </ContextMenuButton>,
        );

        // Open menu
        fireEvent.click(screen.getByRole('menu'));

        const disabledButton = screen.getByText('Disabled Option');
        const enabledButton = screen.getByText('Enabled Option');

        expect(disabledButton).toBeDisabled();
        expect(enabledButton).not.toBeDisabled();

        // Click disabled option should not trigger callback
        fireEvent.click(disabledButton);
        expect(mockOnOptionSelected).not.toHaveBeenCalled();

        // Click enabled option should trigger callback
        fireEvent.click(enabledButton);
        expect(mockOnOptionSelected).toHaveBeenCalledWith('option2', undefined);
    });
});
