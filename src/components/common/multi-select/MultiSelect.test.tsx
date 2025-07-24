import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MultiSelect } from './MultiSelect';

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
        render(<MultiSelect {...defaultProps} />);
        expect(screen.getByText('Select options...')).toBeInTheDocument();
    });

    it('renders with custom placeholder', () => {
        render(<MultiSelect {...defaultProps} placeholder="Choose items..." />);
        expect(screen.getByText('Choose items...')).toBeInTheDocument();
    });

    it('applies correct className to container', () => {
        const { container } = render(<MultiSelect {...defaultProps} />);
        expect(container.firstChild).toHaveClass('multiselect');
    });

    it('applies selected className when dropdown is open', () => {
        const { container } = render(<MultiSelect {...defaultProps} />);
        const placeholderContainer = container.querySelector('.multiselect-placeholder-container');

        fireEvent.click(placeholderContainer!);

        expect(placeholderContainer).toHaveClass('multiselect-placeholder-container-selected');
    });

    it('applies disabled className when disabled prop is true', () => {
        const { container } = render(<MultiSelect {...defaultProps} disabled />);
        const placeholderContainer = container.querySelector('.multiselect-placeholder-container');

        expect(placeholderContainer).toHaveClass('multiselect-placeholder-container-disabled');
    });

    it('shows down arrow when closed and up arrow when open', () => {
        render(<MultiSelect {...defaultProps} />);

        // Initially closed - should show down arrow
        expect(screen.getByAltText('Expand options')).toBeInTheDocument();

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));

        // Should show up arrow when open
        expect(screen.getByAltText('Collapse options')).toBeInTheDocument();
    });

    it('opens dropdown when placeholder is clicked', () => {
        render(<MultiSelect {...defaultProps} />);

        fireEvent.click(screen.getByText('Select options...'));

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('does not open dropdown when disabled', () => {
        render(<MultiSelect {...defaultProps} disabled />);

        fireEvent.click(screen.getByText('Select options...'));

        expect(screen.queryByText('Option 1')).not.toBeInTheDocument();
    });

    it('displays selected values in placeholder', () => {
        const selectedValues = [mockOptions[0], mockOptions[1]];
        render(<MultiSelect {...defaultProps} value={selectedValues} />);

        expect(screen.getByText('Option 1, Option 2')).toBeInTheDocument();
    });

    it('applies placeholder-selected className when items are selected', () => {
        const selectedValues = [mockOptions[0]];
        const { container } = render(<MultiSelect {...defaultProps} value={selectedValues} />);
        const placeholder = container.querySelector('.placeholder');

        expect(placeholder).toHaveClass('placeholder-selected');
    });

    it('calls onChange when option is selected', () => {
        const mockOnChange = jest.fn();
        render(<MultiSelect {...defaultProps} onChange={mockOnChange} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));

        // Click on first option
        fireEvent.click(screen.getByText('Option 1'));

        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0]]);
    });

    it('calls onChange when option is deselected', () => {
        const mockOnChange = jest.fn();
        const selectedValues = [mockOptions[0], mockOptions[1]];

        render(<MultiSelect {...defaultProps} value={selectedValues} onChange={mockOnChange} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Option 1, Option 2'));

        // Click on first option to deselect
        fireEvent.click(screen.getByText('Option 1'));

        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[1]]);
    });

    it('does not call onChange when disabled', () => {
        const mockOnChange = jest.fn();
        render(<MultiSelect {...defaultProps} onChange={mockOnChange} disabled />);

        // Try to click placeholder (should not open dropdown)
        fireEvent.click(screen.getByText('Select options...'));

        expect(mockOnChange).not.toHaveBeenCalled();
    });

    it('applies option-selected className to selected options', () => {
        const selectedValues = [mockOptions[0]];
        const { container } = render(<MultiSelect {...defaultProps} value={selectedValues} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Option 1'));

        const selectedOption = container.querySelector('.option-selected');
        expect(selectedOption).toBeInTheDocument();
    });

    it('shows checked icon for selected options and unchecked for unselected', () => {
        const selectedValues = [mockOptions[0]];
        render(<MultiSelect {...defaultProps} value={selectedValues} />);

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
                <MultiSelect {...defaultProps} />
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
                <MultiSelect {...defaultProps} onBlur={mockOnBlur} />
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

    it('handles keyboard events on options (Enter and Space)', () => {
        const mockOnChange = jest.fn();
        render(<MultiSelect {...defaultProps} onChange={mockOnChange} />);

        // Open dropdown
        fireEvent.click(screen.getByText('Select options...'));

        const firstOption = screen.getByText('Option 1');

        // Test Enter key
        fireEvent.keyDown(firstOption, { key: 'Enter' });
        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0]]);

        mockOnChange.mockClear();

        // Test Space key
        fireEvent.keyDown(firstOption, { key: ' ' });
        expect(mockOnChange).toHaveBeenCalledWith([mockOptions[0]]);
    });

    it('truncates display label when many options are selected', () => {
        const longOptions = Array.from({ length: 10 }, (_, i) => ({
            id: i + 1,
            name: `Very Long Option Name ${i + 1}`,
        }));

        const selectedValues = longOptions.slice(0, 5); // Вибираємо 5 опцій

        render(<MultiSelect {...defaultProps} options={longOptions} value={selectedValues} />);

        const displayText = screen.getByText(/Very Long Option Name 1, Very Long Option Name 2\.\.\.$/);
        expect(displayText).toBeInTheDocument();
    });
});
