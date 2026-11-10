import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import { OnChangePlugin } from './OnChangePlugin';

const mockRegisterUpdateListener = jest.fn();
const mockEditor = {
    registerUpdateListener: mockRegisterUpdateListener,
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

const mockGenerateHtmlFromNodes = jest.fn();
jest.mock('@lexical/html', () => ({
    $generateHtmlFromNodes: (...args: any[]) => mockGenerateHtmlFromNodes(...args),
}));

interface UpdateOptions {
    dirty?: boolean;
    tags?: string[];
}

const renderPlugin = () => {
    const onChange = jest.fn();
    const utils = render(<OnChangePlugin onChange={onChange} />);
    return { onChange, ...utils };
};

const getListener = () => mockRegisterUpdateListener.mock.calls[0][0];

const emitUpdate = ({ dirty = false, tags = [] }: UpdateOptions = {}) => {
    getListener()({
        editorState: { read: jest.fn((callback) => callback()) },
        dirtyElements: dirty ? new Map([['key', true]]) : new Map(),
        dirtyLeaves: new Set(),
        tags: new Set(tags),
    });
};

const emitInitialUpdate = () => emitUpdate();

const emitUserChange = (html: string, tags: string[] = []) => {
    emitInitialUpdate();
    mockGenerateHtmlFromNodes.mockReturnValue(html);
    emitUpdate({ dirty: true, tags });
};

const expectSanitized = (input: string, expected: string) => {
    const { onChange } = renderPlugin();

    emitUserChange(input);

    expect(onChange).toHaveBeenCalledWith(expected);
};

describe('OnChangePlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterUpdateListener.mockReturnValue(jest.fn());
        mockGenerateHtmlFromNodes.mockReturnValue('<p>Generated HTML</p>');
    });

    it('renders without crashing', () => {
        const { container } = renderPlugin();

        expect(container).toBeEmptyDOMElement();
    });

    it('registers update listener on mount', () => {
        renderPlugin();

        expect(mockRegisterUpdateListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('unregisters listener on unmount', () => {
        const unregister = jest.fn();
        mockRegisterUpdateListener.mockReturnValue(unregister);
        const { unmount } = renderPlugin();
        expect(unregister).not.toHaveBeenCalled();

        unmount();

        expect(unregister).toHaveBeenCalled();
    });

    describe('when onChange must not be called', () => {
        it('does not call onChange on initial render', () => {
            const { onChange } = renderPlugin();

            emitInitialUpdate();

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not call onChange when there are no dirty elements or leaves', () => {
            const { onChange } = renderPlugin();

            emitInitialUpdate();
            emitUpdate();

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not call onChange when update has external-value tag', () => {
            const { onChange } = renderPlugin();

            emitInitialUpdate();
            emitUpdate({ dirty: true, tags: ['external-value'] });

            expect(onChange).not.toHaveBeenCalled();
        });

        it('does not call onChange for external-value tag even together with other tags', () => {
            const { onChange } = renderPlugin();

            emitInitialUpdate();
            emitUpdate({ dirty: true, tags: ['history-merge', 'external-value'] });

            expect(onChange).not.toHaveBeenCalled();
        });
    });

    describe('when the user edits the content', () => {
        it('calls onChange with HTML generated from nodes', () => {
            const { onChange } = renderPlugin();

            emitUserChange('<p>Generated HTML</p>');

            expect(onChange).toHaveBeenCalledWith('<p>Generated HTML</p>');
        });

        it('calls onChange with sanitized HTML generated from nodes', () => {
            expectSanitized('<p>Custom <strong>HTML</strong></p>', '<p>Custom <strong>HTML</strong></p>');
        });

        it('calls onChange for updates with unrelated tags', () => {
            const { onChange } = renderPlugin();

            emitUserChange('<p>Text</p>', ['history-merge']);

            expect(onChange).toHaveBeenCalledWith('<p>Text</p>');
        });
    });

    describe('HTML Sanitization', () => {
        it.each([
            [
                'removes CSS module class attributes from HTML',
                '<p class="RichTextInput_paragraph__abc123">Text with <strong class="RichTextInput_text-bold__xyz">bold</strong></p>',
                '<p>Text with <strong>bold</strong></p>',
            ],
            [
                'removes inline style attributes from HTML',
                '<p style="white-space: pre-wrap;">Text with <span style="white-space: pre-wrap;">span</span></p>',
                '<p>Text with span</p>',
            ],
            [
                'removes redundant b tags wrapping strong tags',
                '<p>Text <b><strong>bold</strong></b> here</p>',
                '<p>Text <strong>bold</strong> here</p>',
            ],
            [
                'removes redundant i tags wrapping em tags',
                '<p>Text <i><em>italic</em></i> here</p>',
                '<p>Text <em>italic</em> here</p>',
            ],
            ['handles empty string input', '', ''],
            [
                'sanitizes complex Lexical output with multiple issues',
                '<p class="RichTextInput_paragraph__wO3kv" style="text-align: center;">' +
                    '<span style="white-space: pre-wrap;">Ми не </span>' +
                    '<b><strong class="RichTextInput_text-bold__TIQja" style="white-space: pre-wrap;">одні</strong></b>' +
                    '<span style="white-space: pre-wrap;">. І це наша </span>' +
                    '<b><strong class="RichTextInput_text-bold__TIQja" style="white-space: pre-wrap;">сила</strong></b>' +
                    '</p>',
                '<p>Ми не <strong>одні</strong>. І це наша <strong>сила</strong></p>',
            ],
            [
                'preserves multiple consecutive spaces using non-breaking spaces',
                '<p><span style="white-space: pre-wrap;">text  with   multiple    spaces</span></p>',
                '<p>text &nbsp;with &nbsp;&nbsp;multiple &nbsp;&nbsp;&nbsp;spaces</p>',
            ],
            ['preserves double spaces to prevent cursor jumping', '<p>First  Second</p>', '<p>First &nbsp;Second</p>'],
        ])('%s', (_name, input, expected) => {
            expectSanitized(input, expected);
        });
    });
});
