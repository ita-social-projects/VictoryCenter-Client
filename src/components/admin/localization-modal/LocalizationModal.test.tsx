import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LocalizationModal } from './LocalizationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

jest.mock('@/components/admin/button/Button', () => ({
    Button: (props: any) => (
        <button {...props} data-testid={props['data-testid'] || 'button'}>
            {props.children}
        </button>
    ),
}));

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, onConfirm, onCancel }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <span>Are you sure?</span>
                <button data-testid="confirm-close" onClick={onConfirm}>
                    Yes
                </button>
                <button data-testid="cancel-close" onClick={onCancel}>
                    No
                </button>
            </div>
        ) : null,
}));

jest.mock('@/components/common/modal/Modal', () => {
    const Modal = ({ isOpen, children, onClose }: any) =>
        isOpen ? (
            <div data-testid="modal-root">
                <div
                    data-testid="modal-overlay"
                    onClick={onClose}
                    role="button"
                    tabIndex={0}
                    aria-label="Close modal"
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') onClose();
                    }}
                ></div>
                <div data-testid="modal-content-wrapper">{children}</div>
            </div>
        ) : null;

    Modal.Title = ({ children }: any) => <div data-testid="modal-title">{children}</div>;
    Modal.Content = ({ children }: any) => <div data-testid="modal-content">{children}</div>;
    Modal.Actions = ({ children }: any) => <div data-testid="modal-actions">{children}</div>;

    return { Modal };
});

describe('LocalizationModal', () => {
    const defaultProps = {
        isOpen: true,
        onClose: jest.fn(),
        title: 'Test Title',
        onSave: jest.fn(),
        isSubmitting: false,
        isFormValid: true,
        children: <div data-testid="child-form">Form Content</div>,
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly when open', () => {
        render(<LocalizationModal {...defaultProps} />);

        expect(screen.getByTestId('modal-root')).toBeInTheDocument();
        expect(screen.getByTestId('modal-title')).toHaveTextContent('Test Title');
        expect(screen.getByTestId('child-form')).toBeInTheDocument();
        expect(screen.getByTestId('save-localization-btn')).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.SAVE_TRANSLATION)).toBeInTheDocument();
    });

    it('does not render when closed', () => {
        render(<LocalizationModal {...defaultProps} isOpen={false} />);
        expect(screen.queryByTestId('modal-root')).not.toBeInTheDocument();
    });

    it('renders custom save button text if provided', () => {
        render(<LocalizationModal {...defaultProps} saveButtonText="Custom Save" />);
        expect(screen.getByText('Custom Save')).toBeInTheDocument();
    });

    it('calls onSave when save button is clicked', () => {
        render(<LocalizationModal {...defaultProps} />);

        fireEvent.click(screen.getByTestId('save-localization-btn'));
        expect(defaultProps.onSave).toHaveBeenCalledTimes(1);
    });

    it('disables save button when form is invalid', () => {
        render(<LocalizationModal {...defaultProps} isFormValid={false} />);

        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('disables save button when submitting', () => {
        render(<LocalizationModal {...defaultProps} isSubmitting={true} />);

        expect(screen.getByTestId('save-localization-btn')).toBeDisabled();
    });

    it('closes immediately if checkIsDirty is NOT provided', () => {
        const props = { ...defaultProps, checkIsDirty: undefined };
        render(<LocalizationModal {...props} />);

        fireEvent.click(screen.getByTestId('modal-overlay'));

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('closes immediately if checkIsDirty returns FALSE', () => {
        render(<LocalizationModal {...defaultProps} checkIsDirty={() => false} />);

        fireEvent.click(screen.getByTestId('modal-overlay'));

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('shows confirmation modal and prevents closing if checkIsDirty returns TRUE', () => {
        render(<LocalizationModal {...defaultProps} checkIsDirty={() => true} />);

        fireEvent.click(screen.getByTestId('modal-overlay'));

        expect(defaultProps.onClose).not.toHaveBeenCalled();

        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
    });

    it('closes modal after confirming data loss (Yes click)', () => {
        render(<LocalizationModal {...defaultProps} checkIsDirty={() => true} />);

        fireEvent.click(screen.getByTestId('modal-overlay'));

        fireEvent.click(screen.getByTestId('confirm-close'));

        expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
    });

    it('hides confirmation modal after cancelling (No click)', () => {
        render(<LocalizationModal {...defaultProps} checkIsDirty={() => true} />);

        fireEvent.click(screen.getByTestId('modal-overlay'));

        fireEvent.click(screen.getByTestId('cancel-close'));

        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
        expect(defaultProps.onClose).not.toHaveBeenCalled();
    });
});
