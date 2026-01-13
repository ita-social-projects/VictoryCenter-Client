import React from 'react';
import { render, screen } from '@testing-library/react';
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

jest.mock('./plugins', () => {
    const MockMaxLengthPlugin = () => null;
    const MockOnChangePlugin = () => null;
    const MockFocusPlugin = () => null;
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
    });
});
