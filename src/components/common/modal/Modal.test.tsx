import React from 'react';
import {render, screen, fireEvent, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {Modal} from './Modal';

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
            </Modal>
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
            </Modal>
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
            </Modal>
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
            </Modal>
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
            </Modal>
        );
        await userEvent.click(screen.getByTestId('modal-overlay'));
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('calls onClose when clicking close button', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
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
            </Modal>
        );
        fireEvent.keyDown(document, {key: 'Escape'});
        await waitFor(() => {
            expect(mockOnClose).toHaveBeenCalledTimes(1);
        });
    });

    test('calls onClose when pressing Enter or Space on overlay', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
        );
        const overlay = screen.getByTestId('modal-overlay');
        fireEvent.keyDown(overlay, {key: 'Enter'});
        expect(mockOnClose).toHaveBeenCalledTimes(1);
        jest.clearAllMocks();
        fireEvent.keyDown(overlay, {key: ' '});
        expect(mockOnClose).toHaveBeenCalledTimes(1);
    });

    test('does not call onClose when clicking inside modal container', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
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
            </Modal>
        );
        const modalContainer = document.querySelector('.modal-container');
        fireEvent.keyDown(modalContainer!, {key: 'Enter'});
        fireEvent.keyDown(modalContainer!, {key: ' '});
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('renders without title, content, or actions when not provided', () => {
        render(<Modal {...defaultProps} />);
        expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
        expect(document.querySelector('.modal-header-text')?.textContent).toBe("");
        expect(document.querySelector('.modal-body')?.textContent).toBe("");
        expect(document.querySelector('.modal-footer')?.textContent).toBe("");
    });

    test('adds and removes keydown event listener and body overflow based on isOpen', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');
        const {rerender} = render(<Modal {...defaultProps} />);
        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(document.body.style.overflow).toBe('hidden');
        rerender(<Modal {...defaultProps} isOpen={false}/>);
        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
        expect(document.body.style.overflow).not.toBe('hidden');
    });


    test('does not call onClose for other keys on overlay', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
            </Modal>
        );
        const overlay = screen.getByTestId('modal-overlay');
        fireEvent.keyDown(overlay, {key: 'Tab'});
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('does not call onClose for other keys in modal container', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
            </Modal>
        );
        const modalContainer = document.querySelector('.modal-container');
        fireEvent.keyDown(modalContainer!, {key: 'Tab'});
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('restores previous body overflow style after close', () => {
        document.body.style.overflow = 'scroll';
        const {rerender} = render(<Modal {...defaultProps} isOpen={true}/>);
        expect(document.body.style.overflow).toBe('hidden');
        rerender(<Modal {...defaultProps} isOpen={false}/>);
        expect(document.body.style.overflow).toBe('scroll');
    });

    test('multiple modals do not interfere with each other', () => {
        const onClose1 = jest.fn();
        const onClose2 = jest.fn();
        const {rerender} = render(
            <>
                <Modal isOpen={true} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>
        );
        // Both overlays present
        expect(document.querySelectorAll('.modal-overlay').length).toBe(2);
        // Close one
        rerender(
            <>
                <Modal isOpen={false} onClose={onClose1} />
                <Modal isOpen={true} onClose={onClose2} />
            </>
        );
        expect(document.querySelectorAll('.modal-overlay').length).toBe(1);
        // Close both
        rerender(
            <>
                <Modal isOpen={false} onClose={onClose1} />
                <Modal isOpen={false} onClose={onClose2} />
            </>
        );
        expect(document.querySelectorAll('.modal-overlay').length).toBe(0);
    });

    test('handles Modal.Title/Content/Actions as fragments and arrays', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title><><span>Fragment Title</span></></Modal.Title>
                <Modal.Content>{[<span key="c">Array Content</span>]}</Modal.Content>
                <Modal.Actions><><span>Fragment Actions</span></></Modal.Actions>
            </Modal>
        );
        expect(screen.getByText('Fragment Title')).toBeInTheDocument();
        expect(screen.getByText('Array Content')).toBeInTheDocument();
        expect(screen.getByText('Fragment Actions')).toBeInTheDocument();
    });
});
