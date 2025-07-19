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

  test('applies has-text class when input has value', () => {
    render(<InputWithCharacterLimit {...defaultProps} value="abc" />);
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('has-text');
  });

  test('does not apply has-text class when input is empty', () => {
    render(<InputWithCharacterLimit {...defaultProps} value="" />);
    const input = screen.getByRole('textbox');
    expect(input).not.toHaveClass('has-text');
  });

  test('applies disabled class and attribute when disabled', () => {
    render(<InputWithCharacterLimit {...defaultProps} disabled={true} />);
    const wrapper = screen.getByRole('textbox').parentElement;
    const input = screen.getByRole('textbox');

    expect(wrapper).toHaveClass('disabled');
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

  test('wrapper has input-line-wrapper-has-value class when value is present', () => {
    render(<InputWithCharacterLimit {...defaultProps} value="abc" />);
    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).toHaveClass('input-line-wrapper-has-value');
  });

  test('wrapper does not have input-line-wrapper-has-value class when value is empty', () => {
    render(<InputWithCharacterLimit {...defaultProps} value="" />);
    const wrapper = screen.getByRole('textbox').parentElement;
    expect(wrapper).not.toHaveClass('input-line-wrapper-has-value');
  });
});
