import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { TextAreaWithCharacterLimit, TextAreaWithCharacterLimitProps } from './TextAreaWithCharacterLimit';

describe('TextAreaWithCharacterLimit', () => {
    const defaultProps: TextAreaWithCharacterLimitProps = {
        value: '',
        onChange: jest.fn(),
        name: 'description',
        id: 'description',
        maxLength: 100,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Render helpers
    const renderTextAreaWithCharacterLimit = (overrideProps: Partial<TextAreaWithCharacterLimitProps> = {}) =>
        render(<TextAreaWithCharacterLimit {...defaultProps} {...overrideProps} />);

    // Element getters
    const getTextArea = () => screen.getByRole('textbox') as HTMLTextAreaElement;
    const getCharacterCounter = (current: number, max: number) => screen.getByText(`${current}/${max}`);
    const getWrapper = () => getTextArea().parentElement!;

    // Action helpers
    const focusTextArea = () => fireEvent.focus(getTextArea());
    const blurTextArea = () => fireEvent.blur(getTextArea());
    const typeInTextArea = (value: string) => fireEvent.change(getTextArea(), { target: { value } });

    // Assertion helpers
    const expectWrapperToHaveClass = (className: string) => expect(getWrapper().className).toContain(className);
    const expectWrapperNotToHaveClass = (className: string) => expect(getWrapper().className).not.toContain(className);
    const expectTextAreaToHaveAttribute = (attribute: string, value: string | number) =>
        expect(getTextArea()).toHaveAttribute(attribute, value.toString());

    // Specific class assertion helpers
    const expectWrapperToBeDisabled = () => expectWrapperToHaveClass('char-limit-textarea__wrapper--disabled');
    const expectWrapperToBeFocused = () => expectWrapperToHaveClass('char-limit-textarea__wrapper--focused');
    const expectWrapperNotToBeFocused = () => expectWrapperNotToHaveClass('char-limit-textarea__wrapper--focused');

    it('renders textarea with initial value and character count', () => {
        renderTextAreaWithCharacterLimit({ value: 'test' });

        const textarea = getTextArea();
        expect(textarea).toBeInTheDocument();
        expect(textarea.value).toBe('test');
        expect(getCharacterCounter(4, 100)).toBeInTheDocument();
    });

    it('calls onChange when typing', () => {
        renderTextAreaWithCharacterLimit();
        typeInTextArea('hello');
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    it('shows character count correctly', () => {
        renderTextAreaWithCharacterLimit({ value: '12345' });
        expect(getCharacterCounter(5, 100)).toBeInTheDocument();
    });

    it('calls onFocus and onBlur when appropriate', () => {
        const onFocus = jest.fn();
        const onBlur = jest.fn();

        renderTextAreaWithCharacterLimit({ onFocus, onBlur });

        focusTextArea();
        expect(onFocus).toHaveBeenCalledTimes(1);

        blurTextArea();
        expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('adds focused class on focus and removes on blur', () => {
        renderTextAreaWithCharacterLimit();

        expectWrapperNotToBeFocused();

        focusTextArea();
        expectWrapperToBeFocused();

        blurTextArea();
        expectWrapperNotToBeFocused();
    });

    it('renders with disabled prop', () => {
        renderTextAreaWithCharacterLimit({ disabled: true });

        const textarea = getTextArea();
        expect(textarea.disabled).toBe(true);

        expectWrapperToBeDisabled();
    });

    it('respects maxLength and placeholder props', () => {
        renderTextAreaWithCharacterLimit({ maxLength: 50, placeholder: 'Enter text' });

        const textarea = screen.getByPlaceholderText('Enter text') as HTMLTextAreaElement;
        expect(textarea.maxLength).toBe(50);
        expectTextAreaToHaveAttribute('placeholder', 'Enter text');
    });
});
