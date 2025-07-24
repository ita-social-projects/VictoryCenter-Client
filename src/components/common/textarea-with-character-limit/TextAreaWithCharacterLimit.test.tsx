import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextAreaWithCharacterLimit } from './TextAreaWithCharacterLimit';

describe('TextAreaWithCharacterLimit', () => {
    const defaultProps = {
        value: '',
        onChange: jest.fn(),
        name: 'description',
        id: 'description',
        maxLength: 100,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders textarea with initial value and character count', () => {
        render(<TextAreaWithCharacterLimit {...defaultProps} value="test" />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea).toBeInTheDocument();
        expect(textarea.value).toBe('test');
        expect(screen.getByText('4/100')).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        render(<TextAreaWithCharacterLimit {...defaultProps} />);

        const textarea = screen.getByRole('textbox');
        fireEvent.change(textarea, { target: { value: 'hello' } });

        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    it('shows character count correctly', () => {
        render(<TextAreaWithCharacterLimit {...defaultProps} value="12345" />);
        expect(screen.getByText('5/100')).toBeInTheDocument();
    });

    it('calls onFocus and onBlur when appropriate', () => {
        const onFocus = jest.fn();
        const onBlur = jest.fn();

        render(<TextAreaWithCharacterLimit {...defaultProps} onFocus={onFocus} onBlur={onBlur} />);

        const textarea = screen.getByRole('textbox');

        fireEvent.focus(textarea);
        expect(onFocus).toHaveBeenCalledTimes(1);

        fireEvent.blur(textarea);
        expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('adds focused class on focus and removes on blur', () => {
        render(<TextAreaWithCharacterLimit {...defaultProps} />);

        const wrapper = screen.getByRole('textbox').parentElement!;
        expect(wrapper.className).not.toContain('textarea-wrapper-focused');

        fireEvent.focus(screen.getByRole('textbox'));
        expect(wrapper.className).toContain('textarea-wrapper-focused');

        fireEvent.blur(screen.getByRole('textbox'));
        expect(wrapper.className).not.toContain('textarea-wrapper-focused');
    });

    it('renders with disabled prop', () => {
        render(<TextAreaWithCharacterLimit {...defaultProps} disabled />);

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea.disabled).toBe(true);

        const wrapper = textarea.parentElement!;
        expect(wrapper.className).toContain('disabled');
    });

    it('respects maxLength and placeholder props', () => {
        render(<TextAreaWithCharacterLimit {...defaultProps} maxLength={50} placeholder="Enter text" />);

        const textarea = screen.getByPlaceholderText('Enter text') as HTMLTextAreaElement;
        expect(textarea.maxLength).toBe(50);
    });
});
