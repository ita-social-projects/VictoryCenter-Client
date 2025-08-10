import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Modal } from './Modal';

const mockOnClose = jest.fn();

const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    width: '80%',
    maxWidth: '600px',
};

describe('Modal Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    test('does not render when isOpen is false', () => {
        render(
            <Modal {...defaultProps} isOpen={false}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
                <Modal.Actions>Actions</Modal.Actions>
            </Modal>,
        );
        expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        expect(document.querySelector('.modal-container')).toBeNull();
    });

    test('renders modal with all sub-components when isOpen is true', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Modal Title</Modal.Title>
                <Modal.Content>Modal Content</Modal.Content>
                <Modal.Actions>Modal Actions</Modal.Actions>
            </Modal>,
        );
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(screen.getByText('Modal Title')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
        expect(screen.getByText('Modal Actions')).toBeInTheDocument();
        expect(document.querySelector('.modal-container')).toBeInTheDocument();
    });

    test('applies correct styles based on width and maxWidth props', () => {
        render(
            <Modal {...defaultProps} width="500px" maxWidth="800px">
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');
        expect(modalContainer).toHaveStyle({
            width: '500px',
            maxWidth: '800px',
        });
    });

    test('applies numeric width prop correctly', () => {
        render(
            <Modal {...defaultProps} width={400}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');
        expect(modalContainer).toHaveStyle({
            width: '400px',
            maxWidth: '600px',
        });
    });

    test('calls onClose when clicking overlay', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        await userEvent.click(screen.getByTestId('modal-overlay'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when clicking close button', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const closeButton = document.querySelector('.close-icon button');
        expect(closeButton).toBeInTheDocument();
        await userEvent.click(closeButton!);
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when pressing Escape key', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        fireEvent.keyDown(document, { key: 'Escape' });
        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    test('calls onClose when pressing Escape key anywhere', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );

        fireEvent.keyDown(document, { key: 'Escape' });

        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    test('does not call onClose when pressing Enter or Space on overlay', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );

        const overlay = screen.getByTestId('modal-overlay');

        fireEvent.keyDown(overlay, { key: 'Enter' });
        fireEvent.keyDown(overlay, { key: ' ' });

        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('does not call onClose when clicking inside modal container', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');
        await userEvent.click(modalContainer!);
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('does not call onClose when pressing Enter or Space inside modal container', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');
        fireEvent.keyDown(modalContainer!, { key: 'Enter' });
        fireEvent.keyDown(modalContainer!, { key: ' ' });
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('renders without title, content, or actions when not provided', () => {
        render(<Modal {...defaultProps} />);
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(document.querySelector('.modal-header-text')?.textContent).toBe('');
        expect(document.querySelector('.modal-body')?.textContent).toBe('');
        expect(document.querySelector('.modal-footer')?.textContent).toBe('');
    });

    test('adds and removes keydown event listener and body overflow based on isOpen', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        const { rerender } = render(<Modal {...defaultProps} />);
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(document.body.style.overflow).toBe('hidden');
        rerender(<Modal {...defaultProps} isOpen={false} />);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(document.body.style.overflow).not.toBe('hidden');
    });

    test('does not call onClose for other keys on overlay', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
            </Modal>,
        );
        const overlay = screen.getByTestId('modal-overlay');
        fireEvent.keyDown(overlay, { key: 'Tab' });
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('does not call onClose for other keys in modal container', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
            </Modal>,
        );
        const modalContainer = document.querySelector('.modal-container');
        fireEvent.keyDown(modalContainer!, { key: 'Tab' });
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('restores previous body overflow style after close', () => {
        document.body.style.overflow = 'scroll';
        const { rerender } = render(<Modal {...defaultProps} isOpen={true} />);
        expect(document.body.style.overflow).toBe('hidden');
        rerender(<Modal {...defaultProps} isOpen={false} />);
        expect(document.body.style.overflow).toBe('scroll');
    });

    test('multiple modals do not interfere with each other', () => {
        const onClose1 = jest.fn();
        const onClose2 = jest.fn();
        const { rerender } = render(
            <>
                <Modal isOpen={true} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>,
        );
        // Both overlays present
        expect(document.querySelectorAll('.modal-overlay').length).toBe(2);
        // Close one
        rerender(
            <>
                <Modal isOpen={false} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>,
        );
        expect(document.querySelectorAll('.modal-overlay').length).toBe(1);
        // Close both
        rerender(
            <>
                <Modal isOpen={false} onClose={onClose1} />
                <Modal isOpen={false} onClose={onClose2} />
            </>,
        );
        expect(document.querySelectorAll('.modal-overlay').length).toBe(0);
    });

    test('handles Modal.Title/Content/Actions as fragments and arrays', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>
                    <>
                        <span>Fragment Title</span>
                    </>
                </Modal.Title>
                <Modal.Content>{[<span key="c">Array Content</span>]}</Modal.Content>
                <Modal.Actions>
                    <>
                        <span>Fragment Actions</span>
                    </>
                </Modal.Actions>
            </Modal>,
        );
        expect(screen.getByText('Fragment Title')).toBeInTheDocument();
        expect(screen.getByText('Array Content')).toBeInTheDocument();
        expect(screen.getByText('Fragment Actions')).toBeInTheDocument();
    });

    it('calls onClose when clicking on overlay', () => {
        const onClose = jest.fn();

        render(
            <Modal isOpen={true} onClose={onClose}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
                <Modal.Actions>Actions</Modal.Actions>
            </Modal>,
        );

        const overlay = screen.getByTestId('modal-overlay');

        // Click on overlay itself → should call onClose
        fireEvent.click(overlay);

        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('does NOT call onClose when clicking inside modal container', () => {
        const onClose = jest.fn();

        render(
            <Modal isOpen={true} onClose={onClose}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
                <Modal.Actions>Actions</Modal.Actions>
            </Modal>,
        );

        const overlay = screen.getByTestId('modal-overlay');
        const container = overlay.querySelector('.modal-container');

        // Click inside modal container → should NOT call onClose
        if (container) {
            fireEvent.click(container);
        }

        expect(onClose).not.toHaveBeenCalled();
    });

    test('Shift+Tab on first focusable moves focus to last element', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>
                    <button>First</button>
                    <button>Last</button>
                </Modal.Content>
            </Modal>,
        );

        // there are 3 buttons actually, the first one is a close button inside the modal itself
        const [first, _, third] = screen.getAllByRole('button');

        // Focus the first element
        first.focus();
        expect(document.activeElement).toBe(first);

        // Press Shift+Tab → should wrap to last
        fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });

        expect(document.activeElement).toBe(third);
    });

    test('does not close when mousedown starts inside modal and ends outside', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container')!;
        const overlay = screen.getByTestId('modal-overlay');

        fireEvent.mouseDown(modalContainer); // inside
        fireEvent.click(overlay); // outside
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('closes when mousedown starts outside modal and ends outside', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>Content</Modal.Content>
            </Modal>,
        );

        const overlay = screen.getByTestId('modal-overlay');
        fireEvent.mouseDown(overlay); // outside
        fireEvent.click(overlay); // still outside
        expect(mockOnClose).toHaveBeenCalled();
    });

    test('body overflow stays hidden if another modal is still open', () => {
        const onClose1 = jest.fn();
        const onClose2 = jest.fn();
        const { rerender } = render(
            <>
                <Modal isOpen={true} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>,
        );
        expect(document.body.style.overflow).toBe('hidden');

        rerender(
            <>
                <Modal isOpen={false} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>,
        );
        // Should still be hidden because one modal is open
        expect(document.body.style.overflow).toBe('hidden');
    });

    test('focus trap does nothing when no focusable elements exist', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>No buttons here</Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container')!;
        fireEvent.keyDown(modalContainer, { key: 'Tab' }); // should not throw or change focus
    });

    test('applies default width and maxWidth when props are not provided', () => {
        render(
            <Modal isOpen={true} onClose={mockOnClose}>
                <Modal.Content>Default styles</Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container');
        expect(modalContainer).toHaveStyle({
            width: '80%',
            maxWidth: '600px',
        });
    });

    test('trapFocus early returns when key is not Tab', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>
                    <button>Focusable</button>
                </Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container')!;
        // Should return immediately without errors
        fireEvent.keyDown(modalContainer, { key: 'Enter' });
    });

    test('trapFocus returns when there are no focusable elements', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>No focusable elements here</Modal.Content>
            </Modal>,
        );

        const modalContainer = document.querySelector('.modal-container')!;
        fireEvent.keyDown(modalContainer, { key: 'Tab' }); // hits line 68
    });

    test('Shift+Tab on first wraps to last, Tab on last wraps to first', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Content>
                    <button>First</button>
                    <button>Last</button>
                </Modal.Content>
            </Modal>,
        );

        const [first, _, third] = screen.getAllByRole('button');

        // Shift+Tab (74–78)
        first.focus();
        fireEvent.keyDown(document.activeElement!, { key: 'Tab', shiftKey: true });
        expect(document.activeElement).toBe(third);

        // Tab (79–82)
        third.focus();
        fireEvent.keyDown(document.activeElement!, { key: 'Tab' });
        expect(document.activeElement).toBe(first);
    });
});
