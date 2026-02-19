import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { RichTextInput, RichTextInputProps } from './RichTextInput';
import { getPlainTextFromHtml } from '@/utils/functions/get-plain-text-from-html/get-plain-text-from-html';
import { $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes } from 'lexical';

jest.mock('@lexical/react/LexicalComposer', () => {
    const MockLexicalComposer = ({ children, initialConfig }: any) => {
        if (initialConfig?.editorState) {
            initialConfig.editorState({});
        }
        return <div data-testid="lexical-composer">{children}</div>;
    };
    return { __esModule: true, LexicalComposer: MockLexicalComposer };
});

jest.mock('@lexical/react/LexicalRichTextPlugin', () => {
    const MockRichTextPlugin = ({ contentEditable, placeholder }: any) => (
        <div data-testid="rich-text-plugin">
            {contentEditable}
            {placeholder}
        </div>
    );
    return { __esModule: true, RichTextPlugin: MockRichTextPlugin };
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
    return { __esModule: true, ContentEditable: MockContentEditable };
});

jest.mock('@lexical/react/LexicalHistoryPlugin', () => {
    const MockHistoryPlugin = () => null;
    return { __esModule: true, HistoryPlugin: MockHistoryPlugin };
});

jest.mock('@lexical/react/LexicalErrorBoundary', () => {
    const MockLexicalErrorBoundary = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    return { __esModule: true, LexicalErrorBoundary: MockLexicalErrorBoundary };
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

let mockMaxLengthPluginProps: any = null;
let mockOnChangePluginProps: any = null;
let mockFocusPluginProps: any = null;
let mockInitialValuePluginProps: any = null;

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
    const MockInitialValuePlugin = (props: any) => {
        mockInitialValuePluginProps = props;
        return props.value ? (
            <div data-testid="initial-value-content" dangerouslySetInnerHTML={{ __html: props.value }} />
        ) : null;
    };
    const MockEnterKeyPlugin = () => null;
    return {
        MaxLengthPlugin: MockMaxLengthPlugin,
        OnChangePlugin: MockOnChangePlugin,
        FocusPlugin: MockFocusPlugin,
        ToolbarPlugin: MockToolbarPlugin,
        InitialValuePlugin: MockInitialValuePlugin,
        EnterKeyPlugin: MockEnterKeyPlugin,
    };
});

jest.mock('./RichTextInput.module.scss', () => ({
    root: 'root',
    'root--disabled': 'root--disabled',
    'root--focused': 'root--focused',
    toolbar: 'toolbar',
    'toolbar-btn': 'toolbar-btn',
    'toolbar-btn-active': 'toolbar-btn-active',
    'editor-container': 'editor-container',
    field: 'field',
    placeholder: 'placeholder',
    paragraph: 'paragraph',
    'text-bold': 'text-bold',
    'text-italic': 'text-italic',
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
        (mockMaxLengthPluginProps as any) = null;
        (mockOnChangePluginProps as any) = null;
        (mockFocusPluginProps as any) = null;
        (mockInitialValuePluginProps as any) = null;

        ($generateNodesFromDOM as jest.Mock).mockImplementation(() => []);
        ($getRoot as jest.Mock).mockImplementation(() => ({ clear: jest.fn() }));
        ($insertNodes as jest.Mock).mockImplementation(() => {});
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

        it('passes value to InitialValuePlugin and renders content', () => {
            renderRichTextInput({ value: '<p>Test content</p>' });
            expect(mockInitialValuePluginProps).not.toBeNull();
            expect(mockInitialValuePluginProps.value).toBe('<p>Test content</p>');
            expect(screen.getByTestId('initial-value-content')).toBeInTheDocument();
            expect(screen.getByText('Test content')).toBeInTheDocument();
        });

        it('renders rich text with formatting from InitialValuePlugin', () => {
            renderRichTextInput({ value: '<p><strong>Bold</strong> and <em>italic</em> text</p>' });
            const contentElement = screen.getByTestId('initial-value-content');
            expect(contentElement).toBeInTheDocument();
            expect(screen.getByText('Bold')).toBeInTheDocument();
            expect(screen.getByText('italic')).toBeInTheDocument();
            expect(contentElement.textContent).toBe('Bold and italic text');
        });

        it('passes empty value to InitialValuePlugin when no value provided', () => {
            renderRichTextInput({ value: '' });
            expect(mockInitialValuePluginProps).not.toBeNull();
            expect(mockInitialValuePluginProps.value).toBe('');
        });
    });

    describe('State Management', () => {
        it('updates character counter when length changes', () => {
            renderRichTextInput({ maxLength: 100 });
            expect(screen.getByText('0/100')).toBeInTheDocument();

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

            const onFocusChange = mockFocusPluginProps.onFocusChange;
            act(() => {
                onFocusChange(true);
            });

            expect(rootElement).toHaveClass('root--focused');
        });

        it('does not apply focused class when disabled', () => {
            const { container } = renderRichTextInput({ disabled: true });
            const rootElement = container.firstChild as HTMLElement;

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

            const onFocusChange = mockFocusPluginProps.onFocusChange;
            act(() => {
                onFocusChange(true);
            });
            expect(rootElement).toHaveClass('root--focused');

            act(() => {
                onFocusChange(false);
            });
            expect(rootElement).not.toHaveClass('root--focused');
        });
    });

    describe('Initial Configuration', () => {
        it('runs editorState and inserts nodes when value is provided', () => {
            const clear = jest.fn();
            ($getRoot as jest.Mock).mockImplementation(() => ({ clear }));
            ($generateNodesFromDOM as jest.Mock).mockImplementation(() => ['n1', 'n2']);

            renderRichTextInput({ value: '<p>Hello</p>' });

            expect($generateNodesFromDOM).toHaveBeenCalledTimes(1);
            expect($getRoot).toHaveBeenCalledTimes(1);
            expect(clear).toHaveBeenCalledTimes(1);
            expect($insertNodes).toHaveBeenCalledWith(['n1', 'n2']);
        });

        it('does not generate nodes when value is empty', () => {
            ($generateNodesFromDOM as jest.Mock).mockClear();
            ($insertNodes as jest.Mock).mockClear();

            renderRichTextInput({ value: '' });

            expect($generateNodesFromDOM).not.toHaveBeenCalled();
            expect($insertNodes).not.toHaveBeenCalled();
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
