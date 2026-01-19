import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextAreaWithBulletBehavior } from './TextAreaWithBulletBehavior';

describe('TextAreaWithBulletBehavior', () => {
    const id = 'test';
    const name = 'test';
    const maxLength = 100;
    let handleChange: jest.Mock;
    let handleFocus: jest.Mock;
    let handleBlur: jest.Mock;
    const originalAddEventListener = document.addEventListener;
    const originalRemoveEventListener = document.removeEventListener;

    beforeEach(() => {
        handleChange = jest.fn();
        handleFocus = jest.fn();
        handleBlur = jest.fn();

        jest.spyOn(document, 'addEventListener').mockImplementation((event, handler, options) => {
            if (event === 'keydown') {
                (window as any).keydownHandler = handler;
            }
            return originalAddEventListener.call(document, event, handler, options);
        });

        jest.spyOn(document, 'removeEventListener').mockImplementation((event, handler, options) => {
            if (event === 'keydown' && (window as any).keydownHandler === handler) {
                (window as any).keydownHandler = undefined;
            }
            return originalRemoveEventListener.call(document, event, handler, options);
        });
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    const renderComponent = (value = '') =>
        render(
            <TextAreaWithBulletBehavior
                id={id}
                name={name}
                value={value}
                onChange={handleChange}
                onFocus={handleFocus}
                onBlur={handleBlur}
                maxLength={maxLength}
            />,
        );

    it('should render the textarea with initial value', () => {
        renderComponent('• Line');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        expect(textarea.value).toBe('• Line');
    });

    it('should insert bullet on focus if value is empty', () => {
        renderComponent('');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.focus(textarea);
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: expect.objectContaining({ value: '• ' }) }),
        );
    });

    it('should not insert bullet on focus if value already exists', () => {
        renderComponent('• Already');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.focus(textarea);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should prepend bullet on blur if missing', () => {
        renderComponent('Line without bullet');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.blur(textarea);
        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({ target: expect.objectContaining({ value: '• Line without bullet' }) }),
        );
    });

    it('should not prepend bullet on blur if already present', () => {
        renderComponent('• Line');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.blur(textarea);
        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should insert bullet on Enter key', () => {
        render(
            <TextAreaWithBulletBehavior value="• " onChange={handleChange} id={id} name={name} maxLength={maxLength} />,
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        textarea.value = '• ';
        textarea.selectionStart = 2;
        textarea.selectionEnd = 2;
        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.focus(textarea);

        (window as any).keydownHandler?.({
            key: 'Enter',
            target: textarea,
            preventDefault: jest.fn(),
        });

        const lastCall = handleChange.mock.calls[handleChange.mock.calls.length - 1][0];
        expect(lastCall.target.value).toBe('• \n• ');
    });

    it('should respect maxLength when inserting new bullet', () => {
        const shortMax = 10;
        render(
            <TextAreaWithBulletBehavior
                id="test"
                name="test"
                value="• 1234567"
                onChange={handleChange}
                maxLength={shortMax}
            />,
        );
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.focus(textarea);

        (window as any).keydownHandler({
            key: 'Enter',
            target: textarea,
            preventDefault: jest.fn(),
        });

        const callArg = handleChange.mock.calls[0][0].target.value;
        expect(callArg.length).toBeLessThanOrEqual(shortMax);
    });

    it('should not insert bullet on Enter when Shift is pressed', () => {
        render(
            <TextAreaWithBulletBehavior id="test" name="test" value="• Line" onChange={handleChange} maxLength={100} />,
        );
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        fireEvent.focus(textarea);

        (window as any).keydownHandler({
            key: 'Enter',
            shiftKey: true,
            target: textarea,
            preventDefault: jest.fn(),
        });

        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should not insert any text on Enter if maxLength is already reached', () => {
        render(
            <TextAreaWithBulletBehavior
                id="test-max"
                name="test"
                value="• 12345"
                onChange={handleChange}
                maxLength={7}
            />,
        );
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        textarea.selectionStart = 7;
        textarea.selectionEnd = 7;
        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.focus(textarea);

        (window as any).keydownHandler({
            key: 'Enter',
            target: textarea,
            preventDefault: jest.fn(),
        });

        expect(handleChange).not.toHaveBeenCalled();
    });

    it('should trigger autosize logic on value change', () => {
        jest.useFakeTimers();
        renderComponent('• Initial');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        Object.defineProperty(textarea, 'scrollHeight', { value: 150 });
        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.change(textarea, { target: { value: '• Initial\n• Second' } });

        jest.runAllTimers();

        expect(textarea.style.height).toBe('150px');
        jest.useRealTimers();
    });

    it('does not reinsert bullet on blur if user deleted it', () => {
        renderComponent('• ');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.change(textarea, { target: { value: '' } });
        fireEvent.blur(textarea);

        expect(handleChange).toHaveBeenCalledTimes(1); // тільки change
    });

    it('replaces selected text with new bullet on Enter', () => {
        render(
            <TextAreaWithBulletBehavior
                id="select"
                name="test"
                value="• Hello World"
                onChange={handleChange}
                maxLength={100}
            />,
        );

        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;
        textarea.selectionStart = 2;
        textarea.selectionEnd = 7; // "Hello"

        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);
        fireEvent.focus(textarea);

        (window as any).keydownHandler({
            key: 'Enter',
            target: textarea,
            preventDefault: jest.fn(),
        });

        expect(handleChange.mock.calls[0][0].target.value).toBe('• \n•  World');
    });

    it('does not crash autosize when textarea element is missing', () => {
        renderComponent('• Text');

        jest.spyOn(document, 'getElementById').mockReturnValue(null);

        fireEvent.change(screen.getByRole('textbox'), {
            target: { value: '• Changed' },
        });

        expect(handleChange).toHaveBeenCalled();
    });

    it('inserts bullet on focus when value contains only spaces', () => {
        renderComponent('   ');
        const textarea = screen.getByRole('textbox') as HTMLTextAreaElement;

        jest.spyOn(document, 'getElementById').mockReturnValue(textarea);

        fireEvent.focus(textarea);

        expect(handleChange).toHaveBeenCalledWith(
            expect.objectContaining({
                target: expect.objectContaining({ value: '• ' }),
            }),
        );
    });
});
