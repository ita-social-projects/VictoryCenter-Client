import { render, screen, fireEvent } from '@testing-library/react';
import { InputWithCharacterLimit } from './InputWithCharacterLimit';

describe('InputWithCharacterLimit', () => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
        name: 'testName',
        id: 'test-id',
        maxLength: 50,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders input and character counter', () => {
        render(<InputWithCharacterLimit {...defaultProps} />);
        expect(screen.getByRole('textbox')).toBeInTheDocument();
        expect(screen.getByText('0/50')).toBeInTheDocument();
    });

    it('displays correct character count when value is provided', () => {
        render(<InputWithCharacterLimit {...defaultProps} value="Test" />);
        expect(screen.getByText('4/50')).toBeInTheDocument();
    });

    it('applies disabled class and attribute when disabled', () => {
        render(<InputWithCharacterLimit {...defaultProps} disabled={true} />);
        const wrapper = screen.getByRole('textbox').parentElement;
        const input = screen.getByRole('textbox');

        expect(wrapper).toHaveClass('input-line-wrapper-disabled');
        expect(input).toBeDisabled();
    });

    it('calls onChange when user types', () => {
        render(<InputWithCharacterLimit {...defaultProps} />);
        const input = screen.getByRole('textbox');
        fireEvent.change(input, { target: { value: 'Hello' } });
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', () => {
        const onBlur = jest.fn();
        render(<InputWithCharacterLimit {...defaultProps} onBlur={onBlur} />);
        const input = screen.getByRole('textbox');
        fireEvent.blur(input);
        expect(onBlur).toHaveBeenCalled();
    });

    it('calls onFocus when input gains focus', () => {
        const onFocus = jest.fn();
        render(<InputWithCharacterLimit {...defaultProps} onFocus={onFocus} />);
        const input = screen.getByRole('textbox');
        fireEvent.focus(input);
        expect(onFocus).toHaveBeenCalled();
    });

    it('adds focused class to wrapper on input focus', () => {
        render(<InputWithCharacterLimit {...defaultProps} />);
        const input = screen.getByRole('textbox');
        const wrapper = input.parentElement!;
        fireEvent.focus(input);
        expect(wrapper).toHaveClass('input-line-wrapper-focused');
    });

    it('removes focused class from wrapper on input blur', () => {
        render(<InputWithCharacterLimit {...defaultProps} />);
        const input = screen.getByRole('textbox');
        const wrapper = input.parentElement!;
        fireEvent.focus(input);
        fireEvent.blur(input);
        expect(wrapper).not.toHaveClass('input-line-wrapper-focused');
    });

    it('renders correct placeholder and input type', () => {
        render(<InputWithCharacterLimit {...defaultProps} placeholder="Enter text" type="email" />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('placeholder', 'Enter text');
        expect(input).toHaveAttribute('type', 'email');
    });

    it('uses provided id and name attributes', () => {
        render(<InputWithCharacterLimit {...defaultProps} />);
        const input = screen.getByRole('textbox');
        expect(input).toHaveAttribute('id', 'test-id');
        expect(input).toHaveAttribute('name', 'testName');
    });

    it('handles blur event when onBlur prop is not provided', () => {
        render(<InputWithCharacterLimit {...defaultProps} />);
        const input = screen.getByRole('textbox');
        const wrapper = input.parentElement!;

        // Focus first to set focused state
        fireEvent.focus(input);
        expect(wrapper).toHaveClass('input-line-wrapper-focused');

        // Blur should work without throwing error even when onBlur prop is not provided
        fireEvent.blur(input);
        expect(wrapper).not.toHaveClass('input-line-wrapper-focused');
    });
});
