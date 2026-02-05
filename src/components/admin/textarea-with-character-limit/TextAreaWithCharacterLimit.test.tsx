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

    const renderTextAreaWithCharacterLimit = (overrideProps: Partial<TextAreaWithCharacterLimitProps> = {}) =>
        render(<TextAreaWithCharacterLimit {...defaultProps} {...overrideProps} />);

    const getTextArea = () => screen.getByRole('textbox') as HTMLTextAreaElement;
    const getWrapper = () => getTextArea().parentElement!;

    const focusTextArea = () => fireEvent.focus(getTextArea());
    const blurTextArea = () => fireEvent.blur(getTextArea());
    const typeInTextArea = (value: string) => fireEvent.change(getTextArea(), { target: { value } });

    const expectWrapperToHaveClass = (className: string) => expect(getWrapper().className).toContain(className);
    const expectWrapperNotToHaveClass = (className: string) => expect(getWrapper().className).not.toContain(className);

    it('renders textarea with initial value', () => {
        renderTextAreaWithCharacterLimit({ value: 'test' });

        const textarea = getTextArea();
        expect(textarea).toBeInTheDocument();
        expect(textarea.value).toBe('test');
    });

    it('renders with disabled prop', () => {
        renderTextAreaWithCharacterLimit({ disabled: true });

        const textarea = getTextArea();
        expect(textarea.disabled).toBe(true);
        expectWrapperToHaveClass('char-limit-textarea__wrapper--disabled');
    });

    it('calls onChange when typing', () => {
        renderTextAreaWithCharacterLimit();
        typeInTextArea('hello');
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
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

        expectWrapperNotToHaveClass('char-limit-textarea__wrapper--focused');

        focusTextArea();
        expectWrapperToHaveClass('char-limit-textarea__wrapper--focused');

        blurTextArea();
        expectWrapperNotToHaveClass('char-limit-textarea__wrapper--focused');
    });
});
