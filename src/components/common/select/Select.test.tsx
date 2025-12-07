import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectProps } from './Select';
import { COMMON_TEXT_ADMIN } from '@const/admin/common';

jest.mock('./select.scss', () => ({}));

jest.mock('@assets/icons/chevron-down.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-down-icon" />,
}));

jest.mock('@assets/icons/chevron-up.svg', () => ({
    ReactComponent: (props: any) => <svg {...props} data-testid="chevron-up-icon" />,
}));

describe('Select Component', () => {
    const defaultProps: SelectProps<string> = {
        children: [
            <Select.Option key="1" value="option1" name="Option 1" />,
            <Select.Option key="2" value="option2" name="Option 2" />,
            <Select.Option key="3" value="option3" name="Option 3" />,
        ],
        onValueChange: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders select component with default state', () => {
        render(<Select {...defaultProps} />);

        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).toBeInTheDocument();
        const icon = screen.getByTestId('chevron-down-icon');
        expect(icon).toBeInTheDocument();
    });

    it('renders with custom className', () => {
        const { container } = render(<Select {...defaultProps} className="custom-class" />);

        expect(container.firstChild).toHaveClass('custom-class', 'select', 'select-closed');
    });

    it('renders without custom className', () => {
        const { container } = render(<Select {...defaultProps} />);

        expect(container.firstChild).toHaveClass('select', 'select-closed');
        expect(container.firstChild).not.toHaveClass('undefined');
    });

    it('applies correct ref when selectContainerRef is provided', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<Select {...defaultProps} selectContainerRef={ref} />);

        expect(ref.current).toBeInstanceOf(HTMLDivElement);
        expect(ref.current).toHaveClass('select');
    });

    it('opens select when button is clicked', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectButton);

        expect(selectContainer).toHaveClass('select-opened');
        const icon = screen.getByTestId('chevron-up-icon');
        expect(icon).toBeInTheDocument();
    });

    it('closes select when button is clicked again', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('opens select when Space or Enter is pressed', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.keyDown(selectButton, { key: ' ', code: 'Space', charCode: 32 });
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();

        fireEvent.click(selectButton);

        fireEvent.keyDown(selectButton, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('does not open select when a non-Space/Enter key is pressed', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.keyDown(selectButton, { key: 'a', code: 'KeyA', charCode: 65 });
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('closes select when Space or Enter is pressed again', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.keyDown(selectButton, { key: ' ', code: 'Space', charCode: 32 });
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.keyDown(selectButton, { key: ' ', code: 'Space', charCode: 32 });
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();

        fireEvent.keyDown(selectButton, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.keyDown(selectButton, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByTestId('chevron-down-icon')).toBeInTheDocument();
    });

    it('does not close select when a non-Space/Enter key is pressed', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();

        fireEvent.keyDown(selectButton, { key: 'a', code: 'KeyA', charCode: 65 });
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByTestId('chevron-up-icon')).toBeInTheDocument();
    });

    it('toggles select state multiple times', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        expect(selectContainer).toHaveClass('select-closed');

        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-closed');

        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-opened');
    });

    it('renders all options when opened', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('calls onValueChange when option is selected', () => {
        const mockOnValueChange = jest.fn();
        const { container } = render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        const option = screen.getByText('Option 2');
        fireEvent.click(option);

        expect(mockOnValueChange).toHaveBeenCalledWith('option2');
        expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    });

    it('updates displayed value when option is selected', () => {
        const mockOnValueChange = jest.fn();
        const { container, rerender } = render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);
        const option = screen.getByRole('button', { name: 'Option 1' });
        fireEvent.click(option);

        expect(mockOnValueChange).toHaveBeenCalledWith('option1');

        // Rerender with the new value to simulate parent component updating
        rerender(<Select {...defaultProps} value="option1" onValueChange={mockOnValueChange} />);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.queryByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).not.toBeInTheDocument();
    });

    it('changes text color when value is selected', () => {
        const { container, rerender } = render(<Select {...defaultProps} />);
        const span = container.querySelector('span');

        expect(span).toHaveClass('empty');

        // Rerender with value prop
        rerender(<Select {...defaultProps} value="option1" />);

        expect(span).toHaveClass('not-empty');
    });

    it('applies selected class to options when not in autocomplete mode', () => {
        const { container } = render(<Select {...defaultProps} value="option1" isAutocomplete={false} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        const buttons = screen.getAllByRole('button', { name: 'Option 1' });
        const selectedOption = buttons.find((btn) => !btn.classList.contains('select-head'));

        expect(selectedOption).toHaveClass('select-options-selected');
    });

    it('does not apply selected class in autocomplete mode', () => {
        const { container } = render(<Select {...defaultProps} value="option1" isAutocomplete={true} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        const buttons = screen.getAllByRole('button', { name: 'Option 1' });
        const selectedOption = buttons.find((btn) => !btn.classList.contains('select-head'));

        expect(selectedOption).not.toHaveClass('select-options-selected');
    });

    it('has correct default value for isAutocomplete prop', () => {
        const { container } = render(<Select {...defaultProps} value="option1" />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        const buttons = screen.getAllByRole('button', { name: 'Option 1' });
        const selectedOption = buttons.find((btn) => !btn.classList.contains('select-head'));

        expect(selectedOption).toHaveClass('select-options-selected');
    });

    it('handles numeric values', () => {
        const mockOnValueChange = jest.fn();
        const numericProps: SelectProps<number> = {
            children: [<Select.Option key="1" value={1} name="One" />, <Select.Option key="2" value={2} name="Two" />],
            onValueChange: mockOnValueChange,
            value: 1,
        };
        const { container } = render(<Select {...numericProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        expect(screen.getByText('One')).toBeInTheDocument();

        fireEvent.click(selectButton);
        const option = screen.getByRole('button', { name: 'Two' });
        fireEvent.click(option);

        expect(mockOnValueChange).toHaveBeenCalledWith(2);
    });

    it('handles boolean values', () => {
        const mockOnValueChange = jest.fn();
        const booleanProps: SelectProps<boolean> = {
            children: [
                <Select.Option key="1" value={true} name="True" />,
                <Select.Option key="2" value={false} name="False" />,
            ],
            onValueChange: mockOnValueChange,
            value: true,
        };
        const { container } = render(<Select {...booleanProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        expect(screen.getByText('True')).toBeInTheDocument();
        expect(screen.queryByText('true')).not.toBeInTheDocument();

        fireEvent.click(selectButton);
        fireEvent.click(screen.getByRole('button', { name: 'False' }));

        expect(mockOnValueChange).toHaveBeenCalledWith(false);
    });

    it('handles empty children array', () => {
        const emptyProps: SelectProps<string> = {
            children: [],
            onValueChange: jest.fn(),
        };

        const { container } = render(<Select {...emptyProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).toBeInTheDocument();
        expect(container.querySelector('.select-options')).toBeInTheDocument();
    });

    it('filters out non-Select.Option children', () => {
        const mixedProps: SelectProps<string> = {
            children: [
                <Select.Option key="1" value="option1" name="Option 1" />,
                <div key="2">Invalid child</div>,
                <Select.Option key="3" value="option2" name="Option 2" />,
                'String child',
            ],
            onValueChange: jest.fn(),
        };

        const { container } = render(<Select {...mixedProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.queryByText('Invalid child')).not.toBeInTheDocument();
        expect(screen.queryByText('String child')).not.toBeInTheDocument();
    });

    it('handles option selection with multiple clicks', () => {
        const mockOnValueChange = jest.fn();
        const { container } = render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        // First selection
        fireEvent.click(selectButton);
        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));

        // Second selection
        fireEvent.click(selectButton);
        fireEvent.click(screen.getByRole('button', { name: 'Option 2' }));

        expect(mockOnValueChange).toHaveBeenCalledTimes(2);
        expect(mockOnValueChange).toHaveBeenCalledWith('option1');
        expect(mockOnValueChange).toHaveBeenCalledWith('option2');
    });

    it('handles complete user interaction flow', () => {
        const mockOnValueChange = jest.fn();
        const { container, rerender } = render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).toBeInTheDocument();

        // Open and select Option 1
        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-opened');
        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));
        expect(mockOnValueChange).toHaveBeenCalledWith('option1');
        expect(selectContainer).toHaveClass('select-closed');

        // Rerender with new value
        rerender(<Select {...defaultProps} value="option1" onValueChange={mockOnValueChange} />);
        expect(screen.getByText('Option 1')).toBeInTheDocument();

        // Open and select Option 2
        fireEvent.click(selectButton);
        fireEvent.click(screen.getByRole('button', { name: 'Option 2' }));
        expect(mockOnValueChange).toHaveBeenCalledWith('option2');

        // Rerender with new value
        rerender(<Select {...defaultProps} value="option2" onValueChange={mockOnValueChange} />);
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('Select.Option handles props correctly', () => {
        const optionElement = <Select.Option value="test-value" name="Test Name" />;

        expect(React.isValidElement(optionElement)).toBe(true);
        expect(optionElement.props.value).toBe('test-value');
        expect(optionElement.props.name).toBe('Test Name');
    });

    it('provides access to container element through ref', () => {
        const ref = React.createRef<HTMLDivElement>();
        const { container } = render(<Select {...defaultProps} selectContainerRef={ref} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        expect(ref.current).toBeTruthy();
        expect(ref.current?.tagName).toBe('DIV');

        fireEvent.click(selectButton);
        expect(ref.current).toHaveClass('select-opened');
    });

    it('sets selected value and name when value prop is provided', () => {
        const mockOnValueChange = jest.fn();

        render(<Select {...defaultProps} value="option2" onValueChange={mockOnValueChange} />);

        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.queryByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).not.toBeInTheDocument();

        const span = screen.getByText('Option 2');
        expect(span).toHaveClass('not-empty');
    });

    it('handles value that does not match any option', () => {
        const mockOnValueChange = jest.fn();

        render(<Select {...defaultProps} value="nonexistent-option" onValueChange={mockOnValueChange} />);

        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).toBeInTheDocument();
    });

    it('applies custom headClassName to select button', () => {
        const { container } = render(<Select {...defaultProps} headClassName="custom-head" />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        expect(selectButton).toHaveClass('custom-head');
    });

    it('applies custom optionClassName to option buttons', () => {
        const { container } = render(<Select {...defaultProps} optionClassName="custom-option" />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;

        fireEvent.click(selectButton);

        const options = screen.getAllByRole('button');
        const optionButtons = options.filter((btn) => btn !== selectButton);

        optionButtons.forEach((option) => {
            expect(option).toHaveClass('custom-option');
        });
    });

    it('closes select automatically after option selection', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectButton = container.querySelector('.select-head') as HTMLElement;
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectButton);
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));
        expect(selectContainer).toHaveClass('select-closed');
    });
});
