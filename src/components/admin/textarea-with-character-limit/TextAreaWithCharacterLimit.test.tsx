import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
        jest.useFakeTimers();
    });

    afterEach(() => {
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
    });

    // Render helpers
    const renderTextAreaWithCharacterLimit = (overrideProps: Partial<TextAreaWithCharacterLimitProps> = {}) =>
        render(<TextAreaWithCharacterLimit {...defaultProps} {...overrideProps} />);

    // Element getters
    const getTextArea = () => screen.getByRole('textbox') as HTMLTextAreaElement;
    const getWrapper = () => getTextArea().parentElement!;
    const getClearButton = () => screen.queryByRole('button', { name: /clear input/i });

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

    it('renders textarea with initial value', () => {
        renderTextAreaWithCharacterLimit({ value: 'test' });
        const textarea = getTextArea();
        expect(textarea).toBeInTheDocument();
        expect(textarea.value).toBe('test');
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

    it('respects placeholder prop', () => {
        renderTextAreaWithCharacterLimit({ placeholder: 'Enter text' });
        expectTextAreaToHaveAttribute('placeholder', 'Enter text');
    });

    it('calls onKeyDown when key is pressed', () => {
        const onKeyDown = jest.fn();
        renderTextAreaWithCharacterLimit({ onKeyDown });

        fireEvent.keyDown(getTextArea(), { key: 'Enter' });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it('shows clear button when focused and has value', () => {
        renderTextAreaWithCharacterLimit({ value: 'test' });

        expect(getClearButton()).not.toBeInTheDocument();

        focusTextArea();
        expect(getClearButton()).toBeInTheDocument();
    });

    it('hides clear button when blurred', () => {
        renderTextAreaWithCharacterLimit({ value: 'test' });

        focusTextArea();
        expect(getClearButton()).toBeInTheDocument();

        blurTextArea();
        expect(getClearButton()).not.toBeInTheDocument();
    });

    it('does not show clear button when disabled', () => {
        renderTextAreaWithCharacterLimit({ value: 'test', disabled: true });

        focusTextArea();
        expect(getClearButton()).not.toBeInTheDocument();
    });

    it('clears value when clear button is clicked', () => {
        const onChange = jest.fn();
        renderTextAreaWithCharacterLimit({ value: 'test', onChange });

        focusTextArea();
        const clearButton = getClearButton();
        expect(clearButton).toBeInTheDocument();

        fireEvent.click(clearButton!);
        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({ value: '' }),
            }),
        );
    });

    it('shows warning when max length is exceeded', () => {
        const onWarningChange = jest.fn();
        const maxLimitWarning = 'Maximum length exceeded';
        renderTextAreaWithCharacterLimit({ maxLength: 10, maxLimitWarning, onWarningChange });

        typeInTextArea('This is a very long text');

        expect(onWarningChange).toHaveBeenCalledWith(maxLimitWarning);
    });

    it('clears warning after 2 seconds', async () => {
        const onWarningChange = jest.fn();
        const maxLimitWarning = 'Maximum length exceeded';
        renderTextAreaWithCharacterLimit({ maxLength: 10, maxLimitWarning, onWarningChange });

        typeInTextArea('This is a very long text');
        expect(onWarningChange).toHaveBeenCalledWith(maxLimitWarning);

        jest.advanceTimersByTime(2000);

        await waitFor(() => {
            expect(onWarningChange).toHaveBeenCalledWith(null);
        });
    });

    it('clears warning when typing within limit after exceeding', () => {
        const onWarningChange = jest.fn();
        const maxLimitWarning = 'Maximum length exceeded';
        renderTextAreaWithCharacterLimit({ maxLength: 10, maxLimitWarning, onWarningChange });

        typeInTextArea('This is a very long text');
        expect(onWarningChange).toHaveBeenCalledWith(maxLimitWarning);

        typeInTextArea('Short');
        expect(onWarningChange).toHaveBeenCalledWith(null);
    });

    it('truncates value to maxLength when exceeded', () => {
        const onChange = jest.fn();
        renderTextAreaWithCharacterLimit({ maxLength: 10, onChange });

        typeInTextArea('This is a very long text');

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({
                    value: expect.stringMatching(/^.{0,10}$/),
                }),
            }),
        );
    });

    it('applies error class to clear button when hasError is true', () => {
        renderTextAreaWithCharacterLimit({ value: 'test', hasError: true });

        focusTextArea();
        const clearButton = getClearButton();
        expect(clearButton).toHaveClass('char-limit-textarea__clear-button--error');
    });

    it('applies error class to clear button when warning is shown', () => {
        const maxLimitWarning = 'Maximum length exceeded';
        renderTextAreaWithCharacterLimit({ maxLength: 10, maxLimitWarning, value: 'test' });

        focusTextArea();
        typeInTextArea('This is a very long text');

        const clearButton = getClearButton();
        expect(clearButton).toHaveClass('char-limit-textarea__clear-button--error');
    });
});
