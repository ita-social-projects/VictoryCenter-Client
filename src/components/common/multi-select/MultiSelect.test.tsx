import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import Multiselect from './MultiSelect';

// Mock SVG imports
jest.mock('../../../assets/icons/chevron-checked.svg', () => 'chevron-checked.svg');
jest.mock('../../../assets/icons/chevron-unchecked.svg', () => 'chevron-unchecked.svg');
jest.mock('../../../assets/icons/chevron-down.svg', () => 'chevron-down.svg');
jest.mock('../../../assets/icons/chevron-up.svg', () => 'chevron-up.svg');

interface TestOption {
    id: number;
    name: string;
}

const mockOptions: TestOption[] = [
    { id: 1, name: 'Option 1' },
    { id: 2, name: 'Option 2' },
    { id: 3, name: 'Option 3' },
    { id: 4, name: 'Option 4' },
];

const defaultProps = {
    options: mockOptions,
    getOptionId: (option: TestOption) => option.id,
    getOptionName: (option: TestOption) => option.name,
};

describe('Multiselect Component', () => {
    it('renders with default placeholder', () => {
        render(<Multiselect {...defaultProps} />);
        expect(screen.getByText('Select options...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
        render(<Multiselect {...defaultProps} placeholder="Choose items..." />);
        expect(screen.getByText('Choose items...')).toBeInTheDocument();
    });

    it('applies correct className to container', () => {
        const { container } = render(<Multiselect {...defaultProps} />);
        expect(container.firstChild).toHaveClass('multiselect');
    });

    it('applies selected className when dropdown is open', () => {
        const { container } = render(<Multiselect {...defaultProps} />);
        const placeholderContainer = container.querySelector('.multiselect-placeholder-container');

        fireEvent.click(placeholderContainer!);

        expect(placeholderContainer).toHaveClass('multiselect-placeholder-container-selected');
    });

    it('applies disabled className when disabled prop is true', () => {
        const { container } = render(<Multiselect {...defaultProps} disabled />);
        const placeholderContainer = container.querySelector('.multiselect-placeholder-container');

        expect(placeholderContainer).toHaveClass('multiselect-placeholder-container-disabled');
    });

    it('shows down arrow when closed and up arrow when open', () => {
        render(<Multiselect {...defaultProps} />);

        // Initially closed - should show down arrow
        expect(screen.getByAltText('Expand options')).toBeInTheDocument();

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));

        // Should show up arrow when open
        expect(screen.getByAltText('Collapse options')).toBeInTheDocument();
    });

    it('opens dropdown when placeholder is clicked', () => {
        render(<Multiselect {...defaultProps} />);

        fireEvent.click(screen.getByText('Select options...'));

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('does not open dropdown when disabled', () => {
        render(<Multiselect {...defaultProps} disabled />);

        fireEvent.click(screen.getByText('Select options...'));

        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('displays selected values in placeholder', () => {
        const selectedValues = [mockOptions[0], mockOptions[1]];
        render(<Multiselect {...defaultProps} value={selectedValues} />);

        expect(screen.getByText('Option 1, Option 2')).toBeInTheDocument();
    });

    it('applies placeholder-selected className when items are selected', () => {
        const selectedValues = [mockOptions[0]];
        const { container } = render(<Multiselect {...defaultProps} value={selectedValues} />);
        const placeholder = container.querySelector('.placeholder');

        expect(placeholder).toHaveClass('placeholder-selected');
    });

    it('calls onChange when option is selected', () => {
        const mockOnChange = jest.fn();
        render(<Multiselect {...defaultProps} onChange={mockOnChange} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));

        // Click on first option
        fireEvent.click(screen.getByText('Option 1'));

        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0]]);
    });

    it('calls onChange when option is deselected', () => {
        const mockOnChange = jest.fn();
        const selectedValues = [mockOptions[0], mockOptions[1]];

        render(<Multiselect {...defaultProps} value={selectedValues} onChange={mockOnChange} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Option 1, Option 2'));

        // Click on first option to deselect
        fireEvent.click(screen.getByText('Option 1'));

        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[1]]);
    });

    it('does not call onChange when disabled', () => {
        const mockOnChange = jest.fn();
        render(<Multiselect {...defaultProps} onChange={mockOnChange} disabled />);

        // Try to click placeholder (should not open dropdown)
        fireEvent.click(screen.getByText('Select options...'));

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('applies option-selected className to selected options', () => {
        const selectedValues = [mockOptions[0]];
        const { container } = render(<Multiselect {...defaultProps} value={selectedValues} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Option 1'));

        const selectedOption = container.querySelector('.option-selected');
        expect(selectedOption).toBeInTheDocument();
    });

    it('shows checked icon for selected options and unchecked for unselected', () => {
        const selectedValues = [mockOptions[0]];
        render(<Multiselect {...defaultProps} value={selectedValues} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Option 1'));

        // First option should be selected
        expect(screen.getByAltText('Selected')).toBeInTheDocument();

        // Other options should not be selected
        expect(screen.getAllByAltText('Not selected')).toHaveLength(3);
    });

    it('closes dropdown when clicking outside', async () => {
        render(
            <div>
                <Multiselect {...defaultProps} />
                <div data-testid="outside-element">Outside</div>
            </div>,
        );

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));
        expect(screen.getByText('Option 1')).toBeInTheDocument();

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside-element'));

        await waitFor(() => {
            expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
        });
    });

    it('calls onBlur when dropdown closes by clicking outside', async () => {
        const mockOnBlur = jest.fn();
        render(
            <div>
                <Multiselect {...defaultProps} onBlur={mockOnBlur} />
                <div data-testid="outside-element">Outside</div>
            </div>,
        );

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside-element'));

        await waitFor(() => {
            expect(mockOnBlur).toHaveBeenCalled();
        });
    });

    it('handles onChange callback errors gracefully', () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const mockOnChange = jest.fn(() => {
            throw new Error('Test error');
        });

        render(<Multiselect {...defaultProps} onChange={mockOnChange} />);

        // Open dropdown and select option
        fireEvent.click(screen.getByText('Select options...'));
        fireEvent.click(screen.getByText('Option 1'));

        expect(consoleErrorSpy).toHaveBeenCalledWith('Error in onChange callback:', expect.any(Error));

        consoleErrorSpy.mockRestore();
    });

    it('handles onBlur callback errors gracefully', async () => {
        const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        const mockOnBlur = jest.fn(() => {
            throw new Error('Test error');
        });

        render(
            <div>
                <Multiselect {...defaultProps} onBlur={mockOnBlur} />
                <div data-testid="outside-element">Outside</div>
            </div>,
        );

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));

        // Click outside
        fireEvent.mouseDown(screen.getByTestId('outside-element'));

        await waitFor(() => {
            expect(consoleErrorSpy).toHaveBeenCalledWith('Error in onBlur callback:', expect.any(Error));
        });

        consoleErrorSpy.mockRestore();
    });
});
