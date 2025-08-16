import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QuestionModal } from './QuestionModal';
import { COMMON_TEXT_ADMIN } from '../../../const/admin/common';

describe('QuestionModal', () => {
    const defaultProps = {
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

    test('renders modal with title and content', () => {
        render(<QuestionModal {...defaultProps} />);
        expect(screen.getByText('Delete item?')).toBeInTheDocument();
        expect(screen.getByText('Are you sure you want to delete this?')).toBeInTheDocument();
        expect(screen.getByText('Yes, delete')).toBeInTheDocument();
        expect(screen.getByText('Cancel')).toBeInTheDocument();
    });

    test('does not render content when it is null', () => {
        render(<QuestionModal {...defaultProps} content={null} />);
        expect(screen.queryByText('Are you sure you want to delete this?')).not.toBeInTheDocument();
    });

    test('calls onConfirm when confirm button is clicked', () => {
        render(<QuestionModal {...defaultProps} />);
        const confirmButton = screen.getByText('Yes, delete');
        fireEvent.click(confirmButton);
        expect(defaultProps.onConfirm).toHaveBeenCalled();
    });

    test('calls onCancel when cancel button is clicked', () => {
        render(<QuestionModal {...defaultProps} />);
        const cancelButton = screen.getByText('Cancel');
        fireEvent.click(cancelButton);
        expect(defaultProps.onCancel).toHaveBeenCalled();
    });

    test('disables buttons when isSubmitting is true', () => {
        render(<QuestionModal {...defaultProps} isButtonsDisabled={true} />);
        const confirmButton = screen.getByText('Yes, delete');
        const cancelButton = screen.getByText('Cancel');
        expect(confirmButton).toBeDisabled();
        expect(cancelButton).toBeDisabled();
    });

    test('uses default cancel text when cancelText is empty', () => {
        render(<QuestionModal {...defaultProps} cancelText="" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeInTheDocument();
        expect(screen.queryByText('Cancel')).not.toBeInTheDocument();
    });

    test('uses default confirm text when confirmText is empty', () => {
        render(<QuestionModal {...defaultProps} confirmText="" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeInTheDocument();
        expect(screen.queryByText('Yes, delete')).not.toBeInTheDocument();
    });

    test('uses default texts when both cancelText and confirmText are empty', () => {
        render(<QuestionModal {...defaultProps} cancelText="" confirmText="" />);
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.NO)).toBeInTheDocument();
        expect(screen.getByText(COMMON_TEXT_ADMIN.BUTTON.YES)).toBeInTheDocument();
    });
});
