import { render, screen, fireEvent, createEvent } from '@testing-library/react';
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
    const getWrapper = () => getInput().parentElement!;

    const focusInput = () => fireEvent.focus(getInput());
    const blurInput = () => fireEvent.blur(getInput());
    const typeInInput = (value: string) => fireEvent.change(getInput(), { target: { value } });

    const expectWrapperToHaveClass = (className: string) => expect(getWrapper()).toHaveClass(className);
    const expectWrapperNotToHaveClass = (className: string) => expect(getWrapper()).not.toHaveClass(className);
    const expectInputToHaveAttribute = (attribute: string, value: string) =>
        expect(getInput()).toHaveAttribute(attribute, value);

    const expectWrapperToBeDisabled = () => expectWrapperToHaveClass('char-limit-input--disabled');
    const expectWrapperToBeFocused = () => expectWrapperToHaveClass('char-limit-input--focused');
    const expectWrapperNotToBeFocused = () => expectWrapperNotToHaveClass('char-limit-input--focused');

    it('renders input and character counter', () => {
        renderInputWithCharacterLimit();
        expect(getInput()).toBeInTheDocument();
        expect(getCharacterCounter(0, 50)).toBeInTheDocument();
    });

    it('displays correct character count when value is provided', () => {
        renderInputWithCharacterLimit({ value: 'Test' });
        expect(getCharacterCounter(4, 50)).toBeInTheDocument();
    });

    it('applies disabled class and attribute when disabled', () => {
        renderInputWithCharacterLimit({ disabled: true });

        expectWrapperToBeDisabled();
        expect(getInput()).toBeDisabled();
    });

    it('calls onChange when user types', () => {
        renderInputWithCharacterLimit();
        typeInInput('Hello');
        expect(defaultProps.onChange).toHaveBeenCalledTimes(1);
    });

    it('calls onBlur when input loses focus', () => {
        const onBlur = jest.fn();
        renderInputWithCharacterLimit({ onBlur });
        blurInput();
        expect(onBlur).toHaveBeenCalled();
    });

    it('calls onFocus when input gains focus', () => {
        const onFocus = jest.fn();
        renderInputWithCharacterLimit({ onFocus });
        focusInput();
        expect(onFocus).toHaveBeenCalled();
    });

    it('adds focused class to wrapper on input focus', () => {
        renderInputWithCharacterLimit();
        focusInput();
        expectWrapperToBeFocused();
    });

    it('removes focused class from wrapper on input blur', () => {
        renderInputWithCharacterLimit();
        focusInput();
        blurInput();
        expectWrapperNotToBeFocused();
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

    it('handles blur event when onBlur prop is not provided', () => {
        renderInputWithCharacterLimit();

        focusInput();
        expectWrapperToBeFocused();

        blurInput();
        expectWrapperNotToBeFocused();
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

    it('sets aria-invalid when current length exceeds maxLength', () => {
        renderInputWithCharacterLimit({ value: 'abcd', maxLength: 3 });
        expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    });
});
