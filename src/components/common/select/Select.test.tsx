import React from 'react';
import '@testing-library/jest-dom';
import { render, screen, fireEvent } from '@testing-library/react';
import { Select, SelectProps } from './Select';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

jest.mock('./select.scss', () => ({}));

jest.mock('../../../assets/icons/chevron-down.svg', () => 'chevron-down.svg');
jest.mock('../../../assets/icons/chevron-up.svg', () => 'chevron-up.svg');

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
        expect(screen.getByAltText('arrow-down')).toBeInTheDocument();
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-down.svg');
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

    it('opens select when clicked', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);

        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-up.svg');
    });

    it('closes select when clicked again', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-down.svg');
    });

    it('opens select when Space or Enter is pressed', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.keyDown(selectContainer, { key: ' ', code: 'Space', charCode: 32 });
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-up.svg');

        fireEvent.click(selectContainer);

        fireEvent.keyDown(selectContainer, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-up.svg');
    });

    it('does not open select when a non-Space/Enter key is pressed', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.keyDown(selectContainer, { key: 'a', code: 'KeyA', charCode: 65 });
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-down.svg');
    });

    it('closes select when Space or Enter is pressed again', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.keyDown(selectContainer, { key: ' ', code: 'Space', charCode: 32 });
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.keyDown(selectContainer, { key: ' ', code: 'Space', charCode: 32 });
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-down.svg');

        fireEvent.keyDown(selectContainer, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.keyDown(selectContainer, { key: 'Enter', code: 'Enter', charCode: 13 });
        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-down.svg');
    });

    it('does not close select when a non-Space/Enter key is pressed', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-up.svg');

        fireEvent.keyDown(selectContainer, { key: 'a', code: 'KeyA', charCode: 65 });
        expect(selectContainer).toHaveClass('select-opened');
        expect(screen.getByRole('img')).toHaveAttribute('src', 'chevron-up.svg');
    });

    it('toggles select state multiple times', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        expect(selectContainer).toHaveClass('select-closed');

        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-closed');

        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-opened');
    });

    it('renders all options when opened', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.getByText('Option 3')).toBeInTheDocument();
    });

    it('calls onValueChange when option is selected', () => {
        const mockOnValueChange = jest.fn();
        const { container } = render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);

        const option = screen.getByText('Option 2');
        fireEvent.click(option);

        expect(mockOnValueChange).toHaveBeenCalledWith('option2');
        expect(mockOnValueChange).toHaveBeenCalledTimes(1);
    });

    it('updates displayed value when option is selected', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;
        fireEvent.click(selectContainer);

        const option = screen.getByRole('button', { name: 'Option 1' });
        fireEvent.click(option);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.queryByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).not.toBeInTheDocument();
    });

    it('changes text color when value is selected', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;
        const span = container.querySelector('span');

        expect(span).toHaveClass('empty');

        fireEvent.click(selectContainer);

        const option = screen.getByText('Option 1');
        fireEvent.click(option);

        expect(span).toHaveClass('not-empty');
    });

    it('applies selected class to options when not in autocomplete mode', () => {
        render(<Select {...defaultProps} isAutocomplete={false} />);
        const selectContainer = screen.getByRole('toolbar');

        fireEvent.click(selectContainer);
        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));

        // Re-open to check the class
        fireEvent.click(selectContainer);

        const selectedOption = screen.getByRole('button', { name: 'Option 1' });
        expect(selectedOption).toHaveClass('select-options-selected');
    });

    it('does not apply selected class in autocomplete mode', () => {
        render(<Select {...defaultProps} isAutocomplete={true} />);
        const selectContainer = screen.getByRole('toolbar');

        fireEvent.click(selectContainer);
        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));

        // Re-open to check the class
        fireEvent.click(selectContainer);

        const selectedOption = screen.getByRole('button', { name: 'Option 1' });
        expect(selectedOption).not.toHaveClass('select-options-selected');
    });

    it('has correct default value for isAutocomplete prop', () => {
        render(<Select {...defaultProps} />); // isAutocomplete defaults to false
        const selectContainer = screen.getByRole('toolbar');

        fireEvent.click(selectContainer);
        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));

        // Re-open to check the class
        fireEvent.click(selectContainer);

        const selectedOption = screen.getByRole('button', { name: 'Option 1' });
        expect(selectedOption).toHaveClass('select-options-selected');
    });

    it('handles numeric values', () => {
        const mockOnValueChange = jest.fn();
        const numericProps: SelectProps<number> = {
            children: [<Select.Option key="1" value={1} name="One" />, <Select.Option key="2" value={2} name="Two" />],
            onValueChange: mockOnValueChange,
        };
        const { container } = render(<Select {...numericProps} />);
        const selectContainer = container.firstChild as HTMLElement;
        fireEvent.click(selectContainer);
        const option = screen.getByRole('button', { name: 'One' });
        fireEvent.click(option);
        expect(mockOnValueChange).toHaveBeenCalledWith(1);
        expect(screen.getByText('One')).toBeInTheDocument();
    });

    it('handles boolean values', () => {
        const mockOnValueChange = jest.fn();
        const booleanProps: SelectProps<boolean> = {
            children: [
                <Select.Option key="1" value={true} name="True" />,
                <Select.Option key="2" value={false} name="False" />,
            ],
            onValueChange: mockOnValueChange,
        };
        render(<Select {...booleanProps} />);

        fireEvent.click(screen.getByRole('toolbar'));
        fireEvent.click(screen.getByRole('button', { name: 'True' }));

        expect(mockOnValueChange).toHaveBeenCalledWith(true);
        expect(screen.getByText('True')).toBeInTheDocument();
        expect(screen.queryByText('true')).not.toBeInTheDocument();
    });

    it('handles empty children array', () => {
        const emptyProps: SelectProps<string> = {
            children: [],
            onValueChange: jest.fn(),
        };

        const { container } = render(<Select {...emptyProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);

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
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);

        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(screen.getByText('Option 2')).toBeInTheDocument();
        expect(screen.queryByText('Invalid child')).not.toBeInTheDocument();
        expect(screen.queryByText('String child')).not.toBeInTheDocument();
    });

    it('handles option selection with multiple clicks', () => {
        const mockOnValueChange = jest.fn();
        render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);

        // First selection
        fireEvent.click(screen.getByRole('toolbar'));
        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));

        // Second selection
        fireEvent.click(screen.getByRole('toolbar'));
        fireEvent.click(screen.getByRole('button', { name: 'Option 2' }));

        expect(mockOnValueChange).toHaveBeenCalledTimes(2);
        expect(mockOnValueChange).toHaveBeenCalledWith('option1');
        expect(mockOnValueChange).toHaveBeenCalledWith('option2');
    });

    it('handles complete user interaction flow', () => {
        const mockOnValueChange = jest.fn();
        render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectContainer = screen.getByRole('toolbar');

        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByText(COMMON_TEXT_ADMIN.STATUS.DEFAULT)).toBeInTheDocument();

        // Open and select Option 1
        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-opened');
        fireEvent.click(screen.getByRole('button', { name: 'Option 1' }));
        expect(mockOnValueChange).toHaveBeenCalledWith('option1');
        expect(screen.getByText('Option 1')).toBeInTheDocument();
        expect(selectContainer).toHaveClass('select-closed');

        // Open and select Option 2
        fireEvent.click(selectContainer);
        fireEvent.click(screen.getByRole('button', { name: 'Option 2' }));
        expect(mockOnValueChange).toHaveBeenCalledWith('option2');
        expect(screen.getByText('Option 2')).toBeInTheDocument();
    });

    it('renders Select.Option component correctly', () => {
        const { container } = render(
            <Select.Option value="test" name="Test Option">
                Child content
            </Select.Option>,
        );

        expect(container.textContent).toBe('Child content');
    });

    it('Select.Option handles props correctly', () => {
        const optionElement = <Select.Option value="test-value" name="Test Name" />;

        expect(React.isValidElement(optionElement)).toBe(true);
        expect(optionElement.props.value).toBe('test-value');
        expect(optionElement.props.name).toBe('Test Name');
    });

    it('provides access to container element through ref', () => {
        const ref = React.createRef<HTMLDivElement>();
        render(<Select {...defaultProps} selectContainerRef={ref} />);

        expect(ref.current).toBeTruthy();
        expect(ref.current?.tagName).toBe('DIV');

        // @ts-ignore
        fireEvent.click(ref.current);
        expect(ref.current).toHaveClass('select-opened');
    });
});
