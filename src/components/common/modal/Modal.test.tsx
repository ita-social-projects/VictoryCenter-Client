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
    });

    test('does not render when isOpen is false', () => {
        render(
            <Modal {...defaultProps} isOpen={false}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
                <Modal.Actions>Actions</Modal.Actions>
            </Modal>
        );

        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    test('renders modal with all sub-components when isOpen is true', () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Modal Title</Modal.Title>
                <Modal.Content>Modal Content</Modal.Content>
                <Modal.Actions>Modal Actions</Modal.Actions>
            </Modal>
        );

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText('Modal Title')).toBeInTheDocument();
        expect(screen.getByText('Modal Content')).toBeInTheDocument();
        expect(screen.getByText('Modal Actions')).toBeInTheDocument();
    });

    test('applies correct styles based on width and maxWidth props', () => {
        render(
            <Modal {...defaultProps} width="500px" maxWidth="800px">
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
        );

        const modalContainer = screen.getByRole('dialog');
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

        const modalContainer = screen.getByRole('dialog');
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

    test('calls onClose when clicking close icon', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
        );

        await userEvent.click(screen.getByAltText('close-icon'));
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

    test('does not call onClose when clicking inside modal', async () => {
        render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
        );

        await userEvent.click(screen.getByRole('dialog'));
        expect(mockOnClose).not.toHaveBeenCalled();
    });

    test('sets and unsets body overflow style when modal opens and closes', () => {
        const {rerender} = render(
            <Modal {...defaultProps}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
        );

        expect(document.body.style.overflow).toBe('hidden');

        rerender(
            <Modal {...defaultProps} isOpen={false}>
                <Modal.Title>Title</Modal.Title>
                <Modal.Content>Content</Modal.Content>
            </Modal>
        );

        expect(document.body.style.overflow).toBe('unset');
    });

    test('renders without title, content, or actions when not provided', () => {
        render(<Modal {...defaultProps} />);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.queryByText('Modal Title')).not.toBeInTheDocument();
        expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
        expect(screen.queryByText('Modal Actions')).not.toBeInTheDocument();
    });

    test('adds and removes keydown event listener based on isOpen', () => {
        const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
        const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

        const {rerender} = render(<Modal {...defaultProps} />);

        expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

        rerender(<Modal {...defaultProps} isOpen={false}/>);

        expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));
    });
});
