import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ContextMenu from './ContextMenu';

describe('ContextMenu', () => {
    const mockOnOptionSelected = jest.fn();

    beforeEach(() => {
        mockOnOptionSelected.mockClear();
    });

    it('renders with default icon and children', () => {
        render(
            <ContextMenu onOptionSelected={mockOnOptionSelected}>
                <ContextMenu.Option value="option1">Option 1</ContextMenu.Option>
                <ContextMenu.Option value="option2">Option 2</ContextMenu.Option>
            </ContextMenu>
        );

        expect(screen.getByRole('context-menu')).toBeInTheDocument();
        expect(screen.getByAltText('menu')).toBeInTheDocument();
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('renders with custom icon when provided', () => {
        const customIcon = 'custom-icon.svg';
        render(
            <ContextMenu onOptionSelected={mockOnOptionSelected} customIcon={customIcon}>
                <ContextMenu.Option value="option1">Option 1</ContextMenu.Option>
            </ContextMenu>
        );

        const iconElement = screen.getByAltText('menu');
        expect(iconElement).toHaveAttribute('src', customIcon);
    });

    it('toggles menu visibility when clicked', () => {
        render(
            <ContextMenu onOptionSelected={mockOnOptionSelected}>
                <ContextMenu.Option value="option1">Option 1</ContextMenu.Option>
            </ContextMenu>
        );

        const contextMenuElement = screen.getByRole('context-menu');

        // Initially closed
        expect(contextMenuElement).not.toHaveClass('context-menu-active');

        // Open
        fireEvent.click(contextMenuElement);
        expect(contextMenuElement).toHaveClass('context-menu-active');

        // Close
        fireEvent.click(contextMenuElement);
        expect(contextMenuElement).not.toHaveClass('context-menu-active');
    });

    it('handles keyboard navigation with Enter and Space keys', () => {
        render(
            <ContextMenu onOptionSelected={mockOnOptionSelected}>
                <ContextMenu.Option value="option1">Option 1</ContextMenu.Option>
            </ContextMenu>
        );

        const contextMenuElement = screen.getByRole('context-menu');

        // Test Enter key
        fireEvent.keyDown(contextMenuElement, { key: 'Enter' });
        expect(contextMenuElement).toHaveClass('context-menu-active');

        // Test Space key
        fireEvent.keyDown(contextMenuElement, { key: ' ' });
        expect(contextMenuElement).not.toHaveClass('context-menu-active');
    });

    it('calls onOptionSelected and closes menu when option is clicked', () => {
        render(
            <ContextMenu onOptionSelected={mockOnOptionSelected}>
                <ContextMenu.Option value="option1" data={{ id: 123 }}>Option 1</ContextMenu.Option>
                <ContextMenu.Option value="option2">Option 2</ContextMenu.Option>
            </ContextMenu>
        );

        // Open
        fireEvent.click(screen.getByRole('context-menu'));
        expect(screen.getByRole('context-menu')).toHaveClass('context-menu-active');

        // Click on option
        fireEvent.click(screen.getByText('Option 1'));

        expect(mockOnOptionSelected).toHaveBeenCalledWith('option1', { id: 123 });
        expect(mockOnOptionSelected).toHaveBeenCalledTimes(1);
        expect(screen.getByRole('context-menu')).not.toHaveClass('context-menu-active');
    });

    it('closes menu when clicking outside', async () => {
        render(
            <div>
                <ContextMenu onOptionSelected={mockOnOptionSelected}>
                    <ContextMenu.Option value="option1">Option 1</ContextMenu.Option>
                </ContextMenu>
                <div data-testid="outside-element">Outside</div>
            </div>
        );

        const contextMenuElement = screen.getByRole('context-menu');

        // Open
        fireEvent.click(contextMenuElement);
        expect(contextMenuElement).toHaveClass('context-menu-active');

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside-element'));

        await waitFor(() => {
            expect(contextMenuElement).not.toHaveClass('context-menu-active');
        });
    });

    it('handles disabled options correctly', () => {
        render(
            <ContextMenu onOptionSelected={mockOnOptionSelected}>
                <ContextMenu.Option value="option1" disabled>Disabled Option</ContextMenu.Option>
                <ContextMenu.Option value="option2">Enabled Option</ContextMenu.Option>
            </ContextMenu>
        );

        // Open menu
        fireEvent.click(screen.getByRole('context-menu'));

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