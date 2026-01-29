import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ToolbarPlugin } from './ToolbarPlugin';

const mockRegisterCommand = jest.fn();
const mockRegisterUpdateListener = jest.fn();
const mockDispatchCommand = jest.fn();
const mockUpdate = jest.fn();

const mockEditor = {
    registerCommand: mockRegisterCommand,
    registerUpdateListener: mockRegisterUpdateListener,
    dispatchCommand: mockDispatchCommand,
    update: mockUpdate,
};

jest.mock('@lexical/react/LexicalComposerContext', () => ({
    useLexicalComposerContext: () => [mockEditor],
}));

jest.mock('lexical', () => ({
    $getSelection: jest.fn(),
    $isRangeSelection: jest.fn(() => false),
    $createLineBreakNode: jest.fn(() => ({ type: 'linebreak' })),
    FORMAT_TEXT_COMMAND: 'FORMAT_TEXT_COMMAND',
    SELECTION_CHANGE_COMMAND: 'SELECTION_CHANGE_COMMAND',
    COMMAND_PRIORITY_CRITICAL: 1,
}));

jest.mock('../RichTextInput.module.scss', () => ({
    toolbar: 'toolbar',
    'toolbar-btn': 'toolbar-btn',
    'toolbar-btn-active': 'toolbar-btn-active',
}));

describe('ToolbarPlugin', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRegisterCommand.mockReturnValue(jest.fn());
        mockRegisterUpdateListener.mockReturnValue(jest.fn());
    });

    const triggerSelectionChange = () => {
        const calls = mockRegisterCommand.mock.calls;
        const selectionCall = calls.find((call) => call[0] === 'SELECTION_CHANGE_COMMAND');
        const selectionHandler = selectionCall[1];

        act(() => {
            selectionHandler();
        });
    };

    it('renders toolbar with three buttons', () => {
        render(<ToolbarPlugin />);

        expect(screen.getByLabelText('Bold')).toBeInTheDocument();
        expect(screen.getByLabelText('Italic')).toBeInTheDocument();
        expect(screen.getByLabelText('Line break')).toBeInTheDocument();
    });

    it('Bold button is disabled when disabled prop is true', () => {
        render(<ToolbarPlugin disabled={true} />);
        expect(screen.getByLabelText('Bold')).toBeDisabled();
    });

    it('Italic button is disabled when disabled prop is true', () => {
        render(<ToolbarPlugin disabled={true} />);
        expect(screen.getByLabelText('Italic')).toBeDisabled();
    });

    it('Line break button is disabled when disabled prop is true', () => {
        render(<ToolbarPlugin disabled={true} />);
        expect(screen.getByLabelText('Line break')).toBeDisabled();
    });

    it('buttons are enabled when disabled prop is false', () => {
        render(<ToolbarPlugin disabled={false} />);

        expect(screen.getByLabelText('Bold')).not.toBeDisabled();
        expect(screen.getByLabelText('Italic')).not.toBeDisabled();
        expect(screen.getByLabelText('Line break')).not.toBeDisabled();
    });

    it('registers SELECTION_CHANGE_COMMAND listener', () => {
        render(<ToolbarPlugin />);

        const calls = mockRegisterCommand.mock.calls;
        const selectionCall = calls.find((call) => call[0] === 'SELECTION_CHANGE_COMMAND');

        expect(selectionCall).toBeDefined();
        expect(selectionCall[1]).toEqual(expect.any(Function));
        expect(selectionCall[2]).toBe(1);
    });

    it('registers update listener', () => {
        render(<ToolbarPlugin />);

        expect(mockRegisterUpdateListener).toHaveBeenCalledWith(expect.any(Function));
    });

    it('updates isBold state when selection has bold format', () => {
        const { $getSelection, $isRangeSelection } = require('lexical');

        const mockSelection = {
            hasFormat: jest.fn((format) => format === 'bold'),
        };
        $getSelection.mockReturnValue(mockSelection);
        $isRangeSelection.mockReturnValue(true);

        render(<ToolbarPlugin />);

        triggerSelectionChange();

        const boldButton = screen.getByLabelText('Bold');
        expect(boldButton).toHaveClass('toolbar-btn-active');
    });

    it('updates isItalic state when selection has italic format', () => {
        const { $getSelection, $isRangeSelection } = require('lexical');

        const mockSelection = {
            hasFormat: jest.fn((format) => format === 'italic'),
        };
        $getSelection.mockReturnValue(mockSelection);
        $isRangeSelection.mockReturnValue(true);

        render(<ToolbarPlugin />);

        triggerSelectionChange();

        const italicButton = screen.getByLabelText('Italic');
        expect(italicButton).toHaveClass('toolbar-btn-active');
    });

    it('does not apply active class when text is not bold', () => {
        const { $getSelection, $isRangeSelection } = require('lexical');

        const mockSelection = {
            hasFormat: jest.fn(() => false),
        };
        $getSelection.mockReturnValue(mockSelection);
        $isRangeSelection.mockReturnValue(true);

        render(<ToolbarPlugin />);

        triggerSelectionChange();

        const boldButton = screen.getByLabelText('Bold');
        expect(boldButton).not.toHaveClass('toolbar-btn-active');
    });

    it('clicking Bold button dispatches FORMAT_TEXT_COMMAND with bold', () => {
        render(<ToolbarPlugin />);

        const boldButton = screen.getByLabelText('Bold');
        fireEvent.click(boldButton);

        expect(mockDispatchCommand).toHaveBeenCalledWith('FORMAT_TEXT_COMMAND', 'bold');
    });

    it('clicking Italic button dispatches FORMAT_TEXT_COMMAND with italic', () => {
        render(<ToolbarPlugin />);

        const italicButton = screen.getByLabelText('Italic');
        fireEvent.click(italicButton);

        expect(mockDispatchCommand).toHaveBeenCalledWith('FORMAT_TEXT_COMMAND', 'italic');
    });

    it('clicking Line break button inserts line break node', () => {
        const { $getSelection, $isRangeSelection, $createLineBreakNode } = require('lexical');

        const mockLineBreakNode = { type: 'linebreak' };
        $createLineBreakNode.mockReturnValue(mockLineBreakNode);

        const mockSelection = {
            insertNodes: jest.fn(),
        };
        $getSelection.mockReturnValue(mockSelection);
        $isRangeSelection.mockReturnValue(true);

        render(<ToolbarPlugin />);

        const lineBreakButton = screen.getByLabelText('Line break');
        fireEvent.click(lineBreakButton);

        expect(mockUpdate).toHaveBeenCalled();

        const updateCallback = mockUpdate.mock.calls[0][0];

        updateCallback();

        expect($createLineBreakNode).toHaveBeenCalled();
        expect(mockSelection.insertNodes).toHaveBeenCalledWith([mockLineBreakNode]);
    });

    it('line break button does nothing when selection is not range', () => {
        const { $getSelection, $isRangeSelection } = require('lexical');

        $getSelection.mockReturnValue({});
        $isRangeSelection.mockReturnValue(false);

        render(<ToolbarPlugin />);

        const lineBreakButton = screen.getByLabelText('Line break');
        fireEvent.click(lineBreakButton);

        expect(mockUpdate).toHaveBeenCalled();

        const updateCallback = mockUpdate.mock.calls[0][0];
        updateCallback();

        expect($getSelection).toHaveBeenCalled();
    });

    it('unregisters listeners on unmount', () => {
        const unregisterCommand = jest.fn();
        const unregisterUpdate = jest.fn();

        mockRegisterCommand.mockReturnValue(unregisterCommand);
        mockRegisterUpdateListener.mockReturnValue(unregisterUpdate);

        const { unmount } = render(<ToolbarPlugin />);

        expect(unregisterCommand).not.toHaveBeenCalled();
        expect(unregisterUpdate).not.toHaveBeenCalled();

        unmount();

        expect(unregisterCommand).toHaveBeenCalled();
        expect(unregisterUpdate).toHaveBeenCalled();
    });

    it('has correct button titles and aria-labels', () => {
        render(<ToolbarPlugin />);

        const boldButton = screen.getByLabelText('Bold');
        const italicButton = screen.getByLabelText('Italic');
        const lineBreakButton = screen.getByLabelText('Line break');

        expect(boldButton).toHaveAttribute('title', 'Bold (Ctrl+B)');
        expect(italicButton).toHaveAttribute('title', 'Italic (Ctrl+I)');
        expect(lineBreakButton).toHaveAttribute('title', 'Line break');
    });

    it('buttons have type="button" to prevent form submission', () => {
        render(<ToolbarPlugin />);

        const boldButton = screen.getByLabelText('Bold');
        const italicButton = screen.getByLabelText('Italic');
        const lineBreakButton = screen.getByLabelText('Line break');

        expect(boldButton).toHaveAttribute('type', 'button');
        expect(italicButton).toHaveAttribute('type', 'button');
        expect(lineBreakButton).toHaveAttribute('type', 'button');
    });
});
