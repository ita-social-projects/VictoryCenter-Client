import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Select, SelectProps } from './Select';

jest.mock('./select.scss', () => ({}));

jest.mock('../../../assets/icons/chevron-down.svg', () => 'chevron-down.svg');
jest.mock('../../../assets/icons/chevron-up.svg', () => 'chevron-up.svg');

describe('Select Component', () => {
    const defaultProps: SelectProps<string> = {
        children: [
            <Select.Option key="1" value="option1" name="Option 1" />,
            <Select.Option key="2" value="option2" name="Option 2" />,
            <Select.Option key="3" value="option3" name="Option 3" />
        ],
        onValueChange: jest.fn()
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders select component with default state', () => {
        render(<Select {...defaultProps} />);

        expect(screen.getByText('Статус')).toBeInTheDocument();
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

    it('shows options container with correct visibility classes', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;
        const optionsContainer = container.querySelector('.select-options');

        expect(optionsContainer).not.toHaveClass('select-options-visible');

        fireEvent.click(selectContainer);
        expect(optionsContainer).toHaveClass('select-options-visible');
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

        const option = screen.getByText('Option 1');
        fireEvent.click(option);

        expect(screen.getByText('option1')).toBeInTheDocument();
        expect(screen.queryByText('Статус')).not.toBeInTheDocument();
    });

    it('changes text color when value is selected', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;
        const span = container.querySelector('span');

        expect(span).toHaveStyle('color: #61615C');

        fireEvent.click(selectContainer);
        const option = screen.getByText('Option 1');
        fireEvent.click(option);

        expect(span).toHaveStyle('color: #061125');
    });

    it('applies selected class to options when not in autocomplete mode', () => {
        const { container } = render(<Select {...defaultProps} isAutocomplete={false} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);
        const option = screen.getByText('Option 1');
        fireEvent.click(option);

        fireEvent.click(selectContainer);

        const selectedOption = screen.getByText('Option 1').parentElement;
        expect(selectedOption).toHaveClass('select-options-selected');
    });

    it('does not apply selected class in autocomplete mode', () => {
        const { container } = render(<Select {...defaultProps} isAutocomplete={true} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);
        const option = screen.getByText('Option 1');
        fireEvent.click(option);

        fireEvent.click(selectContainer);

        const selectedOption = screen.getByText('Option 1').parentElement;
        expect(selectedOption).not.toHaveClass('select-options-selected');
    });

    it('has correct default value for isAutocomplete prop', () => {
        const { container } = render(<Select {...defaultProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);
        const option = screen.getByText('Option 1');
        fireEvent.click(option);

        fireEvent.click(selectContainer);

        const selectedOption = screen.getByText('Option 1').parentElement;
        expect(selectedOption).toHaveClass('select-options-selected');
    });

    it('handles numeric values', () => {
        const mockOnValueChange = jest.fn();
        const numericProps: SelectProps<number> = {
            children: [
                <Select.Option key="1" value={1} name="One" />,
                <Select.Option key="2" value={2} name="Two" />
            ],
            onValueChange: mockOnValueChange
        };

        const { container } = render(<Select {...numericProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);
        const option = screen.getByText('One');
        fireEvent.click(option);

        expect(mockOnValueChange).toHaveBeenCalledWith(1);
        expect(screen.getByText('1')).toBeInTheDocument();
    });

    it('handles boolean values', () => {
        const mockOnValueChange = jest.fn();
        const booleanProps: SelectProps<boolean> = {
            children: [
                <Select.Option key="1" value={true} name="True" />,
                <Select.Option key="2" value={false} name="False" />
            ],
            onValueChange: mockOnValueChange
        };

        const { container } = render(<Select {...booleanProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);
        const option = screen.getByText('True');
        fireEvent.click(option);

        expect(mockOnValueChange).toHaveBeenCalledWith(true);
        expect(screen.getByText('true')).toBeInTheDocument();
    });

    it('handles empty children array', () => {
        const emptyProps: SelectProps<string> = {
            children: [],
            onValueChange: jest.fn()
        };

        const { container } = render(<Select {...emptyProps} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);

        expect(screen.getByText('Статус')).toBeInTheDocument();
        expect(container.querySelector('.select-options')).toBeInTheDocument();
    });

    it('filters out non-Select.Option children', () => {
        const mixedProps: SelectProps<string> = {
            children: [
                <Select.Option key="1" value="option1" name="Option 1" />,
                <div key="2">Invalid child</div>,
                <Select.Option key="3" value="option2" name="Option 2" />,
                "String child"
            ],
            onValueChange: jest.fn()
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
        const { container } = render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectContainer = container.firstChild as HTMLElement;

        fireEvent.click(selectContainer);

        const option = screen.getByText('Option 1');
        fireEvent.click(option);
        fireEvent.click(option);
        fireEvent.click(option);

        expect(mockOnValueChange).toHaveBeenCalledTimes(3);
        expect(mockOnValueChange).toHaveBeenCalledWith('option1');
    });

    it('handles complete user interaction flow', () => {
        const mockOnValueChange = jest.fn();
        const { container } = render(<Select {...defaultProps} onValueChange={mockOnValueChange} />);
        const selectContainer = container.firstChild as HTMLElement;

        expect(selectContainer).toHaveClass('select-closed');
        expect(screen.getByText('Статус')).toBeInTheDocument();

        fireEvent.click(selectContainer);
        expect(selectContainer).toHaveClass('select-opened');

        fireEvent.click(screen.getByText('Option 1'));
        expect(mockOnValueChange).toHaveBeenCalledWith('option1');
        expect(screen.getByText('option1')).toBeInTheDocument();

        fireEvent.click(selectContainer);
        fireEvent.click(screen.getByText('Option 2'));
        expect(mockOnValueChange).toHaveBeenCalledWith('option2');
        expect(screen.getByText('option2')).toBeInTheDocument();
    });

    it('renders Select.Option component correctly', () => {
        const {container} = render(
            <Select.Option value="test" name="Test Option">
                Child content
            </Select.Option>
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
