import { render, screen, fireEvent } from '@testing-library/react';
import { ConfirmationModal, ConfirmationModalProps } from './ConfirmationModal';
import { COMMON_TEXT_ADMIN } from '@/const/admin/common';

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
});
