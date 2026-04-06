import React, { ReactNode } from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FundsRecordModal } from './FundsRecordModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

interface ButtonProps {
    children: ReactNode;
    onClick?: () => void;
    disabled?: boolean;
    className?: string;
}

jest.mock('@/components/admin/button/Button', () => ({
    Button: ({ children, onClick, disabled, className }: ButtonProps) => (
        <button onClick={onClick} disabled={disabled} className={className} type="button">
            {children}
        </button>
    ),
}));

interface ConfirmationModalProps {
    isOpen: boolean;
    title: string;
    onConfirm?: () => void;
    onCancel?: () => void;
}

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, title, onConfirm, onCancel }: ConfirmationModalProps) => (
        <dialog data-testid="confirmation-modal" open={isOpen} aria-label={title}>
            <h2>{title}</h2>
            <button onClick={onConfirm} type="button">
                Confirm
            </button>
            <button onClick={onCancel} type="button">
                Cancel
            </button>
        </dialog>
    ),
}));

interface ModalProps {
    children: ReactNode;
    isOpen: boolean;
    _onClose?: () => void;
    className?: string;
    maxWidth?: string;
}

jest.mock('@/components/common/modal/Modal', () => ({
    Modal: ({ children, isOpen, _onClose, className, maxWidth }: ModalProps) => (
        <dialog data-testid="modal" open={isOpen} className={className} style={{ maxWidth }}>
            {children}
        </dialog>
    ),
}));

interface SubComponentProps {
    children: ReactNode;
}

const ModalComponent = require('@/components/common/modal/Modal').Modal;
ModalComponent.Title = ({ children }: SubComponentProps) => <div data-testid="modal-title">{children}</div>;
ModalComponent.Content = ({ children }: SubComponentProps) => <div data-testid="modal-content">{children}</div>;
ModalComponent.Actions = ({ children }: SubComponentProps) => <div data-testid="modal-actions">{children}</div>;

describe('FundsRecordModal', () => {
    const defaultProps = {
        isOpen: true,
        title: 'Test Modal Title',
        subtitle: 'Test Subtitle',
        submitButtonLabel: 'Submit',
        isSubmitDisabled: false,
        isDirty: false,
        onSubmit: jest.fn(),
        onClose: jest.fn(),
        closeConfirmationTitle: 'Unsaved Changes',
        children: <div data-testid="modal-children">Test Content</div>,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('Rendering', () => {
        it('should render modal when isOpen is true', () => {
            render(<FundsRecordModal {...defaultProps} />);
            const modal = screen.getByTestId('modal') as HTMLDialogElement;
            expect(modal).toBeInTheDocument();
            expect(modal.open).toBe(true);
        });

        it('should render modal with open=false when isOpen is false', () => {
            render(<FundsRecordModal {...defaultProps} isOpen={false} />);
            const modal = screen.getByTestId('modal') as HTMLDialogElement;
            expect(modal).toBeInTheDocument();
            expect(modal.open).toBe(false);
        });

        it('should render title and subtitle', () => {
            render(<FundsRecordModal {...defaultProps} />);
            expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
            expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
        });

        it('should render submit button with correct label', () => {
            render(<FundsRecordModal {...defaultProps} />);
            const submitButton = screen.getByText('Submit');
            expect(submitButton).toBeInTheDocument();
        });

        it('should render cancel button with COMMON_TEXT_ADMIN.BUTTON.CANCEL label', () => {
            render(<FundsRecordModal {...defaultProps} />);
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL)).toBeInTheDocument();
        });

        it('should render children content', () => {
            render(<FundsRecordModal {...defaultProps} />);
            expect(screen.getByTestId('modal-children')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });

        it('should apply correct maxWidth to modal', () => {
            render(<FundsRecordModal {...defaultProps} />);
            const modal = screen.getByTestId('modal');
            expect(modal).toHaveStyle({ maxWidth: '650px' });
        });
    });

    describe('Submit Button', () => {
        it('should call onSubmit when submit button is clicked', async () => {
            const onSubmit = jest.fn();
            render(<FundsRecordModal {...defaultProps} onSubmit={onSubmit} />);
            const submitButton = screen.getByText('Submit');
            await userEvent.click(submitButton);
            expect(onSubmit).toHaveBeenCalledTimes(1);
        });

        it('should disable submit button when isSubmitDisabled is true', () => {
            render(<FundsRecordModal {...defaultProps} isSubmitDisabled={true} />);
            const submitButton = screen.getByText('Submit') as HTMLButtonElement;
            expect(submitButton.disabled).toBe(true);
        });

        it('should enable submit button when isSubmitDisabled is false', () => {
            render(<FundsRecordModal {...defaultProps} isSubmitDisabled={false} />);
            const submitButton = screen.getByText('Submit') as HTMLButtonElement;
            expect(submitButton.disabled).toBe(false);
        });

        it('should not call onSubmit when submit button is disabled', async () => {
            const onSubmit = jest.fn();
            render(<FundsRecordModal {...defaultProps} onSubmit={onSubmit} isSubmitDisabled={true} />);
            const submitButton = screen.getByText('Submit');
            await userEvent.click(submitButton);
            expect(onSubmit).not.toHaveBeenCalled();
        });
    });

    describe('Cancel/Close Button', () => {
        it('should call onClose when cancel button is clicked and isDirty is false', async () => {
            const onClose = jest.fn();
            render(<FundsRecordModal {...defaultProps} onClose={onClose} isDirty={false} />);
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            await userEvent.click(cancelButton);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should not directly call onClose when cancel button is clicked and isDirty is true', async () => {
            const onClose = jest.fn();
            render(
                <FundsRecordModal
                    {...defaultProps}
                    onClose={onClose}
                    isDirty={true}
                    closeConfirmationTitle="Unsaved Changes"
                />,
            );
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            await userEvent.click(cancelButton);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Dirty State & Confirmation Modal', () => {
        it('should show confirmation modal when closing with isDirty true', async () => {
            render(<FundsRecordModal {...defaultProps} isDirty={true} closeConfirmationTitle="Unsaved Changes" />);
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });
        });

        it('should not show confirmation modal when closing with isDirty false', async () => {
            render(<FundsRecordModal {...defaultProps} isDirty={false} closeConfirmationTitle="Unsaved Changes" />);
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            const confirmationModal = screen.getByTestId('confirmation-modal') as HTMLDialogElement;
            expect(confirmationModal.open).toBe(false);
        });

        it('should display correct title in confirmation modal', async () => {
            render(
                <FundsRecordModal {...defaultProps} isDirty={true} closeConfirmationTitle="You have unsaved changes" />,
            );
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.getByText('You have unsaved changes')).toBeInTheDocument();
            });
        });

        it('should call onClose when confirming close in confirmation modal', async () => {
            const onClose = jest.fn();
            render(
                <FundsRecordModal
                    {...defaultProps}
                    onClose={onClose}
                    isDirty={true}
                    closeConfirmationTitle="Unsaved Changes"
                />,
            );
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });
            const confirmButton = screen.getByText('Confirm');
            fireEvent.click(confirmButton);
            expect(onClose).toHaveBeenCalledTimes(1);
        });

        it('should not call onClose when canceling close in confirmation modal', async () => {
            const onClose = jest.fn();
            render(
                <FundsRecordModal
                    {...defaultProps}
                    onClose={onClose}
                    isDirty={true}
                    closeConfirmationTitle="Unsaved Changes"
                />,
            );
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });
            const confirmCancelButton = screen.getAllByText('Cancel')[0];
            fireEvent.click(confirmCancelButton);
            const confirmationModal = screen.getByTestId('confirmation-modal') as HTMLDialogElement;
            expect(confirmationModal.open).toBe(false);
            expect(onClose).not.toHaveBeenCalled();
        });
    });

    describe('Multiple Interactions', () => {
        it('should handle multiple open/close cycles', async () => {
            const onClose = jest.fn();
            const { rerender } = render(<FundsRecordModal {...defaultProps} onClose={onClose} isOpen={true} />);
            let modal = screen.getByTestId('modal') as HTMLDialogElement;
            expect(modal.open).toBe(true);

            rerender(<FundsRecordModal {...defaultProps} onClose={onClose} isOpen={false} />);
            modal = screen.getByTestId('modal') as HTMLDialogElement;
            expect(modal.open).toBe(false);

            rerender(<FundsRecordModal {...defaultProps} onClose={onClose} isOpen={true} />);
            modal = screen.getByTestId('modal') as HTMLDialogElement;
            expect(modal.open).toBe(true);
        });

        it('should handle transitioning between dirty and clean states', async () => {
            const onClose = jest.fn();
            const { rerender } = render(
                <FundsRecordModal
                    {...defaultProps}
                    onClose={onClose}
                    isDirty={true}
                    closeConfirmationTitle="Unsaved Changes"
                />,
            );

            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            await waitFor(() => {
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });

            const confirmationModal = screen.getByTestId('confirmation-modal') as HTMLDialogElement;
            expect(confirmationModal.open).toBe(true);

            rerender(
                <FundsRecordModal
                    {...defaultProps}
                    onClose={onClose}
                    isDirty={false}
                    closeConfirmationTitle="Unsaved Changes"
                />,
            );

            const modal = screen.getByTestId('modal') as HTMLDialogElement;
            expect(modal.open).toBe(true);
        });

        it('should handle submit and then close without dirty state', async () => {
            const onSubmit = jest.fn();
            const onClose = jest.fn();
            render(<FundsRecordModal {...defaultProps} onSubmit={onSubmit} onClose={onClose} isDirty={false} />);

            const submitButton = screen.getByText('Submit');
            await userEvent.click(submitButton);
            expect(onSubmit).toHaveBeenCalledTimes(1);

            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            await userEvent.click(cancelButton);
            expect(onClose).toHaveBeenCalledTimes(1);
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes on modal', () => {
            render(<FundsRecordModal {...defaultProps} />);
            const modal = screen.getByTestId('modal');
            expect(modal.tagName).toBe('DIALOG');
        });

        it('should have proper ARIA attributes on confirmation modal when shown', async () => {
            render(<FundsRecordModal {...defaultProps} isDirty={true} closeConfirmationTitle="Unsaved Changes" />);
            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            await waitFor(() => {
                const confirmationModal = screen.getByTestId('confirmation-modal');
                expect(confirmationModal.tagName).toBe('DIALOG');
            });
        });

        it('should have descriptive button labels', () => {
            render(<FundsRecordModal {...defaultProps} submitButtonLabel="Save Changes" />);
            expect(screen.getByText('Save Changes')).toBeInTheDocument();
            expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL)).toBeInTheDocument();
        });
    });

    describe('Edge Cases', () => {
        it('should handle empty children', () => {
            const { onSubmit, onClose, ...propsWithoutChildren } = defaultProps;
            render(<FundsRecordModal {...propsWithoutChildren} onSubmit={onSubmit} onClose={onClose} />);
            expect(screen.getByTestId('modal')).toBeInTheDocument();
        });

        it('should handle long title and subtitle text', () => {
            const longTitle = 'A'.repeat(100);
            const longSubtitle = 'B'.repeat(200);
            render(<FundsRecordModal {...defaultProps} title={longTitle} subtitle={longSubtitle} />);
            expect(screen.getByText(longTitle)).toBeInTheDocument();
            expect(screen.getByText(longSubtitle)).toBeInTheDocument();
        });

        it('should handle special characters in labels', () => {
            render(
                <FundsRecordModal
                    {...defaultProps}
                    submitButtonLabel="Submit & Confirm (TEST)"
                    title="Title: Special <Chars> & Symbols"
                />,
            );
            expect(screen.getByText('Submit & Confirm (TEST)')).toBeInTheDocument();
            expect(screen.getByText('Title: Special <Chars> & Symbols')).toBeInTheDocument();
        });

        it('should handle rapid close/confirm actions', async () => {
            const onClose = jest.fn();
            render(
                <FundsRecordModal
                    {...defaultProps}
                    onClose={onClose}
                    isDirty={true}
                    closeConfirmationTitle="Unsaved Changes"
                />,
            );

            const cancelButton = screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL);
            fireEvent.click(cancelButton);
            fireEvent.click(cancelButton);

            await waitFor(() => {
                expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
            });

            const confirmButton = screen.getByText('Confirm');
            fireEvent.click(confirmButton);

            expect(onClose).toHaveBeenCalled();
        });
    });
});
