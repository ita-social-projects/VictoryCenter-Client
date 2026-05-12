import { COMMON_TEXT_ADMIN } from '@/const/admin/common';
import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import { MainPagePublishModal } from './MainPagePublishModal';

jest.mock('@/components/admin/confirmation-modal/ConfirmationModal', () => ({
    ConfirmationModal: ({ isOpen, ...p }: any) =>
        isOpen ? (
            <div data-testid="confirmation-modal">
                <div data-testid="confirmation-title">{p.title}</div>
                <button data-testid="confirm-btn" onClick={p.onConfirm}>
                    {p.confirmText}
                </button>
                <button data-testid="cancel-btn" onClick={p.onCancel}>
                    {p.cancelText}
                </button>
                <button data-testid="close-btn" onClick={p.onClose}>
                    Close
                </button>
            </div>
        ) : null,
}));

describe('MainPagePublishModal', () => {
    const setup = (props: Partial<React.ComponentProps<typeof MainPagePublishModal>> = {}) => {
        const defaultProps = { isOpen: true, onConfirm: jest.fn(), onCancel: jest.fn() };
        return render(<MainPagePublishModal {...defaultProps} {...props} />);
    };

    it('does not render when isOpen=false', () => {
        setup({ isOpen: false });
        expect(screen.queryByTestId('confirmation-modal')).not.toBeInTheDocument();
    });

    it('renders ConfirmationModal with correct texts when open', () => {
        setup();
        expect(screen.getByTestId('confirmation-modal')).toBeInTheDocument();
        expect(screen.getByTestId('confirmation-title')).toHaveTextContent(COMMON_TEXT_ADMIN.QUESTION.PUBLISH_CHANGES);
        expect(screen.getByTestId('confirm-btn')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.YES);
        expect(screen.getByTestId('cancel-btn')).toHaveTextContent(COMMON_TEXT_ADMIN.BUTTON.NO);
    });

    it('calls onConfirm when confirm clicked', () => {
        const onConfirm = jest.fn();
        setup({ onConfirm });
        fireEvent.click(screen.getByTestId('confirm-btn'));
        expect(onConfirm).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when cancel clicked', () => {
        const onCancel = jest.fn();
        setup({ onCancel });
        fireEvent.click(screen.getByTestId('cancel-btn'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });

    it('calls onCancel when close clicked', () => {
        const onCancel = jest.fn();
        setup({ onCancel });
        fireEvent.click(screen.getByTestId('close-btn'));
        expect(onCancel).toHaveBeenCalledTimes(1);
    });
});
