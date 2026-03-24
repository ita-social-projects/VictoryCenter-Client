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

    it('sets aria-invalid when current length exceeds maxLength', () => {
        renderInputWithCharacterLimit({ value: 'abcd', maxLength: 3 });
        expect(getInput()).toHaveAttribute('aria-invalid', 'true');
    });

    it('renders counter below input when counterPosition is bottom', () => {
        renderInputWithCharacterLimit({ counterPosition: 'bottom', value: 'Hello', maxLength: 20 });

        const counter = screen.getByText('5/20');
        expect(counter).toBeInTheDocument();
        expect(counter).toHaveClass('char-limit-input__counter--bottom');
    });

    it('keeps default inside counter position when prop is not provided', () => {
        renderInputWithCharacterLimit({ value: 'Hi', maxLength: 20 });
        const counter = screen.getByText('2/20');
        expect(counter).toBeInTheDocument();
        expect(counter).not.toHaveClass('char-limit-input__counter--bottom');
    });
});
