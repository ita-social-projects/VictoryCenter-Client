import React, { ReactNode } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { FundsExpendituresRecordModal } from './FundsExpendituresRecordModal';
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
    className?: string;
    maxWidth?: string;
}

jest.mock('@/components/common/modal/Modal', () => ({
    Modal: ({ children, isOpen, className, maxWidth }: ModalProps) => (
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

describe('FundsExpendituresRecordModal', () => {
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

    it('renders content and buttons', () => {
        render(<FundsExpendituresRecordModal {...defaultProps} />);
        expect(screen.getByTestId('modal')).toBeInTheDocument();
        expect(screen.getByText('Test Modal Title')).toBeInTheDocument();
        expect(screen.getByText('Test Subtitle')).toBeInTheDocument();
        expect(screen.getByText('Submit')).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL)).toBeInTheDocument();
        expect(screen.getByTestId('modal-children')).toBeInTheDocument();
    });

    it('calls submit handler when submit is clicked', async () => {
        const onSubmit = jest.fn();
        render(<FundsExpendituresRecordModal {...defaultProps} onSubmit={onSubmit} />);
        await userEvent.click(screen.getByText('Submit'));
        expect(onSubmit).toHaveBeenCalledTimes(1);
    });

    it('calls onClose directly when not dirty', async () => {
        const onClose = jest.fn();
        render(<FundsExpendituresRecordModal {...defaultProps} onClose={onClose} isDirty={false} />);
        await userEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('opens confirmation and confirms close when dirty', async () => {
        const onClose = jest.fn();
        render(<FundsExpendituresRecordModal {...defaultProps} onClose={onClose} isDirty={true} />);

        await userEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));
        expect(screen.getByTestId('confirmation-modal')).toHaveAttribute('open');

        fireEvent.click(screen.getByText('Confirm'));
        expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('opens confirmation and cancels close when dirty', async () => {
        const onClose = jest.fn();
        render(<FundsExpendituresRecordModal {...defaultProps} onClose={onClose} isDirty={true} />);

        await userEvent.click(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.CANCEL));
        fireEvent.click(screen.getAllByText('Cancel')[0]);

        const confirmationModal = screen.getByTestId('confirmation-modal') as HTMLDialogElement;
        expect(confirmationModal.open).toBe(false);
        expect(onClose).not.toHaveBeenCalled();
    });

    it('disables submit button', () => {
        render(<FundsExpendituresRecordModal {...defaultProps} isSubmitDisabled={true} />);
        expect(screen.getByText('Submit')).toBeDisabled();
    });
});
