import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { InputWithCharacterLimit } from './InputWithCharacterLimit';

describe('InputWithCharacterLimit', () => {
  const defaultProps = {
    value: '',
    onChange: jest.fn(),
    name: 'testName',
    id: 'test-id',
    maxLength: 50
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders input and character counter', () => {
    render(<InputWithCharacterLimit {...defaultProps} />);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByText('0/50')).toBeInTheDocument();
  });

  test('displays correct character count when value is provided', () => {
    render(<InputWithCharacterLimit {...defaultProps} value="Test" />);
    expect(screen.getByText('4/50')).toBeInTheDocument();
  });

  test('applies disabled class and attribute when disabled', () => {
    render(<InputWithCharacterLimit {...defaultProps} disabled={true} />);
    const wrapper = screen.getByRole('textbox').parentElement;
    const input = screen.getByRole('textbox');

    expect(wrapper).toHaveClass('input-line-wrapper-disabled');
    expect(input).toBeDisabled();
  });

  test('calls onChange when user types', () => {
    render(<InputWithCharacterLimit {...defaultProps} />);
    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'Hello' } });
    expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
  });

  test('calls onBlur when input loses focus', () => {
    const onBlur = jest.fn();
    render(<InputWithCharacterLimit {...defaultProps} onBlur={onBlur} />);
    const input = screen.getByRole('textbox');
    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalled();
  });

  test('calls onFocus when input gains focus', () => {
    const onFocus = jest.fn();
    render(<InputWithCharacterLimit {...defaultProps} onFocus={onFocus} />);
    const input = screen.getByRole('textbox');
    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalled();
  });

  test('adds focused class to wrapper on input focus', () => {
    render(<InputWithCharacterLimit {...defaultProps} />);
    const input = screen.getByRole('textbox');
    const wrapper = input.parentElement!;
    fireEvent.focus(input);
    expect(wrapper).toHaveClass('input-line-wrapper-focused');
  });

  test('removes focused class from wrapper on input blur', () => {
    render(<InputWithCharacterLimit {...defaultProps} />);
    const input = screen.getByRole('textbox');
    const wrapper = input.parentElement!;
    fireEvent.focus(input);
    fireEvent.blur(input);
    expect(wrapper).not.toHaveClass('input-line-wrapper-focused');
  });

  test('renders correct placeholder and input type', () => {
    render(<InputWithCharacterLimit {...defaultProps} placeholder="Enter text" type="email" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('placeholder', 'Enter text');
    expect(input).toHaveAttribute('type', 'email');
  });

  test('uses provided id and name attributes', () => {
    render(<InputWithCharacterLimit {...defaultProps} />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('id', 'test-id');
    expect(input).toHaveAttribute('name', 'testName');
  });
});
