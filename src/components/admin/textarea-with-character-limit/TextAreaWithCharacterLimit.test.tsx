import React, { createRef } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { TextAreaWithCharacterLimit, TextAreaWithCharacterLimitProps } from './TextAreaWithCharacterLimit';

jest.mock('./TextAreaWithCharacterLimit.scss', () => ({}));

jest.mock('@/assets/icons/remove-query.svg', () => ({
    ReactComponent: () => <svg data-testid="remove-icon" />,
}));

jest.mock('@/hooks/admin/use-input-with-character-limit/useInputWithCharacterLimit', () => {
    const React = require('react');

    return {
        useInputWithCharacterLimit: ({
            value,
            maxLength,
            disabled,
            maxLimitWarning,
            onChange,
            onFocus,
            onBlur,
            onWarningChange,
        }: any) => {
            const [isFocused, setIsFocused] = React.useState(false);

            const v = value ?? '';
            const localWarning =
                !disabled && maxLimitWarning && typeof maxLength === 'number' && v.length >= maxLength
                    ? maxLimitWarning
                    : null;

            React.useEffect(() => {
                onWarningChange?.(localWarning);
            }, [localWarning, onWarningChange]);

            const showClearButton = !disabled && v.length > 0;

            return {
                isFocused,
                localWarning,
                showClearButton,
                handleChange: (e: any) => onChange(e),
                handleFocus: (e: any) => {
                    setIsFocused(true);
                    onFocus?.(e);
                },
                handleBlur: (e: any) => {
                    setIsFocused(false);
                    onBlur?.(e);
                },
                handleClear: () => onChange({ target: { value: '' } }),
            };
        },
    };
});

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
    const getClearButton = () => screen.queryByRole('button', { name: 'Clear input' });

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

    it('does not add focused class when disabled', () => {
        renderTextAreaWithCharacterLimit({ disabled: true });

        focusTextArea();
        expectWrapperNotToHaveClass('char-limit-textarea__wrapper--focused');
    });

    it('renders clear button when value is non-empty', () => {
        renderTextAreaWithCharacterLimit({ value: 'x' });
        expect(getClearButton()).toBeInTheDocument();
    });

    it('does not render clear button when disabled', () => {
        renderTextAreaWithCharacterLimit({ value: 'x', disabled: true });
        expect(getClearButton()).not.toBeInTheDocument();
    });

    it('calls onChange with empty value when clear button is clicked', () => {
        const onChange = jest.fn();
        renderTextAreaWithCharacterLimit({ value: 'x', onChange });

        fireEvent.click(screen.getByRole('button', { name: 'Clear input' }));

        expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ target: { value: '' } }));
    });

    it('prevents default on clear button mouse down', () => {
        renderTextAreaWithCharacterLimit({ value: 'x' });

        const btn = screen.getByRole('button', { name: 'Clear input' });
        const evt = new MouseEvent('mousedown', { bubbles: true, cancelable: true });
        btn.dispatchEvent(evt);

        expect(evt.defaultPrevented).toBe(true);
    });

    it('adds error class to clear button when hasError is true', () => {
        renderTextAreaWithCharacterLimit({ value: 'x', hasError: true });

        const btn = screen.getByRole('button', { name: 'Clear input' });
        expect(btn).toHaveClass('char-limit-textarea__clear-button--error');
    });

    it('adds error class to clear button when local warning exists', () => {
        renderTextAreaWithCharacterLimit({
            value: 'x',
            maxLength: 1,
            maxLimitWarning: 'warn',
        });

        const btn = screen.getByRole('button', { name: 'Clear input' });
        expect(btn).toHaveClass('char-limit-textarea__clear-button--error');
    });

    it('forwards ref to textarea', () => {
        const ref = createRef<HTMLTextAreaElement>();
        render(<TextAreaWithCharacterLimit {...defaultProps} ref={ref} />);
        expect(ref.current).toBe(getTextArea());
    });

    it('calls onKeyDown when key is pressed', () => {
        const onKeyDown = jest.fn();
        renderTextAreaWithCharacterLimit({ onKeyDown });

        fireEvent.keyDown(getTextArea(), { key: 'A' });
        expect(onKeyDown).toHaveBeenCalledTimes(1);
    });

    it('uses default rows when not provided', () => {
        renderTextAreaWithCharacterLimit();
        expect(getTextArea()).toHaveAttribute('rows', '4');
    });

    it('applies provided placeholder', () => {
        renderTextAreaWithCharacterLimit({ placeholder: 'Type here' });
        expect(getTextArea()).toHaveAttribute('placeholder', 'Type here');
    });

    it('renders empty string when value is undefined', () => {
        renderTextAreaWithCharacterLimit({ value: undefined as any });
        expect(getTextArea().value).toBe('');
    });

    it('normalises the typed value when normalizeValue is provided', () => {
        renderTextAreaWithCharacterLimit({
            value: 'Hello',
            normalizeValue: (text: string) => text.replace(/ +/g, ' ').replace(/^ +/, ''),
        });

        typeInTextArea('  Hello   world ');

        expect(getTextArea()).toHaveValue('Hello world ');
    });

    it('keeps the typed value as is when normalizeValue is not provided', () => {
        renderTextAreaWithCharacterLimit({ value: 'Hello' });

        typeInTextArea('Hello  world');

        expect(getTextArea()).toHaveValue('Hello  world');
    });

    describe('auto-grow functionality', () => {
        it('does not auto-grow when autoGrow is false (default)', () => {
            renderTextAreaWithCharacterLimit({ autoGrow: false });
            const textarea = getTextArea();
            expect(textarea.style.height).toBe('');
        });

        it('adjusts height on input when autoGrow is true', () => {
            const getComputedStyleSpy = jest.spyOn(globalThis, 'getComputedStyle').mockImplementation(
                () =>
                    ({
                        lineHeight: '20px',
                    }) as CSSStyleDeclaration,
            );

            const { rerender } = renderTextAreaWithCharacterLimit({ autoGrow: true, value: '' });
            const textarea = getTextArea();

            Object.defineProperty(textarea, 'scrollHeight', {
                value: 100,
                configurable: true,
            });

            rerender(<TextAreaWithCharacterLimit {...defaultProps} autoGrow={true} value={'multi\nline\ntext'} />);

            expect(textarea.style.height).not.toBe('');

            getComputedStyleSpy.mockRestore();
        });

        it('respects maxRows limit when autoGrow is true', () => {
            const MOCK_LINE_HEIGHT = 20;
            const TEST_MAX_ROWS = 3;

            const getComputedStyleSpy = jest.spyOn(globalThis, 'getComputedStyle').mockImplementation(
                () =>
                    ({
                        lineHeight: `${MOCK_LINE_HEIGHT}px`,
                    }) as CSSStyleDeclaration,
            );

            renderTextAreaWithCharacterLimit({
                autoGrow: true,
                maxRows: TEST_MAX_ROWS,
                value: 'line1\nline2\nline3\nline4\nline5',
            });

            const textarea = getTextArea();
            const heightValue = Number.parseInt(textarea.style.height, 10);

            expect(heightValue).toBeLessThanOrEqual(MOCK_LINE_HEIGHT * TEST_MAX_ROWS);

            getComputedStyleSpy.mockRestore();
        });
    });

    describe('auto-grow useEffect logic', () => {
        const mockComputedStyle = (overrides: Partial<CSSStyleDeclaration>) =>
            jest.spyOn(globalThis, 'getComputedStyle').mockImplementation(
                () =>
                    ({
                        lineHeight: '20px',
                        fontSize: '16px',
                        paddingTop: '0px',
                        paddingBottom: '0px',
                        ...overrides,
                    }) as CSSStyleDeclaration,
            );

        afterEach(() => {
            jest.restoreAllMocks();
        });

        it('skips style changes when autoGrow is false', () => {
            renderTextAreaWithCharacterLimit({ autoGrow: false, value: 'text' });
            const textarea = getTextArea();

            expect(textarea.style.height).toBe('');
            expect(textarea.style.overflowY).toBe('');
        });

        it('uses the parsed lineHeight when it is a valid number', () => {
            const LINE_HEIGHT = 24;
            const MAX_ROWS = 3;
            const spy = mockComputedStyle({ lineHeight: `${LINE_HEIGHT}px`, paddingTop: '0px', paddingBottom: '0px' });

            renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: MAX_ROWS, value: '' });

            const textarea = getTextArea();
            expect(spy).toHaveBeenCalledWith(textarea);
            expect(Number.parseFloat(textarea.style.height)).toBeGreaterThanOrEqual(0);
        });

        it('falls back to fontSize * 1.2 when lineHeight is NaN (e.g. "normal")', () => {
            const FONT_SIZE = 20;
            const MAX_ROWS = 2;
            mockComputedStyle({
                lineHeight: 'normal',
                fontSize: `${FONT_SIZE}px`,
                paddingTop: '0px',
                paddingBottom: '0px',
            });

            renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: MAX_ROWS, value: 'text' });

            const textarea = getTextArea();
            const heightValue = Number.parseFloat(textarea.style.height);
            const expectedMaxHeight = FONT_SIZE * 1.2 * MAX_ROWS;

            expect(heightValue).toBeLessThanOrEqual(expectedMaxHeight);
        });

        it('falls back to 16px fontSize when both lineHeight and fontSize are unparseable', () => {
            const MAX_ROWS = 2;
            mockComputedStyle({ lineHeight: 'normal', fontSize: '', paddingTop: '0px', paddingBottom: '0px' });

            renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: MAX_ROWS, value: 'text' });

            const textarea = getTextArea();
            const heightValue = Number.parseFloat(textarea.style.height);
            const expectedMaxHeight = 16 * 1.2 * MAX_ROWS;

            expect(heightValue).toBeLessThanOrEqual(expectedMaxHeight);
        });

        it('includes paddingTop and paddingBottom in maxHeight calculation', () => {
            const LINE_HEIGHT = 20;
            const PADDING_TOP = 8;
            const PADDING_BOTTOM = 8;
            const MAX_ROWS = 2;
            mockComputedStyle({
                lineHeight: `${LINE_HEIGHT}px`,
                paddingTop: `${PADDING_TOP}px`,
                paddingBottom: `${PADDING_BOTTOM}px`,
            });

            renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: MAX_ROWS, value: 'text' });

            const textarea = getTextArea();
            const expectedMaxHeight = LINE_HEIGHT * MAX_ROWS + PADDING_TOP + PADDING_BOTTOM;

            expect(Number.parseFloat(textarea.style.height)).toBeLessThanOrEqual(expectedMaxHeight);
        });

        it('sets overflowY to "hidden" when scrollHeight does not exceed maxHeight', () => {
            mockComputedStyle({ lineHeight: '20px', paddingTop: '0px', paddingBottom: '0px' });

            renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: 5, value: 'short' });

            const textarea = getTextArea();
            expect(textarea.style.overflowY).toBe('hidden');
        });

        it('sets overflowY to "auto" and caps height when scrollHeight exceeds maxHeight', () => {
            const LINE_HEIGHT = 20;
            const MAX_ROWS = 3;
            const SCROLL_HEIGHT = 200;
            mockComputedStyle({ lineHeight: `${LINE_HEIGHT}px`, paddingTop: '0px', paddingBottom: '0px' });

            const { rerender } = renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: MAX_ROWS, value: '' });
            const textarea = getTextArea();

            Object.defineProperty(textarea, 'scrollHeight', { value: SCROLL_HEIGHT, configurable: true });

            rerender(
                <TextAreaWithCharacterLimit
                    {...defaultProps}
                    autoGrow={true}
                    maxRows={MAX_ROWS}
                    value={'a lot of text'}
                />,
            );

            expect(textarea.style.overflowY).toBe('auto');
            expect(Number.parseFloat(textarea.style.height)).toBe(LINE_HEIGHT * MAX_ROWS);
        });

        it('treats maxRows=0 as no cap (maxHeight = Infinity)', () => {
            const LINE_HEIGHT = 20;
            mockComputedStyle({ lineHeight: `${LINE_HEIGHT}px`, paddingTop: '0px', paddingBottom: '0px' });

            renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: 0, value: 'text' });

            const textarea = getTextArea();
            expect(textarea.style.overflowY).toBe('hidden');
        });

        it('recalculates height when value prop changes', () => {
            mockComputedStyle({ lineHeight: '20px', paddingTop: '0px', paddingBottom: '0px' });

            const { rerender } = renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: 5, value: 'initial' });
            const textarea = getTextArea();
            const firstHeight = textarea.style.height;

            Object.defineProperty(textarea, 'scrollHeight', { value: 80, configurable: true });
            rerender(
                <TextAreaWithCharacterLimit {...defaultProps} autoGrow={true} maxRows={5} value={'updated value'} />,
            );

            expect(textarea.style.height).toBe('80px');
            expect(textarea.style.height).not.toBe(firstHeight);
        });

        it('recalculates height when maxRows prop changes', () => {
            const LINE_HEIGHT = 20;
            mockComputedStyle({ lineHeight: `${LINE_HEIGHT}px`, paddingTop: '0px', paddingBottom: '0px' });

            const { rerender } = renderTextAreaWithCharacterLimit({ autoGrow: true, maxRows: 5, value: 'text' });
            const textarea = getTextArea();

            Object.defineProperty(textarea, 'scrollHeight', { value: 120, configurable: true });
            rerender(<TextAreaWithCharacterLimit {...defaultProps} autoGrow={true} maxRows={3} value={'text'} />);

            expect(Number.parseFloat(textarea.style.height)).toBe(LINE_HEIGHT * 3);
            expect(textarea.style.overflowY).toBe('auto');
        });
    });
});
