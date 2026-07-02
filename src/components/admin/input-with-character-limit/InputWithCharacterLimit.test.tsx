import { act, render, screen, fireEvent, createEvent } from '@testing-library/react';
import { InputWithCharacterLimit, InputWithCharacterLimitProps } from './InputWithCharacterLimit';

describe('InputWithCharacterLimit', () => {
    const defaultProps: InputWithCharacterLimitProps = {
        value: '',
        onChange: jest.fn(),
        name: 'testName',
        id: 'test-id',
        maxLength: 50,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderInputWithCharacterLimit = (overrideProps: Partial<InputWithCharacterLimitProps> = {}) =>
        render(<InputWithCharacterLimit {...defaultProps} {...overrideProps} />);

    const getInput = () => screen.getByRole('textbox');
    const getCharacterCounter = (current: number, max: number) => screen.getByText(`${current}/${max}`);
    const getWrapper = () => getInput().closest('.char-limit-input')!;

    const focusInput = () => fireEvent.focus(getInput());
    const blurInput = () => fireEvent.blur(getInput());

    const expectWrapperToHaveClass = (className: string) => expect(getWrapper()).toHaveClass(className);
    const expectWrapperNotToHaveClass = (className: string) => expect(getWrapper()).not.toHaveClass(className);
    const expectInputToHaveAttribute = (attribute: string, value: string) =>
        expect(getInput()).toHaveAttribute(attribute, value);

    it('renders input and character counter', () => {
        renderInputWithCharacterLimit();
        expect(getInput()).toBeInTheDocument();
        expect(getCharacterCounter(0, 50)).toBeInTheDocument();
    });

    it('displays correct character count when value is provided', () => {
        renderInputWithCharacterLimit({ value: 'Test' });
        expect(getCharacterCounter(4, 50)).toBeInTheDocument();
    });

    it('does not render character counter when showCounter is false and keeps aria-describedby linked to countId', () => {
        renderInputWithCharacterLimit({ showCounter: false });

        expect(screen.queryByText('0/50')).not.toBeInTheDocument();
        expect(getInput()).toHaveAttribute('aria-describedby', 'test-id-character-count');
    });

    it('renders correct placeholder and input type', () => {
        renderInputWithCharacterLimit({ placeholder: 'Enter text', type: 'email' });

        expectInputToHaveAttribute('placeholder', 'Enter text');
        expectInputToHaveAttribute('type', 'email');
    });

    it('uses provided id and name attributes', () => {
        renderInputWithCharacterLimit();

        expectInputToHaveAttribute('id', 'test-id');
        expectInputToHaveAttribute('name', 'testName');
    });

    it('applies disabled class and attribute when disabled', () => {
        renderInputWithCharacterLimit({ disabled: true });

        expectWrapperToHaveClass('char-limit-input--disabled');
        expect(getInput()).toBeDisabled();
    });

    it('adds focused class to wrapper on input focus', () => {
        renderInputWithCharacterLimit();
        focusInput();
        expectWrapperToHaveClass('char-limit-input--focused');
    });

    it('removes focused class from wrapper on input blur', () => {
        renderInputWithCharacterLimit();
        focusInput();
        blurInput();
        expectWrapperNotToHaveClass('char-limit-input--focused');
    });

    it('clears input via clear button and forwards synthetic change event', () => {
        const onChange = jest.fn();
        render(
            <InputWithCharacterLimit value="Hello" onChange={onChange} name="testName" id="test-id" maxLength={50} />,
        );

        const btn = screen.getByRole('button', { name: /clear input/i });

        fireEvent.focus(screen.getByRole('textbox'));

        const ev = createEvent.mouseDown(btn);
        ev.preventDefault = jest.fn();
        fireEvent(btn, ev);

        expect(ev.preventDefault).toHaveBeenCalled();

        fireEvent.click(btn);

        expect(onChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({
                    value: '',
                    name: 'testName',
                    id: 'test-id',
                }),
            }),
        );
    });

    it('hides clear button when value is empty', () => {
        const { rerender } = renderInputWithCharacterLimit({ value: 'Hello' });

        focusInput();
        expect(screen.getByRole('button', { name: /clear input/i })).not.toHaveClass(
            'char-limit-input__clear-button--hidden',
        );

        rerender(<InputWithCharacterLimit {...defaultProps} value="" />);

        expect(screen.getByRole('button', { name: /clear input/i })).toHaveClass(
            'char-limit-input__clear-button--hidden',
        );
    });

    it('sets aria-invalid when current length exceeds maxLength', () => {
        renderInputWithCharacterLimit({ value: 'abcd', maxLength: 3 });
        expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    });

    it('adds error class to wrapper when hasError is true', () => {
        renderInputWithCharacterLimit({ hasError: true });
        expectWrapperToHaveClass('char-limit-input--error');
    });
    it('calls onFocus and onBlur callbacks', () => {
        const onFocus = jest.fn();
        const onBlur = jest.fn();
        renderInputWithCharacterLimit({ onFocus, onBlur });

        focusInput();
        expect(onFocus).toHaveBeenCalledTimes(1);

        blurInput();
        expect(onBlur).toHaveBeenCalledTimes(1);
    });

    it('applies className to input field', () => {
        renderInputWithCharacterLimit({ className: 'custom-class' });
        expect(getInput()).toHaveClass('custom-class');
    });

    it('renders empty string when value is undefined', () => {
        renderInputWithCharacterLimit({ value: undefined as any });
        expect((getInput() as HTMLInputElement).value).toBe('');
    });

    it('adds clear button visible and error classes when hasError and focused with value', () => {
        renderInputWithCharacterLimit({ value: 'abc', hasError: true });
        focusInput();
        const btn = screen.getByRole('button', { name: /clear input/i });
        expect(btn).toHaveClass('char-limit-input__clear-button--error');
    });

    it('clear button tabIndex is 0 when visible and -1 when not', () => {
        const { rerender } = renderInputWithCharacterLimit({ value: 'abc' });
        focusInput();
        expect(screen.getByRole('button', { name: /clear input/i })).toHaveAttribute('tabIndex', '0');

        blurInput();
        rerender(<InputWithCharacterLimit {...defaultProps} value="" />);
        expect(screen.getByRole('button', { name: /clear input/i })).toHaveAttribute('tabIndex', '-1');
    });

    it('renders textarea when rows prop is provided', () => {
        renderInputWithCharacterLimit({ rows: 3 });
        expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
        expectWrapperToHaveClass('char-limit-input--textarea');
    });

    it('renders textarea when autoGrow is true', () => {
        renderInputWithCharacterLimit({ autoGrow: true });
        expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA');
        expectWrapperToHaveClass('char-limit-input--textarea');
    });

    it('adjusts height when autoGrow is true and value changes', () => {
        const { rerender } = renderInputWithCharacterLimit({ autoGrow: true, value: '' });
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        Object.defineProperty(textarea, 'scrollHeight', { value: 80, configurable: true });

        rerender(<InputWithCharacterLimit {...defaultProps} autoGrow={true} value="line1\nline2" />);

        expect(textarea.style.height).not.toBe('');
    });

    it('sets aria-invalid on textarea when rows provided and length exceeds maxLength', () => {
        renderInputWithCharacterLimit({ rows: 3, value: 'abcd', maxLength: 3 });
        expect(screen.getByRole('textbox')).toHaveAttribute('aria-invalid', 'true');
    });

    it('resets localValue to the value prop via microtask when parent onChange does not update state', async () => {
        const cappedValue = '100,12';
        const onChange = jest.fn();

        render(
            <InputWithCharacterLimit
                value={cappedValue}
                onChange={onChange}
                name="amountUah"
                id="amount-uah"
                maxLength={20}
                showCounter={false}
            />,
        );

        const input = screen.getByRole('textbox') as HTMLInputElement;
        expect(input.value).toBe(cappedValue);

        fireEvent.change(input, { target: { value: '100,123' } });

        expect(input.value).toBe('100,123');

        await act(async () => {
            await Promise.resolve();
        });

        expect(input.value).toBe(cappedValue);
    });
});
