import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ConfirmationModal, ConfirmationModalProps } from './ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

describe('ConfirmationModal', () => {
    const defaultProps: ConfirmationModalProps = {
        isOpen: true,
        onClose: jest.fn(),
        title: 'Delete item?',
        content: 'Are you sure you want to delete this?',
        confirmText: 'Yes, delete',
        cancelText: 'Cancel',
        onConfirm: jest.fn(),
        onCancel: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
        // Reset body overflow after each test
        document.body.style.overflow = '';
    });

    it('renders modal with title and content', () => {
        render(<ConfirmationModal {...defaultProps} />);
        expect(screen.getByText('Delete item?')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();
        expect(screen.getByText('Yes, delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    it('does not render content when it is null', () => {
        render(<ConfirmationModal {...defaultProps} content={null} />);
        expect(screen.queryByText('Are you sure you want to delete this?')).not.toBeInTheDocument();
    });

    it('calls onConfirm when confirm button is clicked', () => {
        render(<ConfirmationModal {...defaultProps} />);
        const confirmButton = screen.getByText('Yes, delete');
        fireEvent.click(confirmButton);
        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    it('calls onCancel when cancel button is clicked', () => {
        render(<ConfirmationModal {...defaultProps} />);
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    it('disables buttons when isSubmitting is true', () => {
        render(<ConfirmationModal {...defaultProps} isButtonsDisabled={true} />);
        const confirmButton = screen.getByText('Yes, delete');
        const cancelButton = screen.getByText('Cancel');
        expect(confirmButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });

    it('uses default cancel text when cancelText is empty', () => {
        render(<ConfirmationModal {...defaultProps} cancelText="" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeInTheDocument();
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    it('uses default confirm text when confirmText is empty', () => {
        render(<ConfirmationModal {...defaultProps} confirmText="" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeInTheDocument();
        expect(screen.queryByText('Yes, delete')).not.toBeInTheDocument();
    });

    it('uses default texts when both cancelText and confirmText are empty', () => {
        render(<ConfirmationModal {...defaultProps} cancelText="" confirmText="" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeInTheDocument();
    });

    it('uses default content value when content prop is not provided', () => {
        const propsWithoutContent: ConfirmationModalProps = {
            isOpen: true,
            onClose: jest.fn(),
            title: 'Delete item?',
            confirmText: 'Yes, delete',
            cancelText: 'Cancel',
            onConfirm: jest.fn(),
            onCancel: jest.fn(),
        };

        render(<ConfirmationModal {...propsWithoutContent} />);
        expect(screen.queryByText('Are you sure you want to delete this?')).not.toBeInTheDocument();
    });

    // Additional comprehensive tests
    describe('Modal visibility', () => {
        it('does not render when isOpen is false', () => {
            render(<ConfirmationModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByText('Delete item?')).not.toBeInTheDocument();
            expect(screen.queryByTestId('modal-overlay')).not.toBeInTheDocument();
        });

        it('renders when isOpen is true', () => {
            render(<ConfirmationModal {...defaultProps} isOpen={true} />);
            expect(screen.getByTestId('modal-overlay')).toBeInTheDocument();
            expect(screen.getByText('Delete item?')).toBeInTheDocument();
        });

        it('toggles visibility correctly', () => {
            const { rerender } = render(<ConfirmationModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByText('Delete item?')).not.toBeInTheDocument();

            rerender(<ConfirmationModal {...defaultProps} isOpen={true} />);
            expect(screen.getByText('Delete item?')).toBeInTheDocument();

            rerender(<ConfirmationModal {...defaultProps} isOpen={false} />);
            expect(screen.queryByText('Delete item?')).not.toBeInTheDocument();
        });
    });

    describe('Button interactions', () => {
        it('calls onConfirm multiple times when confirm button is clicked multiple times', () => {
            render(<ConfirmationModal {...defaultProps} />);
            const confirmButton = screen.getByText('Yes, delete');

            fireEvent.click(confirmButton);
            fireEvent.click(confirmButton);
            fireEvent.click(confirmButton);

            expect(defaultProps.onConfirm).toHaveBeenCalledTimes(3);
        });

        it('calls onCancel multiple times when cancel button is clicked multiple times', () => {
            render(<ConfirmationModal {...defaultProps} />);
            const cancelButton = screen.getByText('Cancel');

            fireEvent.click(cancelButton);
            fireEvent.click(cancelButton);

            expect(defaultProps.onCancel).toHaveBeenCalledTimes(2);
        });

        it('does not call onConfirm when confirm button is disabled', () => {
            render(<ConfirmationModal {...defaultProps} isButtonsDisabled={true} />);
            const confirmButton = screen.getByText('Yes, delete');

            fireEvent.click(confirmButton);

            expect(defaultProps.onConfirm).not.toHaveBeenCalled();
        });

        it('does not call onCancel when cancel button is disabled', () => {
            render(<ConfirmationModal {...defaultProps} isButtonsDisabled={true} />);
            const cancelButton = screen.getByText('Cancel');

            fireEvent.click(cancelButton);

            expect(defaultProps.onCancel).not.toHaveBeenCalled();
        });
    });

    describe('Keyboard interactions', () => {
        it('activates confirm button when Enter is pressed while focused', async () => {
            const user = userEvent.setup();
            render(<ConfirmationModal {...defaultProps} />);

            const confirmButton = screen.getByText('Yes, delete');
            confirmButton.focus();

            await user.keyboard('{Enter}');

            expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
        });

        it('activates cancel button when Enter is pressed while focused', async () => {
            const user = userEvent.setup();
            render(<ConfirmationModal {...defaultProps} />);

            const cancelButton = screen.getByText('Cancel');
            cancelButton.focus();

            await user.keyboard('{Enter}');

            expect(defaultProps.onCancel).toHaveBeenCalledTimes(1);
        });

        it('activates confirm button when Space is pressed while focused', async () => {
            const user = userEvent.setup();
            render(<ConfirmationModal {...defaultProps} />);

            const confirmButton = screen.getByText('Yes, delete');
            confirmButton.focus();

            await user.keyboard(' ');

            expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
        });
    });

    describe('Modal close functionality', () => {
        it('calls onClose when close button is clicked', () => {
            render(<ConfirmationModal {...defaultProps} />);

            const closeButton = screen.getByLabelText('Close modal');
            fireEvent.click(closeButton);

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });

        it('calls onClose when overlay is clicked', () => {
            render(<ConfirmationModal {...defaultProps} />);

            const overlay = screen.getByTestId('modal-overlay');
            fireEvent.click(overlay);

            expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        });

        it('does not close when clicking inside modal content', () => {
            render(<ConfirmationModal {...defaultProps} />);

            const title = screen.getByText('Delete item?');
            fireEvent.click(title);

            expect(defaultProps.onClose).not.toHaveBeenCalled();
        });
    });

    describe('Title variations', () => {
        it('handles empty title', () => {
            render(<ConfirmationModal {...defaultProps} title="" />);
            expect(screen.getByText('Yes, delete')).toBeInTheDocument();
            expect(screen.getByText('Cancel')).toBeInTheDocument();
        });

        it('handles very long title', () => {
            const longTitle = 'Very '.repeat(50) + 'Long Title';
            render(<ConfirmationModal {...defaultProps} title={longTitle} />);
            expect(screen.getByText(longTitle)).toBeInTheDocument();
        });

        it('handles special characters in title', () => {
            const specialTitle = 'Title with <special> & "characters"';
            render(<ConfirmationModal {...defaultProps} title={specialTitle} />);
            expect(screen.getByText(specialTitle)).toBeInTheDocument();
        });
    });

    describe('Button text variations', () => {
        it('handles null confirmText', () => {
            render(<ConfirmationModal {...defaultProps} confirmText={null as any} />);
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeInTheDocument();
        });

        it('handles null cancelText', () => {
            render(<ConfirmationModal {...defaultProps} cancelText={null as any} />);
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeInTheDocument();
        });

        it('handles undefined confirmText', () => {
            render(<ConfirmationModal {...defaultProps} confirmText={undefined} />);
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeInTheDocument();
        });

        it('handles undefined cancelText', () => {
            render(<ConfirmationModal {...defaultProps} cancelText={undefined} />);
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeInTheDocument();
        });

        it('handles very long button texts', () => {
            const longConfirmText = 'Very '.repeat(20) + 'Long Confirm Text';
            const longCancelText = 'Very '.repeat(20) + 'Long Cancel Text';

            render(<ConfirmationModal {...defaultProps} confirmText={longConfirmText} cancelText={longCancelText} />);

            expect(screen.getByText(longConfirmText)).toBeInTheDocument();
            expect(screen.getByText(longCancelText)).toBeInTheDocument();
        });
    });

    describe('Body scroll behavior', () => {
        it('disables body scroll when modal is open', () => {
            render(<ConfirmationModal {...defaultProps} isOpen={true} />);
            expect(document.body.style.overflow).toBe('hidden');
        });

        it('does not disable body scroll when modal is closed', () => {
            render(<ConfirmationModal {...defaultProps} isOpen={false} />);
            expect(document.body.style.overflow).not.toBe('hidden');
        });

        it('restores original body overflow when modal closes', () => {
            document.body.style.overflow = 'scroll';

            const { rerender } = render(<ConfirmationModal {...defaultProps} isOpen={true} />);
            expect(document.body.style.overflow).toBe('hidden');

            rerender(<ConfirmationModal {...defaultProps} isOpen={false} />);
            expect(document.body.style.overflow).toBe('scroll');
        });
    });

    describe('Component cleanup', () => {
        it('removes event listeners when component unmounts', () => {
            const { unmount } = render(<ConfirmationModal {...defaultProps} />);

            const removeEventListenerSpy = jest.spyOn(document, 'removeEventListener');

            unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function));

            removeEventListenerSpy.mockRestore();
        });

        it('restores body overflow when component unmounts', () => {
            document.body.style.overflow = 'auto';

            const { unmount } = render(<ConfirmationModal {...defaultProps} />);
            expect(document.body.style.overflow).toBe('hidden');

            unmount();
            expect(document.body.style.overflow).toBe('auto');
        });
    });
});
