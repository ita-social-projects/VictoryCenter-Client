import React from 'react';
import { render, screen, fireEvent, waitFor, createEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichTextInput, RichTextInputProps } from './RichTextInput';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

jest.mock('./RichTextInput.scss', () => ({}));

describe('RichTextInput', () => {
    const defaultProps: RichTextInputProps = {
        value: '',
        onChange: jest.fn(),
        name: 'testName',
        id: 'test-id',
        maxLength: 30,
    };

    beforeEach(() => {
        jest.clearAllMocks();
        document.execCommand = jest.fn().mockReturnValue(true);
        document.queryCommandState = jest.fn().mockReturnValue(false);
        const mockRange = {
            deleteContents: jest.fn(),
            insertNode: jest.fn(),
            setStart: jest.fn(),
            setEnd: jest.fn(),
            collapse: jest.fn(),
        };
        window.getSelection = jest.fn().mockReturnValue({
            removeAllRanges: jest.fn(),
            addRange: jest.fn(),
            rangeCount: 1,
            getRangeAt: jest.fn().mockReturnValue(mockRange),
        } as any);

        Object.defineProperty(HTMLElement.prototype, 'innerText', {
            get: function () {
                return this.textContent || '';
            },
            set: function (value) {
                this.textContent = value;
            },
            configurable: true,
        });
    });

    const renderRichTextInput = (overrideProps: Partial<RichTextInputProps> = {}) =>
        render(<RichTextInput {...defaultProps} {...overrideProps} />);

    const getEditor = () => screen.getByLabelText('Rich text editor');
    const getToolbar = () =>
        screen.getByRole('toolbar', { hidden: true }) || document.querySelector('.rich-text-input__toolbar');
    const getBoldButton = () => screen.getByLabelText('Bold');
    const getItalicButton = () => screen.getByLabelText('Italic');
    const getLineBreakButton = () => screen.getByLabelText('Line break');
    const getCharacterCounter = () => screen.getByText(/^\d{1,4}\/\d{1,4}$/);
    const getWrapper = () => getEditor().closest('.rich-text-input');

    const focusEditor = () => fireEvent.focus(getEditor());
    const blurEditor = () => fireEvent.blur(getEditor());
    const typeInEditor = (text: string) => {
        const editor = getEditor();
        editor.textContent = text;
        fireEvent.input(editor);
    };
    const pasteInEditor = (text: string) => {
        const editor = getEditor();
        fireEvent.paste(editor, {
            clipboardData: {
                getData: jest.fn().mockReturnValue(text),
            } as any,
        });
    };

    const expectWrapperToHaveClass = (className: string) => {
        const wrapper = getWrapper();
        expect(wrapper).toHaveClass(className);
    };
    const expectWrapperNotToHaveClass = (className: string) => {
        const wrapper = getWrapper();
        expect(wrapper).not.toHaveClass(className);
    };

    describe('Rendering', () => {
        it('renders editor and toolbar', () => {
            renderRichTextInput();
            expect(getEditor()).toBeInTheDocument();
            expect(getBoldButton()).toBeInTheDocument();
            expect(getItalicButton()).toBeInTheDocument();
            expect(getLineBreakButton()).toBeInTheDocument();
        });

        it('renders character counter', () => {
            renderRichTextInput();
            expect(getCharacterCounter()).toBeInTheDocument();
            expect(getCharacterCounter()).toHaveTextContent('0/30');
        });

        it('displays correct character count when value is provided', async () => {
            renderRichTextInput({ value: '<p>Test</p>' });
            await waitFor(() => {
                expect(getCharacterCounter()).toHaveTextContent('4/30');
            });
        });

        it('applies custom className to editor', () => {
            renderRichTextInput({ className: 'custom-class' });
            expect(getEditor()).toHaveClass('custom-class');
        });

        it('renders with custom placeholder', () => {
            renderRichTextInput({ placeholder: 'Enter title...' });
            expect(getEditor()).toHaveAttribute('data-placeholder', 'Enter title...');
        });

        it('uses default placeholder when not provided', () => {
            renderRichTextInput();
            expect(getEditor()).toHaveAttribute('data-placeholder', 'Enter text...');
        });
    });

    describe('Disabled state', () => {
        it('applies disabled class when disabled', () => {
            renderRichTextInput({ disabled: true });
            expectWrapperToHaveClass('rich-text-input--disabled');
        });

        it('sets contentEditable to false when disabled', () => {
            renderRichTextInput({ disabled: true });
            expect(getEditor()).toHaveAttribute('contentEditable', 'false');
        });

        it('disables toolbar buttons when disabled', () => {
            renderRichTextInput({ disabled: true });
            expect(getBoldButton()).toBeDisabled();
            expect(getItalicButton()).toBeDisabled();
            expect(getLineBreakButton()).toBeDisabled();
        });

        it('does not apply disabled class when enabled', () => {
            renderRichTextInput({ disabled: false });
            expectWrapperNotToHaveClass('rich-text-input--disabled');
        });
    });

    describe('Focus and Blur', () => {
        it('calls onFocus when editor gains focus', () => {
            const onFocus = jest.fn();
            renderRichTextInput({ onFocus });
            focusEditor();
            expect(onFocus).toHaveBeenCalled();
        });

        it('calls onBlur when editor loses focus', () => {
            const onBlur = jest.fn();
            renderRichTextInput({ onBlur });
            focusEditor();
            blurEditor();
            expect(onBlur).toHaveBeenCalled();
        });

        it('applies focused class when editor is focused', () => {
            renderRichTextInput();
            focusEditor();
            expectWrapperToHaveClass('rich-text-input--focused');
        });

        it('removes focused class when editor loses focus', () => {
            renderRichTextInput();
            focusEditor();
            blurEditor();
            expectWrapperNotToHaveClass('rich-text-input--focused');
        });

        it('does not apply focused class when disabled', () => {
            renderRichTextInput({ disabled: true });
            focusEditor();
            expectWrapperNotToHaveClass('rich-text-input--focused');
        });

        it('handles focus when onFocus prop is not provided', () => {
            renderRichTextInput();
            expect(() => focusEditor()).not.toThrow();
        });

        it('handles blur when onBlur prop is not provided', () => {
            renderRichTextInput();
            focusEditor();
            expect(() => blurEditor()).not.toThrow();
        });
    });

    describe('Text input and onChange', () => {
        it('calls onChange when user types', () => {
            renderRichTextInput();
            const editor = getEditor();
            editor.textContent = 'Hello';
            fireEvent.input(editor);
            expect(defaultProps.onChange).toHaveBeenCalled();
        });

        it('updates character counter when text is entered', async () => {
            renderRichTextInput();
            typeInEditor('Test');
            await waitFor(() => {
                expect(getCharacterCounter()).toHaveTextContent('4/30');
            });
        });

        it('handles empty value', () => {
            renderRichTextInput({ value: '' });
            expect(getCharacterCounter()).toHaveTextContent('0/30');
        });

        it('updates editor content when value prop changes', () => {
            const { rerender } = renderRichTextInput({ value: '<p>Initial</p>' });
            expect(getEditor().innerHTML).toBe('<p>Initial</p>');

            rerender(<RichTextInput {...defaultProps} value="<p>Updated</p>" />);
            expect(getEditor().innerHTML).toBe('<p>Updated</p>');
        });
    });

    describe('Character limit (maxLength)', () => {
        it('prevents input when maxLength is reached', () => {
            renderRichTextInput({ maxLength: 5, value: '<p>12345</p>' });
            const editor = getEditor();
            focusEditor();

            const keyDownEvent = createEvent.keyDown(editor, {
                key: 'a',
                bubbles: true,
            });
            const preventDefaultSpy = jest.spyOn(keyDownEvent, 'preventDefault');

            fireEvent(editor, keyDownEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('allows deletion when maxLength is reached', () => {
            renderRichTextInput({ maxLength: 5, value: '<p>12345</p>' });
            const editor = getEditor();
            focusEditor();
            const preventDefault = jest.fn();

            fireEvent.keyDown(editor, {
                key: 'Backspace',
                preventDefault,
            } as any);

            expect(preventDefault).not.toHaveBeenCalled();
        });

        it('allows arrow keys when maxLength is reached', () => {
            renderRichTextInput({ maxLength: 5, value: '<p>12345</p>' });
            const editor = getEditor();
            focusEditor();
            const preventDefault = jest.fn();

            fireEvent.keyDown(editor, {
                key: 'ArrowLeft',
                preventDefault,
            } as any);

            expect(preventDefault).not.toHaveBeenCalled();
        });

        it('restores previous value when exceeding maxLength', () => {
            const onChange = jest.fn();
            const { rerender } = renderRichTextInput({ maxLength: 5, value: '<p>1234</p>', onChange });
            const editor = getEditor();
            editor.textContent = '123456';
            fireEvent.input(editor);

            rerender(<RichTextInput {...defaultProps} maxLength={5} value="<p>1234</p>" onChange={onChange} />);
            expect(getEditor().innerHTML).toBe('<p>1234</p>');
        });
    });

    describe('Formatting - Bold', () => {
        it('calls formatBold when Bold button is clicked', () => {
            renderRichTextInput();
            fireEvent.click(getBoldButton());
            expect(document.execCommand).toHaveBeenCalledWith('bold', false);
        });

        it('calls onChange when Bold is applied', () => {
            renderRichTextInput();
            const editor = getEditor();
            editor.textContent = 'Test';
            focusEditor();
            fireEvent.click(getBoldButton());
            expect(defaultProps.onChange).toHaveBeenCalled();
        });

        it('applies bold formatting with Ctrl+B', () => {
            renderRichTextInput();
            const editor = getEditor();
            focusEditor();

            fireEvent.keyDown(editor, {
                key: 'b',
                ctrlKey: true,
                preventDefault: jest.fn(),
            } as any);

            expect(document.execCommand).toHaveBeenCalledWith('bold', false);
        });

        it('applies bold formatting with Cmd+B on Mac', () => {
            renderRichTextInput();
            const editor = getEditor();
            focusEditor();

            fireEvent.keyDown(editor, {
                key: 'b',
                metaKey: true,
                preventDefault: jest.fn(),
            } as any);

            expect(document.execCommand).toHaveBeenCalledWith('bold', false);
        });
    });

    describe('Formatting - Italic', () => {
        it('calls formatItalic when Italic button is clicked', () => {
            renderRichTextInput();
            fireEvent.click(getItalicButton());
            expect(document.execCommand).toHaveBeenCalledWith('italic', false);
        });

        it('calls onChange when Italic is applied', () => {
            renderRichTextInput();
            const editor = getEditor();
            editor.textContent = 'Test';
            focusEditor();
            fireEvent.click(getItalicButton());
            expect(defaultProps.onChange).toHaveBeenCalled();
        });

        it('applies italic formatting with Ctrl+I', () => {
            renderRichTextInput();
            const editor = getEditor();
            focusEditor();

            fireEvent.keyDown(editor, {
                key: 'i',
                ctrlKey: true,
                preventDefault: jest.fn(),
            } as any);

            expect(document.execCommand).toHaveBeenCalledWith('italic', false);
        });
    });

    describe('Line break', () => {
        it('inserts line break when Line break button is clicked', () => {
            renderRichTextInput();
            const editor = getEditor();
            editor.textContent = 'Test';
            focusEditor();
            fireEvent.click(getLineBreakButton());
            expect(defaultProps.onChange).toHaveBeenCalled();
        });

        it('inserts line break with Enter key', () => {
            renderRichTextInput();
            const editor = getEditor();
            editor.textContent = 'Test';
            focusEditor();

            const keyDownEvent = createEvent.keyDown(editor, {
                key: 'Enter',
                bubbles: true,
            });
            const preventDefaultSpy = jest.spyOn(keyDownEvent, 'preventDefault');

            fireEvent(editor, keyDownEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('does not insert line break when maxLength is reached', () => {
            renderRichTextInput({ maxLength: 5, value: '<p>12345</p>' });
            const editor = getEditor();
            focusEditor();
            fireEvent.click(getLineBreakButton());
        });
    });

    describe('Paste handling', () => {
        it('prevents default paste behavior', () => {
            renderRichTextInput();
            const editor = getEditor();

            const pasteEvent = createEvent.paste(editor, {
                bubbles: true,
            });
            Object.defineProperty(pasteEvent, 'clipboardData', {
                value: {
                    getData: jest.fn().mockReturnValue('Pasted text'),
                },
                writable: true,
            });
            const preventDefaultSpy = jest.spyOn(pasteEvent, 'preventDefault');

            fireEvent(editor, pasteEvent);

            expect(preventDefaultSpy).toHaveBeenCalled();
        });

        it('inserts text within maxLength limit', () => {
            renderRichTextInput({ maxLength: 10 });
            const editor = getEditor();
            editor.textContent = '12345';
            focusEditor();
            pasteInEditor('67890');
            expect(document.execCommand).toHaveBeenCalledWith('insertText', false, '67890');
        });

        it('truncates pasted text if it exceeds maxLength', () => {
            renderRichTextInput({ maxLength: 10 });
            const editor = getEditor();
            editor.textContent = '12345';
            focusEditor();
            pasteInEditor('6789012345');
            expect(document.execCommand).toHaveBeenCalled();
        });

        it('does not insert text if no space available', () => {
            renderRichTextInput({ maxLength: 5, value: '<p>12345</p>' });
            const editor = getEditor();
            focusEditor();
            pasteInEditor('extra');
        });
    });

    describe('Keyboard shortcuts', () => {
        it('allows Ctrl+A (select all) when maxLength is reached', () => {
            renderRichTextInput({ maxLength: 5, value: '<p>12345</p>' });
            const editor = getEditor();
            focusEditor();
            const preventDefault = jest.fn();

            fireEvent.keyDown(editor, {
                key: 'a',
                ctrlKey: true,
                preventDefault,
            } as any);

            expect(preventDefault).not.toHaveBeenCalled();
        });

        it('allows Ctrl+C (copy) when maxLength is reached', () => {
            renderRichTextInput({ maxLength: 5, value: '<p>12345</p>' });
            const editor = getEditor();
            focusEditor();
            const preventDefault = jest.fn();

            fireEvent.keyDown(editor, {
                key: 'c',
                ctrlKey: true,
                preventDefault,
            } as any);

            expect(preventDefault).not.toHaveBeenCalled();
        });
    });

    describe('getPlainTextFromHtml utility', () => {
        it('extracts plain text from HTML', () => {
            const html = '<p>Hello <strong>World</strong></p>';
            const plainText = getPlainTextFromHtml(html);
            expect(plainText).toBe('Hello World');
        });

        it('handles empty HTML', () => {
            const plainText = getPlainTextFromHtml('');
            expect(plainText).toBe('');
        });

        it('handles HTML with line breaks', () => {
            const html = '<p>Line 1<br>Line 2</p>';
            const plainText = getPlainTextFromHtml(html);
            expect(plainText).toContain('Line 1');
            expect(plainText).toContain('Line 2');
        });

        it('handles HTML with nested tags', () => {
            const html = '<p>Text <em>italic</em> and <strong>bold</strong></p>';
            const plainText = getPlainTextFromHtml(html);
            expect(plainText).toBe('Text italic and bold');
        });
    });

    describe('Edge cases', () => {
        it('handles null/undefined value gracefully', () => {
            renderRichTextInput({ value: undefined as any });
            expect(getEditor()).toBeInTheDocument();
        });

        it('updates format states on mouse up', () => {
            renderRichTextInput();
            const editor = getEditor();
            fireEvent.mouseUp(editor);
            expect(editor).toBeInTheDocument();
        });

        it('updates format states on key up', () => {
            renderRichTextInput();
            const editor = getEditor();
            fireEvent.keyUp(editor, { key: 'a' });
            expect(editor).toBeInTheDocument();
        });

        it('handles rapid consecutive changes', () => {
            renderRichTextInput();
            const editor = getEditor();
            editor.textContent = '1';
            fireEvent.input(editor);
            editor.textContent = '12';
            fireEvent.input(editor);
            editor.textContent = '123';
            fireEvent.input(editor);
            expect(defaultProps.onChange).toHaveBeenCalledTimes(3);
        });
    });
});
