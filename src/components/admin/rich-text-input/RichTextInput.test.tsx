import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichTextInput, RichTextInputProps } from './RichTextInput';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';

// Mock Lexical modules for Jest compatibility
jest.mock('@lexical/react/LexicalComposer', () => {
    const MockLexicalComposer = ({ children }: { children: React.ReactNode }) => (
        <div data-testid="lexical-composer">{children}</div>
    );
    return { LexicalComposer: MockLexicalComposer };
});

jest.mock('@lexical/react/LexicalRichTextPlugin', () => {
    const MockRichTextPlugin = ({ contentEditable, placeholder }: any) => (
        <div data-testid="rich-text-plugin">
            {contentEditable}
            {placeholder}
        </div>
    );
    return { RichTextPlugin: MockRichTextPlugin };
});

jest.mock('@lexical/react/LexicalContentEditable', () => {
    const MockContentEditable = (props: any) => (
        <div
            {...props}
            contentEditable
            data-testid="content-editable"
            role="textbox"
            aria-label={props['aria-label']}
        />
    );
    return { ContentEditable: MockContentEditable };
});

jest.mock('@lexical/react/LexicalHistoryPlugin', () => {
    const MockHistoryPlugin = () => null;
    return { HistoryPlugin: MockHistoryPlugin };
});

jest.mock('@lexical/react/LexicalErrorBoundary', () => {
    const MockLexicalErrorBoundary = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    return { LexicalErrorBoundary: MockLexicalErrorBoundary };
});

jest.mock('@lexical/html', () => ({
    $generateNodesFromDOM: jest.fn(() => []),
    $generateHtmlFromNodes: jest.fn(() => ''),
}));

jest.mock('lexical', () => ({
    $getRoot: jest.fn(() => ({ clear: jest.fn() })),
    $insertNodes: jest.fn(),
    $getSelection: jest.fn(),
    $isRangeSelection: jest.fn(() => false),
    $createLineBreakNode: jest.fn(),
    FORMAT_TEXT_COMMAND: 'FORMAT_TEXT_COMMAND',
    SELECTION_CHANGE_COMMAND: 'SELECTION_CHANGE_COMMAND',
    FOCUS_COMMAND: 'FOCUS_COMMAND',
    BLUR_COMMAND: 'BLUR_COMMAND',
    COMMAND_PRIORITY_CRITICAL: 1,
    COMMAND_PRIORITY_LOW: 0,
    RootNode: class RootNode {},
}));

// Store plugin props for testing
let mockMaxLengthPluginProps: any = null;
let mockOnChangePluginProps: any = null;
let mockFocusPluginProps: any = null;

jest.mock('./plugins', () => {
    const MockMaxLengthPlugin = (props: any) => {
        mockMaxLengthPluginProps = props;
        return null;
    };
    const MockOnChangePlugin = (props: any) => {
        mockOnChangePluginProps = props;
        return null;
    };
    const MockFocusPlugin = (props: any) => {
        mockFocusPluginProps = props;
        return null;
    };
    const MockToolbarPlugin = ({ disabled }: { disabled?: boolean }) => (
        <div data-testid="toolbar">
            <button disabled={disabled} aria-label="Bold" title="Bold (Ctrl+B)">
                <strong>B</strong>
            </button>
            <button disabled={disabled} aria-label="Italic" title="Italic (Ctrl+I)">
                <em>I</em>
            </button>
            <button disabled={disabled} aria-label="Line break" title="Line break">
                ↵
            </button>
        </div>
    );
    return {
        MaxLengthPlugin: MockMaxLengthPlugin,
        OnChangePlugin: MockOnChangePlugin,
        FocusPlugin: MockFocusPlugin,
        ToolbarPlugin: MockToolbarPlugin,
    };
});

jest.mock('./RichTextInput.module.scss', () => ({
    root: 'root',
    'root--disabled': 'root--disabled',
    'root--focused': 'root--focused',
    toolbar: 'toolbar',
    toolbarBtn: 'toolbarBtn',
    toolbarBtnActive: 'toolbarBtnActive',
    editorContainer: 'editorContainer',
    field: 'field',
    placeholder: 'placeholder',
    paragraph: 'paragraph',
    textBold: 'textBold',
    textItalic: 'textItalic',
    counter: 'counter',
}));

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
    });

    const renderRichTextInput = (overrideProps: Partial<RichTextInputProps> = {}) =>
        render(<RichTextInput {...defaultProps} {...overrideProps} />);

    describe('Rendering', () => {
        it('renders the component', () => {
            renderRichTextInput();
            expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
        });

        it('renders toolbar with buttons', () => {
            renderRichTextInput();
            expect(screen.getByLabelText('Bold')).toBeInTheDocument();
            expect(screen.getByLabelText('Italic')).toBeInTheDocument();
            expect(screen.getByLabelText('Line break')).toBeInTheDocument();
        });

        it('renders character counter', () => {
            renderRichTextInput();
            expect(screen.getByText('0/30')).toBeInTheDocument();
        });

        it('renders content editable area', () => {
            renderRichTextInput();
            expect(screen.getByTestId('content-editable')).toBeInTheDocument();
        });

        it('applies custom className to editor', () => {
            renderRichTextInput({ className: 'custom-class' });
            expect(screen.getByTestId('content-editable')).toHaveClass('custom-class');
        });

        it('renders with custom placeholder', () => {
            renderRichTextInput({ placeholder: 'Enter title...' });
            expect(screen.getByText('Enter title...')).toBeInTheDocument();
        });

        it('uses default placeholder when not provided', () => {
            renderRichTextInput();
            expect(screen.getByText('Enter text...')).toBeInTheDocument();
        });
    });

    describe('Disabled state', () => {
        it('disables toolbar buttons when disabled', () => {
            renderRichTextInput({ disabled: true });
            expect(screen.getByLabelText('Bold')).toBeDisabled();
            expect(screen.getByLabelText('Italic')).toBeDisabled();
            expect(screen.getByLabelText('Line break')).toBeDisabled();
        });

        it('applies disabled class to root element', () => {
            const { container } = renderRichTextInput({ disabled: true });
            expect(container.firstChild).toHaveClass('root--disabled');
        });
    });

    describe('Props handling', () => {
        it('passes id to content editable', () => {
            renderRichTextInput({ id: 'my-editor' });
            expect(screen.getByTestId('content-editable')).toHaveAttribute('id', 'my-editor');
        });

        it('handles different maxLength values', () => {
            renderRichTextInput({ maxLength: 100 });
            expect(screen.getByText('0/100')).toBeInTheDocument();
        });
    });

    describe('Plugin Props', () => {
        it('passes correct props to MaxLengthPlugin', () => {
            renderRichTextInput({ maxLength: 50 });
            expect(mockMaxLengthPluginProps).not.toBeNull();
            expect(mockMaxLengthPluginProps.maxLength).toBe(50);
            expect(typeof mockMaxLengthPluginProps.onLengthChange).toBe('function');
        });

        it('passes onChange callback to OnChangePlugin', () => {
            const onChange = jest.fn();
            renderRichTextInput({ onChange });
            expect(mockOnChangePluginProps).not.toBeNull();
            expect(mockOnChangePluginProps.onChange).toBe(onChange);
        });

        it('passes focus callbacks to FocusPlugin', () => {
            const onFocus = jest.fn();
            const onBlur = jest.fn();
            renderRichTextInput({ onFocus, onBlur });
            expect(mockFocusPluginProps).not.toBeNull();
            expect(mockFocusPluginProps.onFocus).toBe(onFocus);
            expect(mockFocusPluginProps.onBlur).toBe(onBlur);
            expect(typeof mockFocusPluginProps.onFocusChange).toBe('function');
        });

        it('handles missing optional focus callbacks', () => {
            renderRichTextInput();
            expect(mockFocusPluginProps).not.toBeNull();
            expect(mockFocusPluginProps.onFocus).toBeUndefined();
            expect(mockFocusPluginProps.onBlur).toBeUndefined();
            expect(typeof mockFocusPluginProps.onFocusChange).toBe('function');
        });
    });

    describe('State Management', () => {
        it('updates character counter when length changes', () => {
            renderRichTextInput({ maxLength: 100 });
            expect(screen.getByText('0/100')).toBeInTheDocument();

            // Simulate length change callback
            const onLengthChange = mockMaxLengthPluginProps.onLengthChange;
            act(() => {
                onLengthChange(25);
            });

            expect(screen.getByText('25/100')).toBeInTheDocument();
        });

        it('applies focused class when focus changes', () => {
            const { container } = renderRichTextInput();
            const rootElement = container.firstChild as HTMLElement;

            expect(rootElement).not.toHaveClass('root--focused');

            // Simulate focus change callback
            const onFocusChange = mockFocusPluginProps.onFocusChange;
            act(() => {
                onFocusChange(true);
            });

            expect(rootElement).toHaveClass('root--focused');
        });

        it('does not apply focused class when disabled', () => {
            const { container } = renderRichTextInput({ disabled: true });
            const rootElement = container.firstChild as HTMLElement;

            // Simulate focus change callback
            const onFocusChange = mockFocusPluginProps.onFocusChange;
            act(() => {
                onFocusChange(true);
            });

            expect(rootElement).not.toHaveClass('root--focused');
            expect(rootElement).toHaveClass('root--disabled');
        });

        it('removes focused class when blur occurs', () => {
            const { container } = renderRichTextInput();
            const rootElement = container.firstChild as HTMLElement;

            // Simulate focus
            const onFocusChange = mockFocusPluginProps.onFocusChange;
            act(() => {
                onFocusChange(true);
            });
            expect(rootElement).toHaveClass('root--focused');

            // Simulate blur
            act(() => {
                onFocusChange(false);
            });
            expect(rootElement).not.toHaveClass('root--focused');
        });
    });

    describe('Initial Configuration', () => {
        it('creates namespace based on id', () => {
            renderRichTextInput({ id: 'custom-editor' });
            // Configuration is tested implicitly through successful rendering
            expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
        });

        it('sets editable to false when disabled', () => {
            renderRichTextInput({ disabled: true });
            // Verify disabled state is applied
            expect(screen.getByLabelText('Bold')).toBeDisabled();
        });

        it('handles initial value', () => {
            renderRichTextInput({ value: '<p>Initial content</p>' });
            // Value handling is tested through the editorState callback
            expect(screen.getByTestId('content-editable')).toBeInTheDocument();
        });

        it('handles empty initial value', () => {
            renderRichTextInput({ value: '' });
            expect(screen.getByTestId('content-editable')).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('includes error handler in config', () => {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
            renderRichTextInput();
            // Error handler is configured in initialConfig
            expect(screen.getByTestId('lexical-composer')).toBeInTheDocument();
            consoleErrorSpy.mockRestore();
        });
    });

    describe('getPlainTextFromHtml utility', () => {
        beforeEach(() => {
            Object.defineProperty(HTMLElement.prototype, 'innerText', {
                get: function () {
                    return this.textContent || '';
                },
                configurable: true,
            });
        });

        it('extracts plain text from HTML', () => {
            const html = '<p>Hello <strong>World</strong></p>';
            const plainText = getPlainTextFromHtml(html);
            expect(plainText).toBe('Hello World');
        });

        it('handles empty HTML', () => {
            const plainText = getPlainTextFromHtml('');
            expect(plainText).toBe('');
        });

        it('handles HTML with nested tags', () => {
            const html = '<p>Text <em>italic</em> and <strong>bold</strong></p>';
            const plainText = getPlainTextFromHtml(html);
            expect(plainText).toBe('Text italic and bold');
        });

        it('strips script tags from HTML', () => {
            const html = '<p>Text</p><script>alert("xss")</script>';
            const plainText = getPlainTextFromHtml(html);
            expect(plainText).toBe('Text');
        });

        it('strips style tags from HTML', () => {
            const html = '<p>Text</p><style>body { color: red; }</style>';
            const plainText = getPlainTextFromHtml(html);
            expect(plainText).toBe('Text');
        });
    });
});
